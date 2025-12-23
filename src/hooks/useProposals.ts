import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProposalLineItem {
  id: string;
  option_id: string;
  category: string;
  name: string;
  description: string | null;
  unit_cost: number;
  quantity: number;
  waste_percent: number;
  adjustment: number;
  cogs: number;
  margin_percent: number;
  subtotal: number;
  sales_tax_percent: number;
  sort_order: number;
}

export interface ProposalOption {
  id: string;
  proposal_id: string;
  name: string;
  description: string | null;
  is_selected: boolean;
  subtotal: number;
  sort_order: number;
  line_items?: ProposalLineItem[];
}

export interface Proposal {
  id: string;
  job_id: string;
  title: string;
  status: "draft" | "sent" | "viewed" | "won" | "lost";
  customer_notes: string | null;
  customer_signature: string | null;
  customer_signed_at: string | null;
  contractor_signature: string;
  contractor_signed_at: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    address: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    assignee_name: string;
  };
  options?: ProposalOption[];
}

export function useProposals() {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          job:jobs(id, address, customer_name, customer_email, customer_phone, assignee_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Proposal[];
    },
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      // Fetch proposal with job
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .select(`
          *,
          job:jobs(id, address, customer_name, customer_email, customer_phone, assignee_name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (proposalError) throw proposalError;
      if (!proposal) return null;

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from("proposal_options")
        .select("*")
        .eq("proposal_id", id)
        .order("sort_order", { ascending: true });

      if (optionsError) throw optionsError;

      // Fetch line items for each option
      const optionsWithItems = await Promise.all(
        (options || []).map(async (option) => {
          const { data: lineItems, error: itemsError } = await supabase
            .from("proposal_line_items")
            .select("*")
            .eq("option_id", option.id)
            .order("sort_order", { ascending: true });

          if (itemsError) throw itemsError;

          return {
            ...option,
            line_items: lineItems || [],
          };
        })
      );

      return {
        ...proposal,
        options: optionsWithItems,
      } as Proposal;
    },
    enabled: !!id,
  });
}

export function useUpdateProposalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proposal> }) => {
      const { error } = await supabase
        .from("proposals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
    },
  });
}
