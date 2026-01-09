import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface JobComment {
  id: string;
  jobId: string;
  authorUserId: string;
  authorName: string;
  authorInitials: string;
  body: string;
  parentCommentId: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useJobComments(jobId: string) {
  return useQuery({
    queryKey: ["job-comments", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_comments")
        .select("*")
        .eq("job_id", jobId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((comment): JobComment => ({
        id: comment.id,
        jobId: comment.job_id,
        authorUserId: comment.author_user_id,
        authorName: comment.author_name,
        authorInitials: comment.author_initials,
        body: comment.body,
        parentCommentId: comment.parent_comment_id,
        isDeleted: comment.is_deleted,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
      }));
    },
    enabled: !!jobId,
  });
}

export function useCreateComment(jobId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ body, parentCommentId }: { body: string; parentCommentId?: string }) => {
      if (!user) throw new Error("You must be logged in to comment");

      // Get user metadata for name
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

      const { data, error } = await supabase.from("job_comments").insert({
        job_id: jobId,
        author_user_id: user.id,
        author_name: userName,
        author_initials: initials,
        body,
        parent_comment_id: parentCommentId || null,
      }).select().single();

      if (error) throw error;

      // Also create an activity record
      await supabase.from("job_activity").insert({
        job_id: jobId,
        actor_user_id: user.id,
        actor_name: userName,
        actor_initials: initials,
        type: "comment_created",
        summary: `${userName} commented: "${body.slice(0, 50)}${body.length > 50 ? '...' : ''}"`,
        metadata: { comment_id: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-comments", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-activity", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job-activity-feed"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
      toast.error("Failed to add comment");
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
      const { data, error } = await supabase
        .from("job_comments")
        .update({ body })
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-comments", data.job_id] });
    },
    onError: (error) => {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, jobId }: { commentId: string; jobId: string }) => {
      const { error } = await supabase
        .from("job_comments")
        .update({ is_deleted: true })
        .eq("id", commentId);

      if (error) throw error;
      return { commentId, jobId };
    },
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["job-comments", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    },
  });
}
