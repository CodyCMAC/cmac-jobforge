import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Grid3X3, List, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CreateProposalDialog, ProposalActionsMenu } from "@/components/proposals";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Proposal {
  id: string;
  address: string;
  customerName: string;
  assignee: string;
  value: number;
  status: "won" | "draft" | "sent" | "viewed";
  createdAt: string;
  timeline: { action: string; date: string; user: string }[];
  thumbnail?: string;
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    address: "612 Inglenook Court, Coppell, TX 75019",
    customerName: "Rick Cashmen",
    assignee: "Jason Gamez",
    value: 87911.97,
    status: "won",
    createdAt: "Dec. 18, 7:01 AM",
    timeline: [
      { action: "Moved to Won", date: "Dec. 18, 7:36 AM", user: "Jason Gamez" },
      { action: "Reopened", date: "Dec. 18, 7:34 AM", user: "Jason Gamez" },
      { action: "Moved to Won", date: "Dec. 18, 7:24 AM", user: "Jason Gamez" },
      { action: "Created", date: "Dec. 18, 7:01 AM", user: "Jason Gamez" },
    ],
  },
  {
    id: "2",
    address: "2124 Stoney Gorge Road, Fort Worth, TX 76177",
    customerName: "No customer",
    assignee: "Cody Viveiros",
    value: 15714.29,
    status: "draft",
    createdAt: "Nov. 24, 8:26 PM",
    timeline: [
      { action: "Created", date: "Nov. 24, 8:26 PM", user: "Jason Gamez" },
    ],
  },
];

const statusColors = {
  won: "bg-success text-success-foreground",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary text-primary-foreground",
  viewed: "bg-warning text-warning-foreground",
};

export default function Proposals() {
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"proposals" | "templates" | "settings">("proposals");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProposals = statusFilter 
    ? mockProposals.filter(p => p.status === statusFilter)
    : mockProposals;

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Proposals"
          actions={
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              Proposal
            </Button>
          }
        />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab("proposals")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "proposals" 
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Proposals
            </button>
            <button 
              onClick={() => {
                setActiveTab("templates");
                toast.info("Templates feature coming soon");
              }}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "templates"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Templates
            </button>
            <button 
              onClick={() => {
                setActiveTab("settings");
                toast.info("Settings feature coming soon");
              }}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a customer or address..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)} className="flex items-center justify-between">
                    All Statuses
                    {!statusFilter && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")} className="flex items-center justify-between">
                    Draft
                    {statusFilter === "draft" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("sent")} className="flex items-center justify-between">
                    Sent
                    {statusFilter === "sent" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("viewed")} className="flex items-center justify-between">
                    Viewed
                    {statusFilter === "viewed" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("won")} className="flex items-center justify-between">
                    Won
                    {statusFilter === "won" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center border border-border rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded",
                    viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
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
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">No proposals match your filter.</p>
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const isExpanded = expandedId === proposal.id;
              return (
                <div key={proposal.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{proposal.address}</h3>
                            <p className="text-sm text-muted-foreground">
                              {proposal.customerName} • Assigned to {proposal.assignee}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-lg font-semibold text-foreground">
                              ${proposal.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium capitalize",
                              statusColors[proposal.status]
                            )}>
                              {proposal.status}
                            </span>
                            <ProposalActionsMenu proposalId={proposal.id} />
                          </div>
                        </div>

                        {/* Timeline Preview */}
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            {proposal.timeline.length > 0 && (
                              <>
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  proposal.status === "won" ? "bg-success" : "bg-muted-foreground"
                                )} />
                                <span className="text-muted-foreground">
                                  {proposal.timeline[0].action} by {proposal.timeline[0].user} • {proposal.timeline[0].date}
                                </span>
                              </>
                            )}
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Expanded Timeline */}
                        {isExpanded && proposal.timeline.length > 1 && (
                          <div className="mt-3 pl-4 border-l-2 border-border space-y-2">
                            {proposal.timeline.slice(1).map((event, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm relative">
                                <span className="absolute -left-[17px] w-2 h-2 rounded-full bg-muted-foreground/50" />
                                <span className="text-muted-foreground">
                                  {event.action} by {event.user} • {event.date}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateProposalDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </MainLayout>
  );
}
