import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================================================
// Types
// =============================================================================

export type RevenueCategory =
  | "contract"
  | "change_order"
  | "supplement"
  | "upgrade"
  | "discount"
  | "refund"
  | "sales_tax"
  | "other_revenue";

export type CostCategory =
  | "materials_shingles"
  | "materials_underlayment"
  | "materials_flashing"
  | "materials_other"
  | "labor_crew"
  | "labor_repair"
  | "subcontractor"
  | "dump_haul"
  | "permits"
  | "equipment_rental"
  | "commission"
  | "warranty_reserve"
  | "overhead_allocation"
  | "other_expense";

export interface RevenueItem {
  id: string;
  job_id: string;
  category: RevenueCategory;
  description: string | null;
  estimated_amount: number; // cents
  actual_amount: number | null; // cents
  item_date: string | null;
  attachment_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostItem {
  id: string;
  job_id: string;
  category: CostCategory;
  description: string | null;
  vendor: string | null;
  estimated_amount: number; // cents
  actual_amount: number | null; // cents
  item_date: string | null;
  receipt_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobFinancialSummary {
  job_id: string;
  estimated_revenue: number;
  actual_revenue: number;
  collected_amount: number;
  revenue_items_count: number;
  revenue_items_with_actuals: number;
  estimated_costs: number;
  actual_costs: number;
  cost_items_count: number;
  cost_items_with_actuals: number;
  estimated_profit: number;
  actual_profit: number;
  estimated_margin: number;
  actual_margin: number;
  cost_variance: number;
  cost_variance_pct: number;
  total_commissions: number;
  draft_commissions: number;
  approved_commissions: number;
  paid_commissions: number;
  last_calculated_at: string;
  updated_at: string;
}

// =============================================================================
// Utility: Convert cents to dollars
// =============================================================================

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(centsToDollars(cents));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// =============================================================================
// Category Labels
// =============================================================================

export const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  contract: "Contract",
  change_order: "Change Order",
  supplement: "Supplement",
  upgrade: "Upgrade",
  discount: "Discount",
  refund: "Refund",
  sales_tax: "Sales Tax",
  other_revenue: "Other Revenue",
};

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  materials_shingles: "Shingles",
  materials_underlayment: "Underlayment",
  materials_flashing: "Flashing",
  materials_other: "Other Materials",
  labor_crew: "Crew Labor",
  labor_repair: "Repair Labor",
  subcontractor: "Subcontractor",
  dump_haul: "Dump/Haul",
  permits: "Permits",
  equipment_rental: "Equipment Rental",
  commission: "Commission",
  warranty_reserve: "Warranty Reserve",
  overhead_allocation: "Overhead",
  other_expense: "Other Expense",
};

// =============================================================================
// Hooks: Financial Summary
// =============================================================================

export function useJobFinancialSummary(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-financial-summary", jobId],
    queryFn: async () => {
      if (!jobId) return null;

      // First try to get cached summary
      const { data: cached, error: cacheError } = await supabase
        .from("job_financial_summary")
        .select("*")
        .eq("job_id", jobId)
        .maybeSingle();

      if (cacheError) throw cacheError;

      // If no cached data, trigger calculation
      if (!cached) {
        const { data: calculated, error: calcError } = await supabase.rpc(
          "calculate_job_financials",
          { p_job_id: jobId }
        );
        if (calcError) throw calcError;
        return calculated as JobFinancialSummary;
      }

      return cached as JobFinancialSummary;
    },
    enabled: !!jobId,
  });
}

// =============================================================================
// Hooks: Revenue Items
// =============================================================================

export function useJobRevenueItems(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-revenue-items", jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from("job_revenue_items")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as RevenueItem[];
    },
    enabled: !!jobId,
  });
}

export function useCreateRevenueItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      item: Omit<RevenueItem, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
    ) => {
      const { data, error } = await supabase
        .from("job_revenue_items")
        .insert({
          ...item,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-revenue-items", data.job_id] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Revenue item added");
    },
    onError: (error) => {
      toast.error(`Failed to add revenue item: ${error.message}`);
    },
  });
}

export function useUpdateRevenueItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RevenueItem>;
    }) => {
      const { data, error } = await supabase
        .from("job_revenue_items")
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-revenue-items", data.job_id] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Revenue item updated");
    },
    onError: (error) => {
      toast.error(`Failed to update revenue item: ${error.message}`);
    },
  });
}

export function useDeleteRevenueItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase.from("job_revenue_items").delete().eq("id", id);
      if (error) throw error;
      return { jobId };
    },
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["job-revenue-items", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", jobId] });
      toast.success("Revenue item deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete revenue item: ${error.message}`);
    },
  });
}

// =============================================================================
// Hooks: Cost Items
// =============================================================================

export function useJobCostItems(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-cost-items", jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from("job_cost_items")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CostItem[];
    },
    enabled: !!jobId,
  });
}

export function useCreateCostItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      item: Omit<CostItem, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
    ) => {
      const { data, error } = await supabase
        .from("job_cost_items")
        .insert({
          ...item,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-cost-items", data.job_id] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Cost item added");
    },
    onError: (error) => {
      toast.error(`Failed to add cost item: ${error.message}`);
    },
  });
}

export function useUpdateCostItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CostItem>;
    }) => {
      const { data, error } = await supabase
        .from("job_cost_items")
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-cost-items", data.job_id] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Cost item updated");
    },
    onError: (error) => {
      toast.error(`Failed to update cost item: ${error.message}`);
    },
  });
}

export function useDeleteCostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase.from("job_cost_items").delete().eq("id", id);
      if (error) throw error;
      return { jobId };
    },
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["job-cost-items", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", jobId] });
      toast.success("Cost item deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete cost item: ${error.message}`);
    },
  });
}

// =============================================================================
// Hooks: Recalculate Financials
// =============================================================================

export function useRecalculateJobFinancials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc("calculate_job_financials", {
        p_job_id: jobId,
      });
      if (error) throw error;
      return data as JobFinancialSummary;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-financial-summary", data.job_id] });
      toast.success("Financials recalculated");
    },
    onError: (error) => {
      toast.error(`Failed to recalculate: ${error.message}`);
    },
  });
}
