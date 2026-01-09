import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  RefreshCw, 
  UserCheck, 
  FileText, 
  CheckSquare, 
  PlusCircle,
  Send,
  PenLine,
  Flame,
  Activity,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobActivityFeed, JobActivity } from "@/hooks/useJobActivityFeed";
import { timeAgo } from "@/components/jobs/types";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];

const filterOptions = [
  { id: "all", label: "All" },
  { id: "comment_created", label: "Comments" },
  { id: "status_changed", label: "Status" },
  { id: "assigned_changed", label: "Assignments" },
  { id: "task_completed", label: "Tasks" },
] as const;

export function getActivityIcon(type: ActivityType): LucideIcon {
  switch (type) {
    case "comment_created":
      return MessageSquare;
    case "status_changed":
      return RefreshCw;
    case "assigned_changed":
      return UserCheck;
    case "job_created":
      return PlusCircle;
    case "task_completed":
      return CheckSquare;
    case "proposal_created":
      return FileText;
    case "proposal_sent":
      return Send;
    case "proposal_signed":
      return PenLine;
    default:
      return Activity;
  }
}

export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case "comment_created":
      return "bg-primary/10 text-primary";
    case "status_changed":
      return "bg-warning/10 text-warning";
    case "assigned_changed":
      return "bg-accent text-accent-foreground";
    case "job_created":
      return "bg-success/10 text-success";
    case "task_completed":
      return "bg-success/10 text-success";
    case "proposal_created":
    case "proposal_sent":
      return "bg-primary/10 text-primary";
    case "proposal_signed":
      return "bg-success/10 text-success";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface PulsePanelProps {
  className?: string;
  onJobClick?: (jobId: string) => void;
}

export function PulsePanel({ className, onJobClick }: PulsePanelProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const types = activeFilter === "all" 
    ? undefined 
    : [activeFilter as ActivityType];
  
  const { data: activities = [], isLoading, refetch, isFetching } = useJobActivityFeed({ types, limit: 50 });

  // Group activities by job to detect "hot" jobs (multiple activities in 24h)
  const hotJobIds = new Set<string>();
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  
  const activityCountByJob: Record<string, number> = {};
  activities.forEach((activity) => {
    if (activity.createdAt.getTime() > twentyFourHoursAgo) {
      activityCountByJob[activity.jobId] = (activityCountByJob[activity.jobId] || 0) + 1;
      if (activityCountByJob[activity.jobId] >= 3) {
        hotJobIds.add(activity.jobId);
      }
    }
  });

  const handleActivityClick = (activity: JobActivity) => {
    if (onJobClick) {
      onJobClick(activity.jobId);
    } else {
      navigate(`/jobs/${activity.jobId}`);
    }
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Pulse</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
        
        {/* Filter Chips */}
        <div className="flex gap-1.5 flex-wrap">
          {filterOptions.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              className="cursor-pointer text-xs px-2.5 py-0.5 hover:bg-primary/10 transition-colors"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                const isHot = hotJobIds.has(activity.jobId);
                
                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className={cn(
                      "flex gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      isHot && "ring-1 ring-orange-500/30 bg-orange-500/5"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      colorClass
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground line-clamp-2">
                          {activity.summary}
                        </p>
                        {isHot && (
                          <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary font-medium truncate max-w-[150px]">
                          {activity.jobCustomerName || activity.jobAddress}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
