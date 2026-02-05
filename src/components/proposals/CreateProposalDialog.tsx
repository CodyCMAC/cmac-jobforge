import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CreateProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
}

export function CreateProposalDialog({ open, onOpenChange, jobId }: CreateProposalDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    assignee: "",
    value: "",
    description: "",
    title: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId && (!formData.customerName.trim() || !formData.address.trim())) {
      toast.error("Customer name and address are required when creating without a job");
      return;
    }

    const title = formData.title.trim() || `Proposal - ${new Date().toLocaleDateString()}`;

    if (jobId) {
      // Create proposal for existing job
      setIsSubmitting(true);
      const { error } = await supabase.from("proposals").insert({
        job_id: jobId,
        title,
        status: "draft",
        total: formData.value ? parseFloat(formData.value) * 100 : 0,
        customer_notes: formData.description.trim() || null,
      });

      setIsSubmitting(false);

      if (error) {
        toast.error("Failed to create proposal: " + error.message);
        return;
      }

      toast.success("Proposal created successfully");
      queryClient.invalidateQueries({ queryKey: ["job-proposals", jobId] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      onOpenChange(false);
      setFormData({ customerName: "", address: "", assignee: "", value: "", description: "", title: "" });
    } else {
      // For now, show success message - would need to create job first
      toast.info("Creating proposals without a job is coming soon");
      onOpenChange(false);
      setFormData({ customerName: "", address: "", assignee: "", value: "", description: "", title: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Proposal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Proposal title (optional)"
            />
          </div>
          
          {!jobId && (
            <>
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
          
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="value">Proposal Value ($)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Proposal details..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
