import { Job, PipelineStage } from "./types";
import { PipelineColumn } from "./PipelineColumn";

interface PipelineBoardProps {
  stages: PipelineStage[];
}

export function PipelineBoard({ stages }: PipelineBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {stages.map((stage) => {
        const totalValue = stage.jobs.reduce((sum, job) => sum + job.value, 0);
        return (
          <PipelineColumn
            key={stage.id}
            title={stage.name}
            count={stage.jobs.length}
            totalValue={totalValue}
            jobs={stage.jobs}
          />
        );
      })}
    </div>
  );
}
