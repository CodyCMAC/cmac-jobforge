import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/jobs/types";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform database format to Job type
      const jobs: Job[] = (data || []).map((job) => ({
        id: job.id,
        address: job.address,
        customerName: job.customer_name,
        customerPhone: job.customer_phone,
        customerEmail: job.customer_email,
        value: Number(job.value),
        status: job.status as Job["status"],
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at),
        assignee: {
          initials: job.assignee_initials,
          name: job.assignee_name,
        },
        proposalStatus: job.proposal_status as Job["proposalStatus"],
        commentCount: job.comment_count,
        lastActivityAt: job.last_activity_at ? new Date(job.last_activity_at) : null,
        lastCommentAt: job.last_comment_at ? new Date(job.last_comment_at) : null,
        lastCommentSnippet: job.last_comment_snippet,
        priority: job.priority,
      }));

      return jobs;
    },
  });
}
