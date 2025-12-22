import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  ExternalLink,
  Copy,
  QrCode,
  Settings,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { InstantEstimator, useDeleteEstimator } from "@/hooks/useInstantEstimators";
import { EstimateTypeIcon, getEstimateTypeLabel } from "./EstimateTypeIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface EstimatorCardProps {
  estimator: InstantEstimator;
}

export function EstimatorCard({ estimator }: EstimatorCardProps) {
  const navigate = useNavigate();
  const deleteEstimator = useDeleteEstimator();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const estimatorUrl = `${window.location.origin}/estimate/${estimator.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(estimatorUrl);
    toast.success("Link copied to clipboard");
  };

  const handleDelete = async () => {
    await deleteEstimator.mutateAsync(estimator.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:border-primary/30 cursor-pointer",
          "bg-gradient-to-br from-card to-card/80"
        )}
        onClick={() => navigate(`/instant-estimator/${estimator.id}`)}
      >
        {/* Status indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1",
            estimator.is_active
              ? "bg-gradient-to-r from-success to-success/50"
              : "bg-gradient-to-r from-muted to-muted/50"
          )}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <EstimateTypeIcon type={estimator.estimate_type} size="md" />
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {estimator.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {getEstimateTypeLabel(estimator.estimate_type)}
                  </Badge>
                  <Badge
                    variant={estimator.is_active ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      estimator.is_active && "bg-success/20 text-success border-success/30"
                    )}
                  >
                    {estimator.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(estimatorUrl, "_blank");
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink();
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info("QR Code feature coming soon");
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/instant-estimator/${estimator.id}`);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 py-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>0 views</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>0 leads</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Created {format(new Date(estimator.created_at), "MMM d, yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/instant-estimator/${estimator.id}`);
              }}
            >
              Configure →
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{estimator.name}"? This action
              cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
