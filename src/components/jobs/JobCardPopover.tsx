import { Phone, Mail, MessageSquare, Clock } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { timeAgo } from "./types";

interface JobCardPopoverProps {
  children: React.ReactNode;
  customerPhone?: string | null;
  customerEmail?: string | null;
  lastCommentSnippet?: string | null;
  lastActivityAt?: Date | null;
  commentCount?: number;
}

export function JobCardPopover({ 
  children, 
  customerPhone, 
  customerEmail, 
  lastCommentSnippet,
  lastActivityAt,
  commentCount = 0,
}: JobCardPopoverProps) {
  const hasExtraInfo = customerPhone || customerEmail || lastCommentSnippet;
  
  if (!hasExtraInfo) {
    return <>{children}</>;
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-72 p-3" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Contact Info */}
          {(customerPhone || customerEmail) && (
            <div className="space-y-1.5">
              {customerPhone && (
                <a 
                  href={`tel:${customerPhone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{customerPhone}</span>
                </a>
              )}
              {customerEmail && (
                <a 
                  href={`mailto:${customerEmail}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{customerEmail}</span>
                </a>
              )}
            </div>
          )}

          {/* Last Activity */}
          {lastActivityAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last activity {timeAgo(lastActivityAt)}</span>
            </div>
          )}

          {/* Last Comment */}
          {lastCommentSnippet && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {lastCommentSnippet}
                </p>
              </div>
            </div>
          )}

          {/* Comment Count */}
          {commentCount > 0 && !lastCommentSnippet && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
