import { MainLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/jobs/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Plus, 
  MoreHorizontal, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  CalendarPlus, 
  ClipboardList,
  Copy
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { JobDetailsTab } from "@/components/job-detail/JobDetailsTab";
import { JobTasksTab } from "@/components/job-detail/JobTasksTab";
import { JobCalendarSection } from "@/components/job-detail/JobCalendarSection";
import { JobMeasurementsSection } from "@/components/job-detail/JobMeasurementsSection";
import { JobProposalsSection } from "@/components/job-detail/JobProposalsSection";
import { JobWorkOrdersSection } from "@/components/job-detail/JobWorkOrdersSection";
import { JobFinancialsSection } from "@/components/job-detail/JobFinancialsSection";
import { JobFinancialsTab } from "@/components/job-detail/JobFinancialsTab";
import { JobAttachmentsSection } from "@/components/job-detail/JobAttachmentsSection";
import { JobActivitySidebar } from "@/components/job-detail/JobActivitySidebar";
import { JobCommentsSection } from "@/components/job-detail/JobCommentsSection";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CreateProposalDialog } from "@/components/proposals/CreateProposalDialog";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  // Check for comment anchor in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#comment-')) {
      setActiveTab('comments');
      // Scroll to comment after a short delay
      setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-primary');
          setTimeout(() => element.classList.remove('ring-2', 'ring-primary'), 2000);
        }
      }, 300);
    }
  }, []);

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
        commentCount: data.comment_count,
        lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : null,
        lastCommentAt: data.last_comment_at ? new Date(data.last_comment_at) : null,
        lastCommentSnippet: data.last_comment_snippet,
        priority: data.priority,
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
    { id: "comments", label: `Comments${(job.commentCount ?? 0) > 0 ? ` (${job.commentCount})` : ''}` },
    { id: "calendar", label: "Calendar" },
    { id: "measurements", label: "Measurements" },
    { id: "proposals", label: "Proposals" },
    { id: "work-orders", label: "Work orders" },
    { id: "financials", label: "Financials" },
    { id: "attachments", label: "Attachments" },
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard");
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setActiveTab("tasks");
                      toast.info("Add a new task below");
                    }}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Add task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setActiveTab("comments");
                    }}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add comment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowCreateProposal(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Create proposal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setActiveTab("calendar");
                      toast.info("Add calendar event below");
                    }}>
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Add calendar event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setActiveTab("work-orders");
                      toast.info("Create work order below");
                    }}>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Create work order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            {activeTab === "comments" && <JobCommentsSection jobId={job.id} />}
            {activeTab === "calendar" && <JobCalendarSection jobId={job.id} />}
            {activeTab === "measurements" && <JobMeasurementsSection jobId={job.id} />}
            {activeTab === "proposals" && <JobProposalsSection jobId={job.id} proposals={proposals} />}
            {activeTab === "work-orders" && <JobWorkOrdersSection jobId={job.id} />}
            {activeTab === "financials" && <JobFinancialsTab jobId={job.id} />}
            {activeTab === "attachments" && <JobAttachmentsSection jobId={job.id} />}
          </div>
        </div>

        {/* Right Sidebar - Activity & Contact */}
        <JobActivitySidebar job={job} />
      </div>

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={showCreateProposal}
        onOpenChange={setShowCreateProposal}
        jobId={job.id}
      />
    </MainLayout>
  );
}
