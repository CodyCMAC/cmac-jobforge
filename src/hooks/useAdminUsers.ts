import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AdminUserRole = "admin" | "manager" | "member";

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  full_name: string | null;
  role: AdminUserRole;
}

async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "list" },
  });

  if (error) throw error;

  const users = (data as any)?.users as AdminUser[] | undefined;
  return users ?? [];
}

export function useAdminUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: listAdminUsers,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

async function updateAdminUser(input: {
  userId: string;
  role: AdminUserRole;
  fullName?: string | null;
}) {
  const { error } = await supabase.functions.invoke("admin-users", {
    body: {
      action: "update",
      userId: input.userId,
      role: input.role,
      fullName: input.fullName ?? null,
    },
  });

  if (error) throw error;
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: async () => {
      toast.success("User updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update user");
    },
  });
}
