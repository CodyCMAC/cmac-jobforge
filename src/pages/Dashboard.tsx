import { useState, useMemo } from "react";
import { MainLayout, PageHeader } from "@/components/layout";
import { StatCard, DashboardCalendar } from "@/components/dashboard";
import { NewItemDropdown } from "@/components/dashboard/NewItemDropdown";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { PulsePanel } from "@/components/dashboard/PulsePanel";
import { JobDrawer } from "@/components/jobs/JobDrawer";
import { Users, FileText, Eye, Receipt } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useProposals } from "@/hooks/useProposals";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "User";
  const { data: jobs = [] } = useJobs();
  const { data: proposals = [] } = useProposals();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  // Calculate real stats from data
  const stats = useMemo(() => {
    const unactionedLeads = jobs.filter(j => j.status === "new").length;
    
    const sentProposals = proposals.filter(p => p.status === "sent");
    const sentProposalValue = sentProposals.reduce((sum, p) => sum + p.total, 0);
    
    const viewedProposals = proposals.filter(p => p.status === "viewed");
    const viewedProposalValue = viewedProposals.reduce((sum, p) => sum + p.total, 0);
    
    // For overdue invoices, we'd need an invoices table - for now show 0
    const overdueInvoices = 0;
    const overdueInvoiceValue = 0;

    return [
      {
        title: "Unactioned leads",
        value: unactionedLeads,
        icon: Users,
        href: "/jobs?stage=new-lead",
      },
      {
        title: "Unopened sent proposals",
        value: sentProposals.length,
        subtitle: `$${sentProposalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        icon: FileText,
        href: "/proposals?status=sent",
      },
      {
        title: "Unsigned viewed proposals",
        value: viewedProposals.length,
        subtitle: `$${viewedProposalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        icon: Eye,
        href: "/proposals?status=viewed",
      },
      {
        title: "Overdue invoices",
        value: overdueInvoices,
        subtitle: `$${overdueInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        icon: Receipt,
        href: "/invoices?status=overdue",
      },
    ];
  }, [jobs, proposals]);

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-3xl">👋</span> Hi {userName}, welcome home
          </h1>
          <div className="flex items-center gap-3">
            <UserDropdown userName={user?.email || "User"} />
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
