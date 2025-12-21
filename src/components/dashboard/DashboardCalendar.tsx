import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  type: "sales" | "production" | "dropoff" | "other";
}

interface CalendarDay {
  date: number;
  events: CalendarEvent[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
}

const eventTypeColors = {
  sales: "bg-primary/10 text-primary border-l-2 border-primary",
  production: "bg-success/10 text-success border-l-2 border-success",
  dropoff: "bg-warning/10 text-warning border-l-2 border-warning",
  other: "bg-muted text-muted-foreground border-l-2 border-muted-foreground",
};

// Mock data for the current week
const mockWeekData: CalendarDay[] = [
  { date: 14, events: [], isCurrentMonth: true },
  { date: 15, events: [{ id: "1", title: "Good Morning!!! Office |", time: "", type: "other" }], isCurrentMonth: true },
  { date: 16, events: [{ id: "2", title: "CMAC & VIVID", time: "10:00am", type: "sales" }], isCurrentMonth: true },
  { date: 17, events: [], isCurrentMonth: true },
  { date: 18, events: [
    { id: "3", title: "Cancel Lovable.dev men", time: "", type: "other" },
    { id: "4", title: "411 Operating Systems -", time: "", type: "production" },
    { id: "5", title: "411 Operating Systems -", time: "", type: "production" },
  ], isCurrentMonth: true },
  { date: 19, events: [
    { id: "6", title: "Secret Santa Gift Exchar", time: "", type: "sales" },
    { id: "7", title: "Cancel Lovable.dev men", time: "", type: "other" },
    { id: "8", title: "CMAC & Vivid Dev Meet", time: "", type: "sales" },
  ], isCurrentMonth: true },
  { date: 20, events: [
    { id: "9", title: "Andrew Tate vs. Chase E", time: "", type: "sales" },
    { id: "10", title: "Cancel Lovable.dev men", time: "", type: "other" },
    { id: "11", title: "Andrew Tate vs. Chase E", time: "", type: "sales" },
  ], isToday: true, isCurrentMonth: true },
];

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function DashboardCalendar() {
  const [currentDate] = useState(new Date());
  
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{formattedDate}</h3>
            <p className="text-sm text-muted-foreground mt-1">Your upcoming events are displayed below</p>
          </div>
          <Link to="/calendar" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            <ExternalLink className="w-4 h-4" />
            View calendar
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {days.map((day, idx) => (
                <th key={day} className={cn(
                  "px-4 py-3 text-xs font-medium text-muted-foreground text-left",
                  idx === 6 && "text-primary"
                )}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {mockWeekData.map((day) => (
                <td key={day.date} className="px-2 py-3 align-top border-r border-border last:border-r-0 min-w-[100px]">
                  <span className={cn(
                    "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-2",
                    day.isToday && "bg-primary text-primary-foreground",
                    !day.isToday && "text-foreground"
                  )}>
                    {day.date}
                  </span>
                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "px-2 py-1 text-xs rounded truncate",
                          eventTypeColors[event.type]
                        )}
                      >
                        {event.title} {event.time && <span className="text-muted-foreground">{event.time}</span>}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <p className="text-xs text-muted-foreground px-2">+{day.events.length - 3} more</p>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
