// deno-lint-ignore-file no-explicit-any
// Lovable Cloud backend function: admin user management, invites, and audit
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

interface AuditEntry {
  action: string;
  target_user_id: string;
  target_user_email?: string | null;
  actor_user_id: string;
  actor_email?: string | null;
  old_value?: unknown;
  new_value?: unknown;
  details?: string;
}

async function insertAudit(client: any, entry: AuditEntry) {
  await client.from("admin_audit_log").insert({
    action: entry.action,
    target_user_id: entry.target_user_id,
    target_user_email: entry.target_user_email ?? null,
    actor_user_id: entry.actor_user_id,
    actor_email: entry.actor_email ?? null,
    old_value: entry.old_value ? JSON.parse(JSON.stringify(entry.old_value)) : null,
    new_value: entry.new_value ? JSON.parse(JSON.stringify(entry.new_value)) : null,
    details: entry.details ?? null,
  });
}

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

      // Get old role for audit
      const { data: oldRoleRow } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      const oldRole = oldRoleRow?.role ?? "member";

      // Get target user email for audit
      const { data: targetUserData } = await adminClient.auth.admin.getUserById(userId);
      const targetEmail = targetUserData?.user?.email ?? null;

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

      // Audit log
      await insertAudit(adminClient, {
        action: "role_changed",
        target_user_id: userId,
        target_user_email: targetEmail,
        actor_user_id: caller.id,
        actor_email: caller.email ?? null,
        old_value: { role: oldRole },
        new_value: { role, full_name: fullName ?? null },
        details: `Role changed from ${oldRole} to ${role}`,
      });

      return json({ ok: true });
    }

    // --- List invites ---
    if (action === "list_invites") {
      const { data: invites, error: invErr } = await adminClient
        .from("user_invites")
        .select("*")
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (invErr) return json({ error: invErr.message }, 400);
      return json({ invites: invites ?? [] });
    }

    // --- Create invite ---
    if (action === "invite") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      const role = (body?.role ?? "member") as Role;

      if (!email || !email.includes("@")) {
        return json({ error: "Valid email required" }, 400);
      }
      if (role !== "admin" && role !== "manager" && role !== "member") {
        return json({ error: "Invalid role" }, 400);
      }

      // Check if email already invited (pending)
      const { data: existing } = await adminClient
        .from("user_invites")
        .select("id")
        .eq("email", email)
        .is("accepted_at", null)
        .maybeSingle();

      if (existing) {
        return json({ error: "An invite for this email is already pending" }, 400);
      }

      // Insert invite
      const { data: invite, error: inviteErr } = await adminClient
        .from("user_invites")
        .insert({
          email,
          role,
          invited_by: caller.id,
          invited_by_email: caller.email ?? null,
        })
        .select()
        .single();

      if (inviteErr) return json({ error: inviteErr.message }, 400);

      // Audit log
      await insertAudit(adminClient, {
        action: "user_invited",
        target_user_id: invite.id, // Using invite id as placeholder
        target_user_email: email,
        actor_user_id: caller.id,
        actor_email: caller.email ?? null,
        new_value: { email, role },
        details: `Invited ${email} with role ${role}`,
      });

      // Send invite email via Resend (if configured)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      let emailSent = false;
      if (resendKey) {
        try {
          const resend = new Resend(resendKey);
          const appUrl = Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") ?? "";
          const signupUrl = `${appUrl}/auth?invite=${invite.token}`;

          await resend.emails.send({
            from: "JobForge <noreply@cmacroofing.com>",
            to: [email],
            subject: "You've been invited to JobForge",
            html: `
              <h1>You're Invited!</h1>
              <p>${caller.email ?? "An admin"} has invited you to join JobForge as a <strong>${role}</strong>.</p>
              <p><a href="${signupUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;">Accept Invite</a></p>
              <p>This invite expires in 7 days.</p>
            `,
          });
          emailSent = true;
        } catch (emailErr) {
          console.error("Failed to send invite email:", emailErr);
        }
      }

      return json({ ok: true, invite, emailSent });
    }

    // --- Delete invite ---
    if (action === "delete_invite") {
      const inviteId = String(body?.inviteId ?? "");
      if (!inviteId) return json({ error: "Missing inviteId" }, 400);

      const { error: delErr } = await adminClient.from("user_invites").delete().eq("id", inviteId);
      if (delErr) return json({ error: delErr.message }, 400);

      return json({ ok: true });
    }

    // --- List audit log ---
    if (action === "list_audit") {
      const limit = Math.min(100, Math.max(1, Number(body?.limit ?? 50)));

      const { data: logs, error: logErr } = await adminClient
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (logErr) return json({ error: logErr.message }, 400);
      return json({ logs: logs ?? [] });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
