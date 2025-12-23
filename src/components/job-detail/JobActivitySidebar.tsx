import { Job } from "@/components/jobs/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Plus, MoreHorizontal, Star, MessageSquare, Inbox, ChevronDown, Calendar, FileText, Paperclip, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "email" | "event" | "attachment" | "proposal_update";
  title: string;
  description: string;
  timestamp: Date;
  user: string;
}

interface JobActivitySidebarProps {
  job: Job & { customerEmail?: string; customerPhone?: string };
}

export function JobActivitySidebar({ job }: JobActivitySidebarProps) {
  // Mock activity items
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "email",
      title: "Jason Gamez sent an email",
      description: `Subject: 612 Inglenook Ct\nI am meeting with him next tuesday and getting checks Wants to start on Jan 5th Work order link This message was sent by Roofr.com on behalf of CMAC Roofing.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      user: "Jason Gamez"
    },
    {
      id: "2",
      type: "event",
      title: "Event created",
      description: "Jason Gamez created an event",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      user: "Jason Gamez"
    },
    {
      id: "3",
      type: "attachment",
      title: "Attachment created",
      description: '"Supplemental estimate[97].pdf" created by Jason Gamez',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      user: "Jason Gamez"
    },
    {
      id: "4",
      type: "proposal_update",
      title: "Proposal status updated",
      description: "Proposal status updated to Draft by Jason Gamez",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      user: "Jason Gamez"
    }
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "attachment":
        return <Paperclip className="h-4 w-4" />;
      case "proposal_update":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-muted/30 flex flex-col h-full">
      {/* Customer Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{job.customerName}</h3>
            <Star className="h-4 w-4 text-warning fill-warning" />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Company/Contact Card */}
        <div className="bg-background border border-border rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Ateam</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Mail className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Phone className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add contact
        </Button>
      </div>

      {/* Activity Log */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-muted/30">
          <h4 className="font-semibold">Activity log</h4>
          <Button variant="link" size="sm" className="text-primary">
            Filter
          </Button>
        </div>

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
                    {format(activity.timestamp, "MMM d 'at' h:mm a")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">
                  {activity.description}
                </p>
                {activity.type === "email" && (
                  <button className="text-xs text-primary hover:underline mt-1">
                    View message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border flex items-center gap-2">
        <Button variant="outline" size="sm">Internal note</Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Inbox className="h-3 w-3" />
          Inbox
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Compose
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
