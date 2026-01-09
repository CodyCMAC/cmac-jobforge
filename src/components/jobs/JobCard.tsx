import { cn } from "@/lib/utils";
import { MessageSquare, Clock } from "lucide-react";
import { Job, getAgeIndicator, timeAgo, formatCurrency, getStatusBadgeClasses } from "./types";
import { JobCardPopover } from "./JobCardPopover";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onQuickView?: () => void;
}

export function JobCard({ job, onClick, onQuickView }: JobCardProps) {
  const ageIndicator = getAgeIndicator(job.updatedAt);

  const handleClick = (e: React.MouseEvent) => {
    // If shift+click or right-click, open drawer instead
    if (e.shiftKey && onQuickView) {
      e.preventDefault();
      onQuickView();
      return;
    }
    onClick?.();
  };

  return (
    <JobCardPopover
      customerPhone={job.customerPhone}
      customerEmail={job.customerEmail}
      lastCommentSnippet={job.lastCommentSnippet}
      lastActivityAt={job.lastActivityAt}
      commentCount={job.commentCount}
    >
      <div 
        className="kanban-card mb-3 last:mb-0 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <div className="space-y-3">
          {/* Address */}
          <div>
            <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
              {job.address}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{job.customerName}</p>
          </div>

          {/* Status indicator bar */}
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium",
            ageIndicator.className
          )}>
            <span>{ageIndicator.label}</span>
            <div className="flex items-center gap-2">
              <span>Created {timeAgo(job.createdAt)}</span>
              <div className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-bold">
                {job.assignee.initials}
              </div>
            </div>
          </div>

          {/* Activity & Comments Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {/* Last Activity */}
              {job.lastActivityAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(job.lastActivityAt)}</span>
                </div>
              )}
              
              {/* Comment Count */}
              {(job.commentCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{job.commentCount}</span>
                </div>
              )}
            </div>

            {/* Priority indicator */}
            {job.priority && job.priority !== 'normal' && (
              <div className={cn(
                "w-2 h-2 rounded-full",
                job.priority === 'high' ? "bg-destructive" : 
                job.priority === 'low' ? "bg-muted-foreground" : ""
              )} />
            )}
          </div>

          {/* Value and proposal status */}
          {(job.value > 0 || job.proposalStatus) && (
            <div className="flex items-center justify-between pt-1">
              {job.value > 0 && (
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(job.value)}
                </span>
              )}
              {job.proposalStatus && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium capitalize",
                  getStatusBadgeClasses(job.proposalStatus)
                )}>
                  {job.proposalStatus}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </JobCardPopover>
  );
}
