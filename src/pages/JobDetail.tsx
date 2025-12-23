import { MainLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/jobs/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, Plus, MoreHorizontal, Mail, Phone, Calendar as CalendarIcon, FileText, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobDetailsTab } from "@/components/job-detail/JobDetailsTab";
import { JobTasksTab } from "@/components/job-detail/JobTasksTab";
import { JobCalendarSection } from "@/components/job-detail/JobCalendarSection";
import { JobMeasurementsSection } from "@/components/job-detail/JobMeasurementsSection";
import { JobProposalsSection } from "@/components/job-detail/JobProposalsSection";
import { JobWorkOrdersSection } from "@/components/job-detail/JobWorkOrdersSection";
import { JobFinancialsSection } from "@/components/job-detail/JobFinancialsSection";
import { JobAttachmentsSection } from "@/components/job-detail/JobAttachmentsSection";
import { JobActivitySidebar } from "@/components/job-detail/JobActivitySidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const transformedJob: Job & { 
        customerEmail?: string; 
        customerPhone?: string;
        proposalValue?: number;
      } = {
        id: data.id,
        address: data.address,
        customerName: data.customer_name,
        value: Number(data.value),
        status: data.status as Job["status"],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        assignee: {
          initials: data.assignee_initials,
          name: data.assignee_name,
        },
        proposalStatus: data.proposal_status as Job["proposalStatus"],
        customerEmail: data.customer_email || undefined,
        customerPhone: data.customer_phone || undefined,
      };

      return transformedJob;
    },
    enabled: !!id,
  });

  // Fetch related proposals for this job
  const { data: proposals = [] } = useQuery({
    queryKey: ["job-proposals", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Job not found</p>
          <Button variant="link" onClick={() => navigate("/jobs")}>
            Back to Jobs
          </Button>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: "details", label: "Job details" },
    { id: "tasks", label: "Tasks" },
    { id: "calendar", label: "Calendar" },
    { id: "measurements", label: "Measurements" },
    { id: "proposals", label: "Proposals" },
    { id: "pdf-signer", label: "PDF signer" },
    { id: "material-orders", label: "Material orders" },
    { id: "work-orders", label: "Work orders" },
    { id: "invoices", label: "Invoices" },
    { id: "job-costing", label: "Job costing" },
    { id: "attachments", label: "Attachments" },
    { id: "instant-estimate", label: "Instant Estimate" },
  ];

  // Calculate proposal total
  const proposalTotal = proposals.reduce((sum, p) => sum + Number(p.total || 0), 0);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background z-10 border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{job.address}</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => navigate("/jobs")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-4 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-6">
            {activeTab === "details" && (
              <JobDetailsTab job={job} proposals={proposals} proposalTotal={proposalTotal} />
            )}
            {activeTab === "tasks" && <JobTasksTab jobId={job.id} />}
            {activeTab === "calendar" && <JobCalendarSection jobId={job.id} />}
            {activeTab === "measurements" && <JobMeasurementsSection jobId={job.id} />}
            {activeTab === "proposals" && <JobProposalsSection jobId={job.id} proposals={proposals} />}
            {activeTab === "pdf-signer" && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>PDF Signer - Coming Soon</p>
              </div>
            )}
            {activeTab === "material-orders" && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Material Orders - Coming Soon</p>
              </div>
            )}
            {activeTab === "work-orders" && <JobWorkOrdersSection jobId={job.id} />}
            {activeTab === "invoices" && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Invoices - Coming Soon</p>
              </div>
            )}
            {activeTab === "job-costing" && <JobFinancialsSection proposals={proposals} />}
            {activeTab === "attachments" && <JobAttachmentsSection jobId={job.id} />}
            {activeTab === "instant-estimate" && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Instant Estimate - Coming Soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Activity & Contact */}
        <JobActivitySidebar job={job} />
      </div>
    </MainLayout>
  );
}
