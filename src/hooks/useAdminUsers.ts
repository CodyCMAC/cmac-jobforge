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
      await queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update user");
    },
  });
}

// ==================== Invites ====================

export interface UserInvite {
  id: string;
  email: string;
  role: AdminUserRole;
  invited_by: string;
  invited_by_email: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

async function listInvites(): Promise<UserInvite[]> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "list_invites" },
  });
  if (error) throw error;
  return (data as any)?.invites ?? [];
}

export function useAdminInvites(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-invites"],
    queryFn: listInvites,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

async function createInvite(input: { email: string; role: AdminUserRole }) {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "invite", email: input.email, role: input.role },
  });
  if (error) throw error;
  return data as { ok: boolean; invite: UserInvite; emailSent: boolean };
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvite,
    onSuccess: async (result) => {
      if (result.emailSent) {
        toast.success("Invite sent by email");
      } else {
        toast.success("Invite created (email not configured)");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create invite");
    },
  });
}

async function deleteInvite(inviteId: string) {
  const { error } = await supabase.functions.invoke("admin-users", {
    body: { action: "delete_invite", inviteId },
  });
  if (error) throw error;
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvite,
    onSuccess: async () => {
      toast.success("Invite revoked");
      await queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete invite");
    },
  });
}

// ==================== Audit Log ====================

export interface AuditLogEntry {
  id: string;
  action: string;
  target_user_id: string;
  target_user_email: string | null;
  actor_user_id: string;
  actor_email: string | null;
  old_value: unknown;
  new_value: unknown;
  details: string | null;
  created_at: string;
}

async function listAuditLog(limit = 50): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "list_audit", limit },
  });
  if (error) throw error;
  return (data as any)?.logs ?? [];
}

export function useAdminAuditLog(options?: { enabled?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["admin-audit", options?.limit ?? 50],
    queryFn: () => listAuditLog(options?.limit ?? 50),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}
