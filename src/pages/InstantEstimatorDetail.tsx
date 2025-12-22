import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useInstantEstimator } from "@/hooks/useInstantEstimators";
import { EstimatorSettings, EstimateTypeIcon } from "@/components/instant-estimator";

export default function InstantEstimatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: estimator, isLoading } = useInstantEstimator(id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-fade-in space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!estimator) {
    return (
      <MainLayout>
        <div className="animate-fade-in flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold mb-2">Estimator Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The estimator you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/instant-estimator")}>
            Back to Estimators
          </Button>
        </div>
      </MainLayout>
    );
  }

  const estimatorUrl = `${window.location.origin}/estimate/${estimator.slug}`;

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/instant-estimator")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <EstimateTypeIcon type={estimator.estimate_type} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {estimator.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure your estimator settings
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open(estimatorUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </Button>
        </div>

        {/* Settings */}
        <EstimatorSettings estimator={estimator} />
      </div>
    </MainLayout>
  );
}
