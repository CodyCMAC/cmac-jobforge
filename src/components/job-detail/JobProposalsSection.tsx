import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ChevronDown, FileText, CheckCircle, MoreHorizontal } from "lucide-react";
import { formatCurrency, getStatusBadgeClasses } from "@/components/jobs/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface JobProposalsSectionProps {
  jobId: string;
  proposals: any[];
}

export function JobProposalsSection({ jobId, proposals }: JobProposalsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Proposals</h3>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Proposal
        </Button>
      </div>

      {/* Success Banner */}
      {proposals.length > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <p className="font-semibold text-success">Your proposal has been successfully created!</p>
            <p className="text-sm text-muted-foreground mt-1">
              When you create a proposal, a job record is automatically created. Use this card to keep track of customer details, notes, attachments, and everything else.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-3">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            onClick={() => navigate(`/proposals/${proposal.id}`)}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{proposal.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Moved to {proposal.status} by Jason Gamez</span>
                  <span>• {format(new Date(proposal.updated_at), "MMM d, h:mm a")}</span>
                  <button className="text-primary hover:underline">
                    <ChevronDown className="h-3 w-3 inline" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatCurrency(proposal.total)}</span>
              <Badge className={cn("gap-1", getStatusBadgeClasses(proposal.status === "signed" ? "won" : proposal.status))}>
                <CheckCircle className="h-3 w-3" />
                {proposal.status === "signed" ? "Won" : proposal.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No proposals yet</p>
            <Button variant="link" size="sm" className="mt-2">
              Create your first proposal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
