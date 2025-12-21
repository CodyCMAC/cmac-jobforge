import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  href?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, href, className }: StatCardProps) {
  return (
    <div className={cn("stat-card group cursor-pointer", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-sm font-medium mt-2",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              {trend.positive ? "+" : ""}{trend.value}%
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          {href && (
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
}
