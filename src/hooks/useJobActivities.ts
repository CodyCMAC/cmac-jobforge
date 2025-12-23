import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface JobActivity {
  id: string;
  job_id: string;
  type: string;
  title: string;
  body: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
}

export function useJobActivities(jobId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const activitiesQuery = useQuery({
    queryKey: ["job-activities", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_activities")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as JobActivity[];
    },
    enabled: !!jobId,
  });

  const addActivity = useMutation({
    mutationFn: async ({
      type,
      title,
      body,
    }: {
      type: string;
      title: string;
      body?: string;
    }) => {
      const { data, error } = await supabase
        .from("job_activities")
        .insert({
          job_id: jobId,
          type,
          title,
          body: body || null,
          created_by: user?.id || null,
          created_by_name: user?.email?.split("@")[0] || "User",
        })
        .select()
        .single();

      if (error) throw error;
      return data as JobActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-activities", jobId] });
    },
    onError: (err: Error) => {
      toast.error("Failed to add activity: " + err.message);
    },
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    addActivity,
  };
}
