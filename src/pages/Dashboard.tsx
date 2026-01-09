import { useState } from "react";
import { MainLayout, PageHeader } from "@/components/layout";
import { StatCard, DashboardCalendar } from "@/components/dashboard";
import { NewItemDropdown } from "@/components/dashboard/NewItemDropdown";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { PulsePanel } from "@/components/dashboard/PulsePanel";
import { JobDrawer } from "@/components/jobs/JobDrawer";
import { Users, FileText, Eye, Receipt } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";

const stats = [
  {
    title: "Unactioned leads",
    value: 14,
    icon: Users,
    href: "/jobs?stage=new-lead",
  },
  {
    title: "Unopened sent proposals",
    value: 0,
    subtitle: "$0.00",
    icon: FileText,
    href: "/proposals?status=sent",
  },
  {
    title: "Unsigned viewed proposals",
    value: 0,
    subtitle: "$0.00",
    icon: Eye,
    href: "/proposals?status=viewed",
  },
  {
    title: "Overdue invoices",
    value: 0,
    subtitle: "$0.00",
    icon: Receipt,
    href: "/invoices?status=overdue",
  },
];

export default function Dashboard() {
  const userName = "Cody";
  const { data: jobs = [] } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-3xl">👋</span> Hi {userName}, welcome home
          </h1>
          <div className="flex items-center gap-3">
            <UserDropdown userName="Cody Viveiros" />
            <NewItemDropdown />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Jobs Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your jobs</h2>
                <p className="text-sm text-muted-foreground">Some of your jobs may need a follow-up</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    href={stat.href}
                  />
                ))}
              </div>
            </div>

            {/* Calendar Section */}
            <DashboardCalendar />
          </div>

          {/* Right Column - Pulse Panel */}
          <div className="lg:col-span-1">
            <PulsePanel 
              className="sticky top-6"
              onJobClick={(jobId) => setSelectedJobId(jobId)}
            />
          </div>
        </div>
      </div>

      {/* Job Drawer */}
      <JobDrawer
        job={selectedJob}
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      />
    </MainLayout>
  );
}
