import { cn } from "@/lib/utils";
import { Job, formatCurrency } from "./types";
import { JobCard } from "./JobCard";

interface PipelineColumnProps {
  title: string;
  count: number;
  totalValue: number;
  jobs: Job[];
  className?: string;
}

export function PipelineColumn({ title, count, totalValue, jobs, className }: PipelineColumnProps) {
  return (
    <div className={cn("kanban-column", className)}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-0 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No jobs in this stage
          </div>
        )}
      </div>
    </div>
  );
}
