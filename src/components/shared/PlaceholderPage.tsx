import { MainLayout, PageHeader } from "@/components/layout";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function PlaceholderPage({ title, description, icon: Icon, actionLabel, onAction }: PlaceholderPageProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      toast.info(`${actionLabel || 'Create'} feature coming soon`);
    }
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title={title}
          actions={actionLabel && (
            <Button className="gap-2" onClick={handleAction}>
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
        />

        {/* Empty State */}
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
            {description && <p className="text-muted-foreground max-w-md">{description}</p>}
            {actionLabel && (
              <Button className="mt-4 gap-2" onClick={handleAction}>
                <Plus className="w-4 h-4" />
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
