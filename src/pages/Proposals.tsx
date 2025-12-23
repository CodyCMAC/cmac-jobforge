import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Grid3X3, List, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { CreateProposalDialog, ProposalActionsMenu } from "@/components/proposals";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useProposals } from "@/hooks/useProposals";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const statusColors = {
  won: "bg-success text-success-foreground",
  lost: "bg-destructive text-destructive-foreground",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary text-primary-foreground",
  viewed: "bg-warning text-warning-foreground",
};

export default function Proposals() {
  const navigate = useNavigate();
  const { data: proposals = [], isLoading } = useProposals();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"proposals" | "templates" | "settings">("proposals");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.job?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.job?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [proposals, statusFilter, searchQuery]);

  const handleProposalClick = (proposalId: string) => {
    navigate(`/proposals/${proposalId}`);
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <DropdownMenuItem onClick={() => setStatusFilter("lost")} className="flex items-center justify-between">
                    Lost
                    {statusFilter === "lost" && <Check className="w-4 h-4 ml-2" />}
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : filteredProposals.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">
                {proposals.length === 0 
                  ? "No proposals yet. Create your first proposal!" 
                  : "No proposals match your filter."}
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const isExpanded = expandedId === proposal.id;
              return (
                <div key={proposal.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleProposalClick(proposal.id)}
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
                            <h3 className="font-semibold text-foreground">{proposal.job?.address || proposal.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {proposal.job?.customer_name || "No customer"} • Assigned to {proposal.job?.assignee_name || "Unassigned"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-lg font-semibold text-foreground">
                              ${proposal.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              proposal.status === "won" ? "bg-success" : "bg-muted-foreground"
                            )} />
                            <span className="text-muted-foreground">
                              Created {format(new Date(proposal.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <button 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : proposal.id);
                            }}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-3 pl-4 border-l-2 border-border space-y-2">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Subtotal:</span> ${proposal.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Tax:</span> ${proposal.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Last updated:</span> {format(new Date(proposal.updated_at), "MMM d, h:mm a")}
                            </div>
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
