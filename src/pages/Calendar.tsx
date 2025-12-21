import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Settings, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendarDays = generateCalendarDays(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleSyncGoogleCalendar = () => {
    toast.info("Google Calendar sync requires API configuration. Add your Google API credentials to connect.");
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
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleSyncGoogleCalendar}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sync Google Calendar
            </Button>
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
