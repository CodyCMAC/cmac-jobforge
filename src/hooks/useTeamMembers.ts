import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export function useTeamMembers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      // For now, we'll derive team members from:
      // 1. The current authenticated user
      // 2. Distinct assignee names from existing jobs
      const members: TeamMember[] = [];

      // Add current user as first option
      if (user) {
        const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Me";
        const initials = userName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        members.push({
          id: user.id,
          name: userName,
          email: user.email || "",
          initials,
        });
      }

      // Fetch distinct assignees from jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("assignee_name, assignee_initials")
        .order("assignee_name");

      if (jobsData) {
        const seen = new Set<string>();
        if (user) {
          seen.add(user.email || "");
        }

        for (const job of jobsData) {
          if (!seen.has(job.assignee_name)) {
            seen.add(job.assignee_name);
            members.push({
              id: job.assignee_name,
              name: job.assignee_name,
              email: "",
              initials: job.assignee_initials,
            });
          }
        }
      }

      return members;
    },
    enabled: true,
  });
}
