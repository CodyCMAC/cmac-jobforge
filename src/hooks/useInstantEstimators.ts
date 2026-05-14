import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type InstantEstimatorRow = Database["public"]["Tables"]["instant_estimators"]["Row"];
type InstantEstimatorUpdate = Database["public"]["Tables"]["instant_estimators"]["Update"];
type InstantEstimatorContactRow = Database["public"]["Tables"]["instant_estimator_contact_details"]["Row"];
type InstantEstimatorContactInsert = Database["public"]["Tables"]["instant_estimator_contact_details"]["Insert"];
type InstantEstimatorContactUpdate = Database["public"]["Tables"]["instant_estimator_contact_details"]["Update"];

export interface InstantEstimator extends InstantEstimatorRow {
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface CreateEstimatorInput {
  name: string;
  estimate_type: string;
}

function mapEstimator(
  estimator: InstantEstimatorRow & {
    instant_estimator_contact_details: InstantEstimatorContactRow | InstantEstimatorContactRow[] | null;
  }
): InstantEstimator {
  const rawContact = estimator.instant_estimator_contact_details;
  const contact = Array.isArray(rawContact) ? rawContact[0] ?? null : rawContact;

  return {
    ...estimator,
    contact_name: contact?.contact_name ?? null,
    contact_email: contact?.contact_email ?? null,
    contact_phone: contact?.contact_phone ?? null,
  };
}

export function useInstantEstimators() {
  return useQuery({
    queryKey: ["instant-estimators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instant_estimators")
        .select("*, instant_estimator_contact_details(contact_name, contact_email, contact_phone)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((estimator) =>
        mapEstimator(
          estimator as InstantEstimatorRow & {
            instant_estimator_contact_details: InstantEstimatorContactRow | InstantEstimatorContactRow[] | null;
          }
        )
      );
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
        .select("*, instant_estimator_contact_details(contact_name, contact_email, contact_phone)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data
        ? mapEstimator(
            data as InstantEstimatorRow & {
              instant_estimator_contact_details: InstantEstimatorContactRow | InstantEstimatorContactRow[] | null;
            }
          )
        : null;
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
      const { contact_name, contact_email, contact_phone, ...estimatorUpdates } = updates;
      const normalizedEstimatorUpdates = estimatorUpdates as InstantEstimatorUpdate;
      const hasEstimatorUpdates = Object.keys(normalizedEstimatorUpdates).length > 0;
      const hasContactUpdates = [contact_name, contact_email, contact_phone].some((value) => value !== undefined);

      if (hasEstimatorUpdates) {
        const { error } = await supabase
          .from("instant_estimators")
          .update(normalizedEstimatorUpdates)
          .eq("id", id);

        if (error) throw error;
      }

      if (hasContactUpdates) {
        const contactPayload: InstantEstimatorContactInsert = {
          estimator_id: id,
          contact_name: contact_name ?? null,
          contact_email: contact_email ?? null,
          contact_phone: contact_phone ?? null,
        };

        const { error } = await supabase
          .from("instant_estimator_contact_details")
          .upsert(contactPayload, { onConflict: "estimator_id" });

        if (error) throw error;
      }

      const { data, error } = await supabase
        .from("instant_estimators")
        .select("*, instant_estimator_contact_details(contact_name, contact_email, contact_phone)")
        .eq("id", id)
        .single();

      if (error) throw error;

      return mapEstimator(
        data as InstantEstimatorRow & {
          instant_estimator_contact_details: InstantEstimatorContactRow | InstantEstimatorContactRow[] | null;
        }
      );
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
