import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: JobUpdate) => {
      const { error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: Error) => {
      toast.error("Failed to update job: " + err.message);
    },
  });
}
