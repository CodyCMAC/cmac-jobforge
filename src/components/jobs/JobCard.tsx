import { cn } from "@/lib/utils";
import { Job, getAgeIndicator, timeAgo, formatCurrency, getStatusBadgeClasses } from "./types";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const ageIndicator = getAgeIndicator(job.updatedAt);

  return (
    <div 
      className="kanban-card mb-3 last:mb-0 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Address */}
        <div>
          <h4 className="font-medium text-foreground text-sm leading-tight">
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
  );
}
