import { forwardRef, useState } from "react";
import { Job } from "@/components/jobs/types";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  MoreHorizontal,
  Star,
  Calendar,
  FileText,
  Paperclip,
  FileCheck,
  MessageSquare,
  Loader2,
  MessageCircle,
  Copy,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useJobActivities, JobActivity } from "@/hooks/useJobActivities";
import { toast } from "sonner";

interface JobActivitySidebarProps {
  job: Job & { customerEmail?: string; customerPhone?: string };
}

export const JobActivitySidebar = forwardRef<HTMLDivElement, JobActivitySidebarProps>(
  ({ job }, ref) => {
    const { activities, isLoading, addActivity } = useJobActivities(job.id);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteText, setNoteText] = useState("");

    const handleEmail = () => {
      if (job.customerEmail) {
        window.location.href = `mailto:${job.customerEmail}`;
        return;
      }
      toast.error("No email address on this job");
    };

    const handleCall = () => {
      if (job.customerPhone) {
        window.location.href = `tel:${job.customerPhone}`;
        return;
      }
      toast.error("No phone number on this job");
    };

    const handleSms = () => {
      if (job.customerPhone) {
        window.location.href = `sms:${job.customerPhone}`;
        return;
      }
      toast.error("No phone number on this job");
    };

    const handleCopyDetails = () => {
      const details = [
        job.customerName,
        job.customerEmail,
        job.customerPhone,
        job.address,
      ].filter(Boolean).join("\n");
      navigator.clipboard.writeText(details);
      toast.success("Contact details copied");
    };

    const hasEmail = !!job.customerEmail;
    const hasPhone = !!job.customerPhone;

    const getActivityIcon = (type: string) => {
      switch (type) {
        case "email":
          return <Mail className="h-4 w-4" />;
        case "event":
          return <Calendar className="h-4 w-4" />;
        case "attachment":
          return <Paperclip className="h-4 w-4" />;
        case "proposal_update":
          return <FileCheck className="h-4 w-4" />;
        case "note":
          return <MessageSquare className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    };

    const handleAddNote = () => {
      if (!noteText.trim()) return;
      addActivity.mutate(
        { type: "note", title: "Internal note added", body: noteText.trim() },
        {
          onSuccess: () => {
            toast.success("Note added");
            setNoteText("");
            setNoteDialogOpen(false);
          },
        }
      );
    };

    return (
      <div ref={ref} className="w-80 border-l border-border bg-muted/30 flex flex-col h-full">
        {/* Customer Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{job.customerName}</h3>
              <Star className="h-4 w-4 text-warning fill-warning" />
            </div>
            <div className="flex items-center gap-1">
              {hasEmail && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleEmail}
                  aria-label="Email customer"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
              {hasPhone && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCall}
                    aria-label="Call customer"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSms}
                    aria-label="Text customer"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyDetails}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy contact details
                  </DropdownMenuItem>
                  {hasEmail && (
                    <DropdownMenuItem onClick={handleEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send email
                    </DropdownMenuItem>
                  )}
                  {hasPhone && (
                    <>
                      <DropdownMenuItem onClick={handleCall}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSms}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send text
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Contact Role Badge */}
          <div className="mb-3">
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              Customer
            </Badge>
          </div>
        </div>

        {/* Activity Log */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex items-center border-b border-border sticky top-0 bg-muted/30">
            <h4 className="font-semibold">Activity log</h4>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No activity yet.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(activity.created_at), "MMM d 'at' h:mm a")}
                      </span>
                    </div>
                    {activity.body && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">
                        {activity.body}
                      </p>
                    )}
                    {activity.created_by_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        By {activity.created_by_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNoteDialogOpen(true)}>
            Internal note
          </Button>
          {hasEmail && (
            <Button variant="outline" size="sm" className="gap-1" onClick={handleEmail}>
              <Mail className="h-3 w-3" />
              Compose
            </Button>
          )}
        </div>

        {/* Internal Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Internal Note</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[120px]"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={addActivity.isPending}>
                {addActivity.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

JobActivitySidebar.displayName = "JobActivitySidebar";
