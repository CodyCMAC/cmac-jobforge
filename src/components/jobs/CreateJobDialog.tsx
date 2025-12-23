import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/contexts/AuthContext";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: teamMembers = [] } = useTeamMembers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    assigneeId: "",
    customerPhone: "",
    customerEmail: "",
    status: "new",
  });

  // Set default assignee to current user when dialog opens and team members load
  useEffect(() => {
    if (open && teamMembers.length > 0 && !formData.assigneeId) {
      const currentUserMember = teamMembers.find(m => m.id === user?.id);
      if (currentUserMember) {
        setFormData(prev => ({ ...prev, assigneeId: currentUserMember.id }));
      }
    }
  }, [open, teamMembers, user?.id, formData.assigneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.address.trim()) {
      toast.error("Customer name and address are required");
      return;
    }

    if (!formData.assigneeId) {
      toast.error("Assignee is required");
      return;
    }

    const selectedMember = teamMembers.find(m => m.id === formData.assigneeId);
    if (!selectedMember) {
      toast.error("Please select a valid assignee");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("jobs").insert({
      customer_name: formData.customerName.trim(),
      address: formData.address.trim(),
      assignee_name: selectedMember.name,
      assignee_initials: selectedMember.initials,
      customer_phone: formData.customerPhone.trim() || null,
      customer_email: formData.customerEmail.trim() || null,
      status: formData.status,
      value: 0,
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
      assigneeId: "",
      customerPhone: "",
      customerEmail: "",
      status: "new",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        customerName: "",
        address: "",
        assigneeId: "",
        customerPhone: "",
        customerEmail: "",
        status: "new",
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee *</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} {member.email && `(${member.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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
