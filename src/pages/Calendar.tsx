import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Settings, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock calendar data
const mockEvents = [
  { id: "1", date: 1, title: "PUT NEW BATTERI...", time: "", type: "other" as const },
  { id: "2", date: 2, title: "Good Morni...", time: "9:30am", type: "sales" as const },
  { id: "3", date: 2, title: "CMAC & VI...", time: "10:00am", type: "sales" as const },
  { id: "4", date: 3, title: "Jelil appt", time: "10:40am", type: "sales" as const },
  { id: "5", date: 4, title: "Weekly Tea...", time: "8:45am", type: "production" as const },
  { id: "6", date: 4, title: "411 Operating...", time: "9:00am", type: "production" as const },
  { id: "7", date: 5, title: "CMAC & Vi...", time: "10:00am", type: "sales" as const },
  { id: "8", date: 9, title: "Good Morni...", time: "9:30am", type: "sales" as const },
  { id: "9", date: 10, title: "CMAC & VI...", time: "10:00am", type: "sales" as const },
  { id: "10", date: 11, title: "411 Operating...", time: "9:00am", type: "production" as const },
  { id: "11", date: 12, title: "CMAC & Vi...", time: "10:00am", type: "sales" as const },
  { id: "12", date: 12, title: "CMAC Chris...", time: "1:00pm", type: "dropoff" as const },
  { id: "13", date: 15, title: "Good Morni...", time: "9:30am", type: "sales" as const },
  { id: "14", date: 16, title: "CMAC & VI...", time: "10:00am", type: "sales" as const },
  { id: "15", date: 18, title: "411 Operating...", time: "9:00am", type: "production" as const },
  { id: "16", date: 19, title: "Secret Santa...", time: "12:00pm", type: "sales" as const },
  { id: "17", date: 19, title: "Cancel Lov...", time: "10:00am", type: "other" as const },
  { id: "18", date: 19, title: "CMAC & Vi...", time: "4:00pm", type: "sales" as const },
  { id: "19", date: 20, title: "Andrew Tat...", time: "12:00pm", type: "sales" as const },
  { id: "20", date: 20, title: "Cancel Lova...", time: "2:45pm", type: "other" as const },
  { id: "21", date: 23, title: "NO WORK", time: "", type: "other" as const },
  { id: "22", date: 25, title: "Weekly Tea...", time: "8:45am", type: "production" as const },
  { id: "23", date: 26, title: "NO WORK", time: "", type: "other" as const },
];

const eventTypeColors = {
  sales: "bg-primary/10 text-primary",
  production: "bg-success/10 text-success",
  dropoff: "bg-warning/10 text-warning",
  other: "bg-muted text-muted-foreground",
};

const eventTypeLegend = [
  { type: "sales", label: "Sales", color: "bg-primary" },
  { type: "dropoff", label: "Dropoffs and pickups", color: "bg-warning" },
  { type: "production", label: "Production", color: "bg-success" },
  { type: "other", label: "Post-production", color: "bg-info" },
];

const teamMembers = [
  { name: "Cody Viveiros", selected: true },
  { name: "Admin Roofing", selected: false },
  { name: "Cory Moore", selected: false },
  { name: "Jason Gamez", selected: false },
];

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days: { date: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  
  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, isCurrentMonth: false, isToday: false });
  }
  
  // Current month days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false });
  }
  
  return days;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendarDays = generateCalendarDays(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (date: number) => {
    return mockEvents.filter(e => e.date === date);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">{monthName}</h1>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              Monthly
              <ChevronLeft className="w-4 h-4 rotate-[-90deg]" />
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Event
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Calendar */}
          <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {daysOfWeek.map((day) => (
                <div key={day} className="py-3 px-4 text-xs font-medium text-muted-foreground text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const events = day.isCurrentMonth ? getEventsForDay(day.date) : [];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[120px] p-2 border-b border-r border-border",
                      !day.isCurrentMonth && "bg-muted/30",
                      idx % 7 === 6 && "border-r-0"
                    )}
                  >
                    <span className={cn(
                      "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1",
                      day.isToday && "bg-primary text-primary-foreground font-semibold",
                      !day.isCurrentMonth && "text-muted-foreground"
                    )}>
                      {day.date}
                    </span>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "px-2 py-1 text-xs rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                            eventTypeColors[event.type]
                          )}
                        >
                          {event.title} {event.time && <span className="opacity-70">{event.time}</span>}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <p className="text-xs text-muted-foreground px-2">+{events.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 space-y-6">
            {/* Mini Calendar */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">{monthName}</h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="text-xs text-muted-foreground py-1">{d}</span>
                ))}
                {calendarDays.slice(0, 35).map((day, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "text-xs py-1 rounded hover:bg-accent",
                      day.isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                      !day.isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Filter */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Team</h3>
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Select all
                  <span className="text-muted-foreground">1 selected</span>
                </button>
              </div>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <label key={member.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={member.selected}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Event Types */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Event types</h3>
                <span className="text-xs text-muted-foreground">Showing all events</span>
              </div>
              <div className="space-y-2">
                {eventTypeLegend.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded", item.color)} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
