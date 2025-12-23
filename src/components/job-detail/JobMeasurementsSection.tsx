import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, X } from "lucide-react";

interface JobMeasurementsSectionProps {
  jobId: string;
}

export function JobMeasurementsSection({ jobId }: JobMeasurementsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Measurements</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">DIY Report</Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Roofr report
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-primary">Forgetting something?</p>
          <p className="text-sm text-muted-foreground mt-1">
            Order a measurement report right here in the job record!
          </p>
          <Button variant="outline" size="sm" className="mt-3 gap-2">
            <ExternalLink className="h-4 w-4" />
            Order a Roofr Measurement
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
