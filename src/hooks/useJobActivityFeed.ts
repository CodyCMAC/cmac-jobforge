import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];

export interface JobActivity {
  id: string;
  jobId: string;
  actorUserId: string | null;
  actorName: string | null;
  actorInitials: string | null;
  type: ActivityType;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  // Joined job data
  jobAddress?: string;
  jobCustomerName?: string;
}

interface UseJobActivityFeedOptions {
  jobId?: string;
  types?: ActivityType[];
  limit?: number;
}

export function useJobActivityFeed(options: UseJobActivityFeedOptions = {}) {
  const { jobId, types, limit = 50 } = options;

  return useQuery({
    queryKey: ["job-activity-feed", jobId, types, limit],
    queryFn: async () => {
      let query = supabase
        .from("job_activity")
        .select(`
          *,
          jobs!inner(address, customer_name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      if (types && types.length > 0) {
        query = query.in("type", types);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((activity): JobActivity => ({
        id: activity.id,
        jobId: activity.job_id,
        actorUserId: activity.actor_user_id,
        actorName: activity.actor_name,
        actorInitials: activity.actor_initials,
        type: activity.type,
        summary: activity.summary,
        metadata: (activity.metadata as Record<string, unknown>) || {},
        createdAt: new Date(activity.created_at),
        jobAddress: (activity.jobs as { address: string; customer_name: string })?.address,
        jobCustomerName: (activity.jobs as { address: string; customer_name: string })?.customer_name,
      }));
    },
    refetchInterval: 15000, // Poll every 15 seconds for new activity
  });
}

export function useJobActivity(jobId: string) {
  return useQuery({
    queryKey: ["job-activity", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_activity")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((activity): JobActivity => ({
        id: activity.id,
        jobId: activity.job_id,
        actorUserId: activity.actor_user_id,
        actorName: activity.actor_name,
        actorInitials: activity.actor_initials,
        type: activity.type,
        summary: activity.summary,
        metadata: (activity.metadata as Record<string, unknown>) || {},
        createdAt: new Date(activity.created_at),
      }));
    },
    enabled: !!jobId,
  });
}

// Helper to create activity records
export async function createJobActivity(
  jobId: string,
  type: ActivityType,
  summary: string,
  actorUserId?: string,
  actorName?: string,
  actorInitials?: string,
  metadata?: object
) {
  const { error } = await supabase.from("job_activity").insert([{
    job_id: jobId,
    actor_user_id: actorUserId || null,
    actor_name: actorName || null,
    actor_initials: actorInitials || null,
    type,
    summary,
    metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
  }]);

  if (error) {
    console.error("Failed to create activity:", error);
  }
}
