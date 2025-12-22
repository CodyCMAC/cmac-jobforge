import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Contact } from "@/hooks/useContacts";

interface ContactActionsMenuProps {
  contact: Contact;
}

export function ContactActionsMenu({ contact }: ContactActionsMenuProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmail = () => {
    window.location.href = `mailto:${contact.email}`;
  };

  const handleCall = () => {
    if (contact.phone && contact.phone !== "-") {
      window.location.href = `tel:${contact.phone}`;
    } else {
      toast.error("No phone number available");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    setIsDeleting(false);

    if (error) {
      toast.error("Failed to delete contact");
      console.error(error);
      return;
    }

    toast.success("Contact deleted");
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCall}>
            <Phone className="w-4 h-4 mr-2" />
            Call
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.info("Edit functionality coming soon")}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {contact.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
