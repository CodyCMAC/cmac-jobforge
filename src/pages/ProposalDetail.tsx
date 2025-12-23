import { useParams, useNavigate } from "react-router-dom";
import { useProposal, useUpdateProposalStatus } from "@/hooks/useProposals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, ExternalLink, ChevronLeft, Settings, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LineItemDetailsModal } from "@/components/proposals/LineItemDetailsModal";
import cmacLogo from "@/assets/cmac-logo.png";

const statusColors = {
  won: "bg-success text-success-foreground",
  lost: "bg-destructive text-destructive-foreground",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary text-primary-foreground",
  viewed: "bg-warning text-warning-foreground",
};

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: proposal, isLoading } = useProposal(id || "");
  const updateStatus = useUpdateProposalStatus();
  
  const [activeSection, setActiveSection] = useState<string>("estimate");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Proposal not found</h1>
          <Button variant="outline" onClick={() => navigate("/proposals")}>
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: proposal.id, status: newStatus },
      {
        onSuccess: () => toast.success(`Proposal marked as ${newStatus}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const selectedOption = proposal.options?.find(o => o.id === selectedOptionId) || proposal.options?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/proposals")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to proposals
          </Button>
          <span className="text-sm text-muted-foreground">Changes auto-saved</span>
        </div>
        
        <h1 className="text-sm font-medium text-foreground">{proposal.job?.address || proposal.title}</h1>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge className={cn("cursor-pointer", statusColors[proposal.status])}>
                {proposal.status === "won" && <Check className="w-3 h-3 mr-1" />}
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusChange("draft")}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("sent")}>Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("viewed")}>Viewed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("won")}>Won</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("lost")}>Lost</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Create
                <ChevronLeft className="w-4 h-4 rotate-[270deg]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.info("Invoice creation coming soon")}>Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Work order creation coming soon")}>Work Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button>View</Button>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className={cn(
          "border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}>
          <div className="p-4">
            {/* Customer Info */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Customer</p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">{proposal.job?.customer_name || "No customer"}</p>
                {proposal.job?.customer_email && (
                  <a href={`mailto:${proposal.job.customer_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-1">
                    <Mail className="w-3 h-3" />
                    {proposal.job.customer_email}
                  </a>
                )}
                {proposal.job?.customer_phone && (
                  <a href={`tel:${proposal.job.customer_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-1">
                    <Phone className="w-3 h-3" />
                    {proposal.job.customer_phone}
                  </a>
                )}
              </div>
            </div>

            {/* Related */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Related</p>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => navigate(`/jobs`)}
              >
                <ExternalLink className="w-4 h-4" />
                View job details
              </Button>
            </div>

            {/* Proposal Sections */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                Proposal sections
                <span className="text-[10px] text-muted-foreground/50">(i)</span>
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection("cover")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    activeSection === "cover"
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Cover
                </button>
                
                <div>
                  <button
                    onClick={() => setActiveSection("estimate")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium",
                      activeSection === "estimate"
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Estimate
                  </button>
                  
                  {activeSection === "estimate" && proposal.options && (
                    <div className="ml-3 mt-1 space-y-1">
                      {proposal.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOptionId(option.id)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2",
                            selectedOptionId === option.id || (!selectedOptionId && option === proposal.options?.[0])
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {option.is_selected && <Check className="w-3 h-3 text-success" />}
                          {option.name}
                        </button>
                      ))}
                      <button
                        onClick={() => setActiveSection("summary")}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded text-sm",
                          (activeSection as string) === "summary"
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        Summary
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute left-[248px] top-1/2 -translate-y-1/2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted z-10"
          >
            <ChevronLeft className={cn("w-4 h-4", sidebarCollapsed && "rotate-180")} />
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {activeSection === "cover" && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Cover</h2>
                <p className="text-muted-foreground">Cover page content - customize your proposal cover here.</p>
              </div>
            )}

            {activeSection === "estimate" && selectedOption && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Estimate</h2>
                
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium">{selectedOption.name}</p>
                  <LineItemDetailsModal option={selectedOption} />
                </div>

                {/* Option Card */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="h-1 bg-foreground" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">{selectedOption.name}</h3>
                    {selectedOption.description && (
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        {selectedOption.description}
                      </p>
                    )}

                    {/* Line Items */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-3">Item</p>
                      {selectedOption.line_items?.map((item) => (
                        <div key={item.id} className="py-2 border-b border-border last:border-b-0">
                          <p className="font-semibold text-foreground">{item.category}</p>
                          {item.name && <p className="text-sm text-muted-foreground">{item.name}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">Estimate subtotal</p>
                      <p className="text-lg font-semibold text-foreground">
                        ${selectedOption.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Contractor Signature */}
                    <div className="mt-12 pt-6 border-t border-border flex justify-between items-end">
                      <div>
                        <p className="text-sm text-foreground">{proposal.contractor_signature}</p>
                        <p className="text-xs text-muted-foreground">CMAC Roofing</p>
                        <p className="text-xs text-muted-foreground">(903) 229-2624</p>
                        <p className="text-xs text-muted-foreground">jason@cmacroofing.com</p>
                      </div>
                      <img src={cmacLogo} alt="CMAC" className="h-8" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "summary" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="h-1 bg-foreground" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground mb-6">Please review and sign the proposal with any notes</p>

                    {proposal.options?.filter(o => o.is_selected).map((option) => (
                      <div key={option.id} className="bg-muted/30 rounded-lg p-4 mb-4">
                        <p className="font-medium text-foreground mb-2">{option.name}</p>
                        <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                        <p className="text-right text-lg font-semibold">
                          ${option.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}

                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${proposal.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${proposal.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="mt-6">
                      <label className="text-sm text-muted-foreground block mb-2">Customer notes</label>
                      <textarea 
                        className="w-full h-24 border border-border rounded-lg p-3 bg-background resize-none"
                        placeholder="Add any notes..."
                        defaultValue={proposal.customer_notes || ""}
                      />
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 grid grid-cols-2 gap-8">
                      <div>
                        <div className="border-b border-border pb-2 mb-2">
                          <p className="text-sm">{proposal.job?.customer_name || "_____________"}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <div className="border-b border-border pb-2 mt-4">
                          <p className="text-sm text-muted-foreground">Date</p>
                        </div>
                      </div>
                      <div>
                        <div className="border-b border-border pb-2 mb-2">
                          <p className="text-sm italic font-medium">{proposal.contractor_signature}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{proposal.contractor_signature}, CMAC Roofing</p>
                        <div className="border-b border-border pb-2 mt-4">
                          <p className="text-sm">{new Date().toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Date</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-8">
                      By signing this document you agree to the statement of works provided by CMAC Roofing and in accordance with any terms described within.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Quick Actions) */}
        <aside className="w-16 border-l border-border bg-card flex flex-col items-center py-4 gap-4">
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => toast.info("Estimate settings coming soon")}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Estimate</span>
            <span className="text-[10px]">settings</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => toast.info("Supplier integration coming soon")}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px]">Supplier</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
