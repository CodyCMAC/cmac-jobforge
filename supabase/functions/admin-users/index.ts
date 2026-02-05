// Lovable Cloud backend function: admin user management
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

type Role = "admin" | "manager" | "member";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
    if (!token) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Service role client (for admin operations)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Validate caller identity from JWT
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const caller = userData.user;
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({} as any));
    const action = (body?.action ?? "list") as string;

    if (action === "list") {
      const page = Number(body?.page ?? 1);
      const perPage = Math.min(200, Math.max(1, Number(body?.perPage ?? 200)));

      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) return json({ error: error.message }, 400);

      const authUsers = data.users ?? [];
      const userIds = authUsers.map((u) => u.id);

      const { data: roles } = userIds.length
        ? await adminClient.from("user_roles").select("user_id, role").in("user_id", userIds)
        : { data: [] as Array<{ user_id: string; role: Role }> };

      const roleByUserId = new Map<string, Role>();
      for (const r of roles ?? []) {
        // If multiple rows exist, keep the first seen.
        if (!roleByUserId.has(r.user_id)) roleByUserId.set(r.user_id, r.role as Role);
      }

      const users = authUsers.map((u) => {
        const fullName =
          (u.user_metadata as any)?.full_name ??
          (u.user_metadata as any)?.name ??
          null;

        return {
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at ?? null,
          last_sign_in_at: (u as any).last_sign_in_at ?? null,
          full_name: fullName,
          role: roleByUserId.get(u.id) ?? ("member" as Role),
        };
      });

      return json({ users });
    }

    if (action === "update") {
      const userId = String(body?.userId ?? "");
      const role = String(body?.role ?? "") as Role;
      const fullName = body?.fullName;

      if (!userId) return json({ error: "Missing userId" }, 400);
      if (role !== "admin" && role !== "manager" && role !== "member") {
        return json({ error: "Invalid role" }, 400);
      }

      // Prevent self-demotion (keeps at least one admin able to manage users)
      if (userId === caller.id && role !== "admin") {
        return json({ error: "You cannot remove your own admin role" }, 400);
      }

      // Update role (enforce a single role row by clearing then inserting)
      const { error: deleteErr } = await adminClient.from("user_roles").delete().eq("user_id", userId);
      if (deleteErr) return json({ error: deleteErr.message }, 400);

      const { error: insertErr } = await adminClient.from("user_roles").insert({ user_id: userId, role });
      if (insertErr) return json({ error: insertErr.message }, 400);

      // Update display name (auth user metadata)
      if (typeof fullName === "string") {
        const { data: existing, error: getErr } = await adminClient.auth.admin.getUserById(userId);
        if (getErr) return json({ error: getErr.message }, 400);

        const currentMeta = (existing.user?.user_metadata as Record<string, unknown>) ?? {};
        const nextMeta = { ...currentMeta, full_name: fullName };

        const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: nextMeta,
        });
        if (updateErr) return json({ error: updateErr.message }, 400);
      }

      return json({ ok: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
