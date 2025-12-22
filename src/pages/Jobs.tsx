import { MainLayout } from "@/components/layout";
import { PipelineBoard, PipelineStage } from "@/components/jobs";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, Search, Filter, Grid3X3, List, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type ViewMode = "board" | "list";
type WorkflowType = "sales" | "production";

export default function Jobs() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [workflow, setWorkflow] = useState<WorkflowType>("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);
  
  const { data: jobs = [], isLoading } = useJobs();

  // Build pipeline stages from database jobs
  const salesPipelineStages: PipelineStage[] = [
    {
      id: "new-lead",
      name: "New lead",
      color: "blue",
      jobs: jobs.filter(j => j.status === "new"),
    },
    {
      id: "appointment-scheduled",
      name: "Appointment scheduled",
      color: "cyan",
      jobs: jobs.filter(j => j.status === "scheduled"),
    },
    {
      id: "proposal-sent",
      name: "Proposal sent/presented",
      color: "purple",
      jobs: jobs.filter(j => j.status === "sent"),
    },
    {
      id: "proposal-followup",
      name: "Proposal follow-up",
      color: "orange",
      jobs: [],
    },
  ];

  const productionPipelineStages: PipelineStage[] = [
    {
      id: "proposal-signed",
      name: "Proposal signed",
      color: "green",
      jobs: jobs.filter(j => j.status === "signed"),
    },
    {
      id: "pre-production",
      name: "Pre-production",
      color: "yellow",
      jobs: [],
    },
    {
      id: "production",
      name: "Production",
      color: "orange",
      jobs: jobs.filter(j => j.status === "production"),
    },
    {
      id: "post-production",
      name: "Post-production",
      color: "teal",
      jobs: jobs.filter(j => j.status === "complete"),
    },
  ];

  const stages = workflow === "sales" ? salesPipelineStages : productionPipelineStages;

  const handleOpenSettings = () => {
    toast.info("Settings page coming soon");
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setWorkflow("sales")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                workflow === "sales"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Board view
            </button>
            <button
              onClick={() => setWorkflow("production")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                workflow === "production"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              List view
            </button>
            <button
              onClick={handleOpenSettings}
              className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {workflowFilter || "All workflows"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setWorkflowFilter(null)} className="flex items-center justify-between">
                  All workflows
                  {!workflowFilter && <Check className="w-4 h-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWorkflowFilter("Sales")} className="flex items-center justify-between">
                  Sales
                  {workflowFilter === "Sales" && <Check className="w-4 h-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWorkflowFilter("Production")} className="flex items-center justify-between">
                  Production
                  {workflowFilter === "Production" && <Check className="w-4 h-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters & sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Sort by date")}>
                  Sort by Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Sort by value")}>
                  Sort by Value
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Sort by customer")}>
                  Sort by Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("board")}
                className={cn(
                  "p-2 rounded",
                  viewMode === "board" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded",
                  viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>
        </div>

        {/* Pipeline Board */}
        {isLoading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-72 flex-shrink-0" />
            ))}
          </div>
        ) : (
          <PipelineBoard stages={stages} />
        )}
      </div>

      <CreateJobDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </MainLayout>
  );
}
