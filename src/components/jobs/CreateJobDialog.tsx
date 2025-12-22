import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    assigneeName: "",
    assigneeInitials: "",
    value: "",
    status: "new",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.address.trim()) {
      toast.error("Customer name and address are required");
      return;
    }

    if (!formData.assigneeName.trim()) {
      toast.error("Assignee name is required");
      return;
    }

    setIsSubmitting(true);

    // Generate initials from assignee name
    const initials = formData.assigneeName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const { error } = await supabase.from("jobs").insert({
      customer_name: formData.customerName.trim(),
      address: formData.address.trim(),
      assignee_name: formData.assigneeName.trim(),
      assignee_initials: initials,
      value: parseFloat(formData.value) || 0,
      status: formData.status,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to create job");
      console.error(error);
      return;
    }

    toast.success("Job created successfully");
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    onOpenChange(false);
    setFormData({
      customerName: "",
      address: "",
      assigneeName: "",
      assigneeInitials: "",
      value: "",
      status: "new",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assigneeName">Assignee *</Label>
            <Input
              id="assigneeName"
              value={formData.assigneeName}
              onChange={(e) => setFormData(prev => ({ ...prev, assigneeName: e.target.value }))}
              placeholder="Team member name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Value ($)</Label>
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="scheduled">Appointment Scheduled</SelectItem>
                <SelectItem value="sent">Proposal Sent</SelectItem>
                <SelectItem value="signed">Proposal Signed</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
