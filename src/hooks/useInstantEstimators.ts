import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InstantEstimator {
  id: string;
  name: string;
  estimate_type: string;
  slug: string | null;
  is_active: boolean;
  pricing_unit: string;
  show_price_range: boolean;
  show_financing: boolean;
  financing_link: string | null;
  default_assignee: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  scheduling_link: string | null;
  show_social_links: boolean;
  show_project_showcase: boolean;
  require_phone: boolean;
  require_email: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEstimatorInput {
  name: string;
  estimate_type: string;
}

export function useInstantEstimators() {
  return useQuery({
    queryKey: ["instant-estimators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instant_estimators")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InstantEstimator[];
    },
  });
}

export function useInstantEstimator(id: string | undefined) {
  return useQuery({
    queryKey: ["instant-estimator", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("instant_estimators")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as InstantEstimator | null;
    },
    enabled: !!id,
  });
}

export function useCreateEstimator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEstimatorInput) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("instant_estimators")
        .insert({
          name: input.name,
          estimate_type: input.estimate_type,
          slug: `${slug}-${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instant-estimators"] });
      toast.success("Estimator created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create estimator: " + error.message);
    },
  });
}

export function useUpdateEstimator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InstantEstimator>;
    }) => {
      const { data, error } = await supabase
        .from("instant_estimators")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instant-estimators"] });
      queryClient.invalidateQueries({ queryKey: ["instant-estimator", data.id] });
      toast.success("Estimator updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update estimator: " + error.message);
    },
  });
}

export function useDeleteEstimator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("instant_estimators")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instant-estimators"] });
      toast.success("Estimator deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete estimator: " + error.message);
    },
  });
}
