import { MainLayout, PageHeader } from "@/components/layout";
import { PipelineBoard, Job, PipelineStage } from "@/components/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, Search, Filter, Grid3X3, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockJobs: Job[] = [
  {
    id: "1",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "CMAC IT Testing",
    value: 0,
    status: "new",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    assignee: { initials: "CV", name: "Cody Viveiros" },
  },
  {
    id: "2",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "betty white",
    value: 0,
    status: "new",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    assignee: { initials: "CV", name: "Cody Viveiros" },
  },
  {
    id: "3",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "katt williams",
    value: 0,
    status: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    assignee: { initials: "CV", name: "Cody Viveiros" },
  },
  {
    id: "4",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "stone cold",
    value: 0,
    status: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    assignee: { initials: "CV", name: "Cody Viveiros" },
  },
  {
    id: "5",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "Vanna White",
    value: 0,
    status: "new",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignee: { initials: "CV", name: "Cody Viveiros" },
  },
  {
    id: "6",
    address: "199 County Road 4840, Haslet, TX 76052",
    customerName: "Test Customer",
    value: 0,
    status: "scheduled",
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    assignee: { initials: "AI", name: "Admin" },
  },
];

const salesPipelineStages: PipelineStage[] = [
  {
    id: "new-lead",
    name: "New lead",
    color: "blue",
    jobs: mockJobs.filter(j => j.status === "new"),
  },
  {
    id: "appointment-scheduled",
    name: "Appointment scheduled",
    color: "cyan",
    jobs: mockJobs.filter(j => j.status === "scheduled"),
  },
  {
    id: "proposal-sent",
    name: "Proposal sent/presented",
    color: "purple",
    jobs: [],
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
    jobs: [
      {
        id: "7",
        address: "612 Inglenook Court, Coppell, TX 75019",
        customerName: "Rick Cashmen",
        value: 93583.71,
        status: "signed",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignee: { initials: "JG", name: "Jason Gamez" },
        proposalStatus: "won",
      },
    ],
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
    jobs: [],
  },
  {
    id: "post-production",
    name: "Post-production",
    color: "teal",
    jobs: [],
  },
];

type ViewMode = "board" | "list";
type WorkflowType = "sales" | "production";

export default function Jobs() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [workflow, setWorkflow] = useState<WorkflowType>("sales");
  const [searchQuery, setSearchQuery] = useState("");

  const stages = workflow === "sales" ? salesPipelineStages : productionPipelineStages;

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
            <Button variant="outline" className="gap-2">
              All workflows
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters & sort
            </Button>
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
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Pipeline Board */}
        <PipelineBoard stages={stages} />
      </div>
    </MainLayout>
  );
}
