import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstantEstimator() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Instant Estimator"
          actions={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Instant Estimator
            </Button>
          }
        />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button className="pb-3 text-sm font-medium border-b-2 border-primary text-primary">
              All Instant Estimators
            </button>
            <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center py-16">
          <div className="bg-card rounded-lg border border-border p-12 max-w-lg mx-auto text-center">
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                <div className="w-6 h-3 bg-warning rounded" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <div className="w-6 h-3 bg-border rounded" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <div className="w-6 h-3 bg-success rounded" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Instant Estimator</h2>
            <p className="text-muted-foreground mb-6">
              Provide estimates to your customers in seconds and qualify new leads without picking up the phone or getting in your truck
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Instant Estimator
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
