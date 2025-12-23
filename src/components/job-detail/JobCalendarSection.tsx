import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface JobCalendarSectionProps {
  jobId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "appointment" | "install" | "followup";
}

export function JobCalendarSection({ jobId: _jobId }: JobCalendarSectionProps) {
  const navigate = useNavigate();

  // Job-specific calendar events are not wired to the database yet.
  const events: CalendarEvent[] = [];

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "install":
        return "bg-primary/10 border-primary text-primary";
      case "appointment":
        return "bg-warning/10 border-warning text-warning";
      case "followup":
        return "bg-muted border-border text-muted-foreground";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Calendar</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/calendar")}
          >
            <Calendar className="h-4 w-4" />
            View calendar
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => toast.info("Job calendar events coming soon")}
          >
            <Plus className="h-4 w-4" />
            Event
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border-l-4",
              getEventColor(event.type)
            )}
          >
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {format(event.date, "EEE")}
              </p>
              <p className="text-2xl font-bold">{format(event.date, "MMM d yyyy")}</p>
            </div>
            <div className="flex-1 px-6">
              <p className="font-medium text-primary">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.time}</p>
            </div>
            <div className="text-xs font-medium text-muted-foreground">—</div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
          </div>
        )}
      </div>

      {/* Past Events Link */}
      <button
        className="flex items-center gap-1 text-sm text-primary hover:underline"
        onClick={() => toast.info("Past events coming soon")}
        type="button"
      >
        <ChevronDown className="h-4 w-4" />
        Past events (0)
      </button>
    </div>
  );
}
