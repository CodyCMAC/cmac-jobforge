import { Button } from "@/components/ui/button";
import { Plus, Zap, Clock, TrendingUp, Globe } from "lucide-react";
import { ESTIMATE_TYPES } from "./EstimateTypeIcon";

interface EstimatorEmptyStateProps {
  onCreateClick: () => void;
}

export function EstimatorEmptyState({ onCreateClick }: EstimatorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated Icons */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3">
          {ESTIMATE_TYPES.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={type.value}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Icon className="w-7 h-7 text-primary" />
              </div>
            );
          })}
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-full blur-sm" />
      </div>

      {/* Content */}
      <div className="text-center max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Instant Estimator
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Provide instant estimates to your customers in seconds. Qualify new
          leads automatically without picking up the phone or driving to the job
          site.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-8">
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-success" />
          </div>
          <h4 className="font-medium text-sm mb-1">Instant Quotes</h4>
          <p className="text-xs text-muted-foreground">
            Customers get estimates in seconds
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-info" />
          </div>
          <h4 className="font-medium text-sm mb-1">Save Time</h4>
          <p className="text-xs text-muted-foreground">
            Qualify leads automatically 24/7
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-warning" />
          </div>
          <h4 className="font-medium text-sm mb-1">More Leads</h4>
          <p className="text-xs text-muted-foreground">
            Convert more website visitors
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onCreateClick} size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        Create Your First Estimator
      </Button>

      {/* Embed hint */}
      <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span>Embed on your website or share via link</span>
      </div>
    </div>
  );
}
