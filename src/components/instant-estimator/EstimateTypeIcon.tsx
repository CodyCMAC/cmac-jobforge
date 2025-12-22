import { Home, Droplets, Hammer, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  roofing: {
    icon: Home,
    label: "Roofing",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  gutter: {
    icon: Droplets,
    label: "Gutters",
    bgClass: "bg-info/10",
    textClass: "text-info",
  },
  framing: {
    icon: Hammer,
    label: "Framing",
    bgClass: "bg-warning/10",
    textClass: "text-warning",
  },
  garage_door: {
    icon: DoorOpen,
    label: "Garage Door",
    bgClass: "bg-success/10",
    textClass: "text-success",
  },
};

interface EstimateTypeIconProps {
  type: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function EstimateTypeIcon({
  type,
  size = "md",
  showLabel = false,
  className,
}: EstimateTypeIconProps) {
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.roofing;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center",
          sizeClasses[size],
          config.bgClass
        )}
      >
        <Icon className={cn(iconSizes[size], config.textClass)} />
      </div>
      {showLabel && (
        <span className={cn("font-medium", config.textClass)}>{config.label}</span>
      )}
    </div>
  );
}

export function getEstimateTypeLabel(type: string): string {
  return typeConfig[type as keyof typeof typeConfig]?.label || "Roofing";
}

export const ESTIMATE_TYPES = [
  { value: "roofing", label: "Roofing", icon: Home },
  { value: "gutter", label: "Gutters", icon: Droplets },
  { value: "framing", label: "Framing", icon: Hammer },
  { value: "garage_door", label: "Garage Door", icon: DoorOpen },
];
