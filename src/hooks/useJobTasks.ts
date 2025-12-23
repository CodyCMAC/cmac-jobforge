import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobTask {
  id: string;
  job_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  assignee: string | null;
  created_at: string;
  updated_at: string;
}

export function useJobTasks(jobId: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["job-tasks", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_tasks")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as JobTask[];
    },
    enabled: !!jobId,
  });

  const addTask = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("job_tasks")
        .insert({ job_id: jobId, title })
        .select()
        .single();

      if (error) throw error;
      return data as JobTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-tasks", jobId] });
      toast.success("Task added");
    },
    onError: (err: Error) => {
      toast.error("Failed to add task: " + err.message);
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("job_tasks")
        .update({ completed })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-tasks", jobId] });
    },
    onError: (err: Error) => {
      toast.error("Failed to update task: " + err.message);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-tasks", jobId] });
      toast.success("Task deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete task: " + err.message);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    addTask,
    toggleTask,
    deleteTask,
  };
}
