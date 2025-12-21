import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreHorizontal, Grid3X3, List, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Proposals"
          actions={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Proposal
            </Button>
          }
        />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button className="pb-3 text-sm font-medium border-b-2 border-primary text-primary">
              Proposals
            </button>
            <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors">
              Templates
            </button>
            <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors">
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
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <div className="flex items-center border border-border rounded-lg p-1">
                <button className="p-2 rounded bg-accent text-accent-foreground">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded text-muted-foreground hover:text-foreground">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {mockProposals.map((proposal) => {
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
          })}
        </div>
      </div>
    </MainLayout>
  );
}
