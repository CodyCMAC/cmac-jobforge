import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

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

export function JobCalendarSection({ jobId }: JobCalendarSectionProps) {
  // Mock events for demo
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Roof Install for 612 Inglenook Court",
      date: addDays(new Date(), 13),
      time: "All day",
      type: "install"
    }
  ];

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
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            View calendar
          </Button>
          <Button size="sm" className="gap-2">
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
            <Button variant="ghost" size="icon" className="rounded-full bg-primary text-primary-foreground">
              <span className="text-xs font-bold">JG</span>
            </Button>
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
      <button className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronDown className="h-4 w-4" />
        Past events (0)
      </button>
    </div>
  );
}
