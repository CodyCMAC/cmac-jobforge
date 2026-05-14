import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================================================
// Types
// =============================================================================

export type CommissionCalcType =
  | "percentage_of_revenue"
  | "percentage_of_collected"
  | "percentage_of_profit"
  | "flat_amount"
  | "tiered_percentage";

export type CommissionStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "payable"
  | "paid"
  | "voided";

export type CommissionEventType =
  | "created"
  | "recalculated"
  | "status_changed"
  | "amount_overridden"
  | "voided"
  | "paid"
  | "clawback_created";

export interface CommissionPlan {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommissionTier {
  min_margin: number;
  max_margin: number;
  rate: number;
}

export interface CommissionRule {
  id: string;
  plan_id: string;
  role: string;
  calculation_type: CommissionCalcType;
  rate: number | null;
  flat_amount: number | null; // cents
  tiers: CommissionTier[] | unknown | null; // JSON from DB
  split_percentage: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionEntry {
  id: string;
  job_id: string;
  rule_id: string | null;
  user_id: string;
  role: string;
  status: CommissionStatus;
  base_amount: number; // cents
  base_type: string;
  rate_applied: number | null;
  margin_at_calc: number | null;
  calculated_amount: number; // cents
  override_amount: number | null; // cents
  final_amount: number; // cents
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  clawback_of: string | null;
  clawback_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user_name?: string;
  user_email?: string;
  job_address?: string;
}

export interface CommissionEvent {
  id: string;
  entry_id: string;
  event_type: CommissionEventType;
  actor_user_id: string | null;
  actor_name: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

type CommissionEntryUpdate = Database["public"]["Tables"]["commission_entries"]["Update"];

// =============================================================================
// Status Labels & Colors
// =============================================================================

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  payable: "Payable",
  paid: "Paid",
  voided: "Voided",
};

export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning/20 text-warning",
  approved: "bg-info/20 text-info",
  payable: "bg-success/20 text-success",
  paid: "bg-success text-success-foreground",
  voided: "bg-destructive/20 text-destructive",
};

export const ROLE_LABELS: Record<string, string> = {
  sales_rep: "Sales Rep",
  project_manager: "Project Manager",
  installer_lead: "Installer Lead",
  sales_rep_bonus: "Sales Bonus",
};

// =============================================================================
// Hooks: Commission Plans
// =============================================================================

export function useCommissionPlans() {
  return useQuery({
    queryKey: ["commission-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommissionPlan[];
    },
  });
}

export function useDefaultCommissionPlan() {
  return useQuery({
    queryKey: ["commission-plans", "default"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_plans")
        .select("*")
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as CommissionPlan | null;
    },
  });
}

export function useCommissionRules(planId: string | undefined) {
  return useQuery({
    queryKey: ["commission-rules", planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .eq("plan_id", planId)
        .eq("is_active", true)
        .order("priority", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as CommissionRule[];
    },
    enabled: !!planId,
  });
}

// =============================================================================
// Hooks: Commission Entries
// =============================================================================

export function useJobCommissionEntries(jobId: string | undefined) {
  return useQuery({
    queryKey: ["commission-entries", "job", jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from("commission_entries")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CommissionEntry[];
    },
    enabled: !!jobId,
  });
}

export function useMyCommissionEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commission-entries", "mine", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("commission_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommissionEntry[];
    },
    enabled: !!user?.id,
  });
}

export function usePendingApprovalCommissions() {
  return useQuery({
    queryKey: ["commission-entries", "pending-approval"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_entries")
        .select("*")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CommissionEntry[];
    },
  });
}

// =============================================================================
// Hooks: Commission Entry Mutations
// =============================================================================

export function useUpdateCommissionStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      entryId,
      newStatus,
      reason,
    }: {
      entryId: string;
      newStatus: CommissionStatus;
      reason?: string;
    }) => {
      // Get current entry for audit
      const { data: currentEntry, error: fetchError } = await supabase
        .from("commission_entries")
        .select("*")
        .eq("id", entryId)
        .single();

      if (fetchError) throw fetchError;

      // Update entry
      const updates: CommissionEntryUpdate = { status: newStatus };
      if (newStatus === "approved" || newStatus === "payable") {
        updates.approved_by = user?.id || null;
        updates.approved_at = new Date().toISOString();
      }
      if (newStatus === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("commission_entries")
        .update(updates)
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;

      // Create audit event
      await supabase.from("commission_events").insert({
        entry_id: entryId,
        event_type: "status_changed",
        actor_user_id: user?.id,
        actor_name: user?.email?.split("@")[0] || "Unknown",
        old_value: { status: currentEntry.status },
        new_value: { status: newStatus },
        reason: reason || null,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["commission-entries"] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success(`Commission ${COMMISSION_STATUS_LABELS[data.status as CommissionStatus]}`);
    },
    onError: (error) => {
      toast.error(`Failed to update commission: ${error.message}`);
    },
  });
}

export function useOverrideCommissionAmount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      entryId,
      overrideAmount,
      reason,
    }: {
      entryId: string;
      overrideAmount: number; // cents
      reason: string;
    }) => {
      // Get current entry for audit
      const { data: currentEntry, error: fetchError } = await supabase
        .from("commission_entries")
        .select("*")
        .eq("id", entryId)
        .single();

      if (fetchError) throw fetchError;

      // Update entry
      const { data, error } = await supabase
        .from("commission_entries")
        .update({
          override_amount: overrideAmount,
          final_amount: overrideAmount,
        })
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;

      // Create audit event
      await supabase.from("commission_events").insert({
        entry_id: entryId,
        event_type: "amount_overridden",
        actor_user_id: user?.id,
        actor_name: user?.email?.split("@")[0] || "Unknown",
        old_value: {
          override_amount: currentEntry.override_amount,
          final_amount: currentEntry.final_amount,
        },
        new_value: {
          override_amount: overrideAmount,
          final_amount: overrideAmount,
        },
        reason,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["commission-entries"] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Commission amount overridden");
    },
    onError: (error) => {
      toast.error(`Failed to override amount: ${error.message}`);
    },
  });
}

// =============================================================================
// Hooks: Commission Events (Audit Log)
// =============================================================================

export function useCommissionEvents(entryId: string | undefined) {
  return useQuery({
    queryKey: ["commission-events", entryId],
    queryFn: async () => {
      if (!entryId) return [];

      const { data, error } = await supabase
        .from("commission_events")
        .select("*")
        .eq("entry_id", entryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommissionEvent[];
    },
    enabled: !!entryId,
  });
}
