import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Send, MessageSquare, Clock, MapPin, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job, formatCurrency, timeAgo, getStatusBadgeClasses } from "./types";
import { useJobActivity } from "@/hooks/useJobActivityFeed";
import { useCreateComment } from "@/hooks/useJobComments";
import { getActivityIcon, getActivityColor } from "@/components/dashboard/PulsePanel";

interface JobDrawerProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDrawer({ job, open, onOpenChange }: JobDrawerProps) {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const { data: activities = [] } = useJobActivity(job?.id || "");
  const createComment = useCreateComment(job?.id || "");

  if (!job) return null;

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    await createComment.mutateAsync({ body: comment.trim() });
    setComment("");
  };

  const handleOpenFullJob = () => {
    onOpenChange(false);
    navigate(`/jobs/${job.id}`);
  };

  const statusLabels: Record<Job["status"], string> = {
    new: "New Lead",
    scheduled: "Appointment Scheduled",
    sent: "Proposal Sent",
    signed: "Proposal Signed",
    production: "Production",
    complete: "Complete",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate pr-4">
                {job.customerName}
              </SheetTitle>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{job.address}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Value
            </div>
            <div className="font-semibold">{formatCurrency(job.value)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              Assignee
            </div>
            <div className="font-semibold">{job.assignee.name}</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="capitalize">
            {statusLabels[job.status]}
          </Badge>
          {job.proposalStatus && (
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium capitalize",
              getStatusBadgeClasses(job.proposalStatus)
            )}>
              {job.proposalStatus}
            </span>
          )}
        </div>

        <Separator className="my-4" />

        {/* Quick Comment */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Quick Comment</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[60px] resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmitComment();
                }
              }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={!comment.trim() || createComment.isPending}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Recent Activity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            {activities.length > 0 && (
              <span className="text-xs text-muted-foreground">{activities.length} items</span>
            )}
          </div>
          
          {activities.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No activity yet
            </div>
          ) : (
            <div className="space-y-3 max-h-[240px] overflow-y-auto">
              {activities.slice(0, 5).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                      colorClass
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{activity.summary}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Open Full Job Button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleOpenFullJob}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Full Job
        </Button>
      </SheetContent>
    </Sheet>
  );
}
