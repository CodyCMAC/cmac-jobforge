import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEstimator } from "@/hooks/useInstantEstimators";
import { ESTIMATE_TYPES } from "./EstimateTypeIcon";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CreateEstimatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEstimatorDialog({
  open,
  onOpenChange,
}: CreateEstimatorDialogProps) {
  const [name, setName] = useState("");
  const [estimateType, setEstimateType] = useState("roofing");
  const createEstimator = useCreateEstimator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createEstimator.mutateAsync({
      name: name.trim(),
      estimate_type: estimateType,
    });

    setName("");
    setEstimateType("roofing");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Estimator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Estimator Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Estimator Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., "Website Homepage" or "Direct Mailer"'
              className="h-12"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Choose a name that describes how this estimator will be used
            </p>
          </div>

          {/* Estimate Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estimate Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {ESTIMATE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = estimateType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEstimateType(type.value)}
                    className={cn(
                      "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {type.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createEstimator.isPending}
            >
              {createEstimator.isPending ? "Creating..." : "Create Estimator"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
