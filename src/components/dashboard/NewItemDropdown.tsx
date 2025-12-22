import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Users, FileText, CalendarDays, Briefcase, Receipt, ClipboardList } from "lucide-react";
import { CreateContactDialog } from "@/components/contacts";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { CreateEventDialog } from "@/components/calendar";
import { CreateProposalDialog } from "@/components/proposals";

export function NewItemDropdown() {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showProposalDialog, setShowProposalDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowJobDialog(true)}>
            <Briefcase className="w-4 h-4 mr-2" />
            New Job
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowContactDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            New Contact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowProposalDialog(true)}>
            <FileText className="w-4 h-4 mr-2" />
            New Proposal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEventDialog(true)}>
            <CalendarDays className="w-4 h-4 mr-2" />
            New Event
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowJobDialog(true)}>
            <Receipt className="w-4 h-4 mr-2" />
            New Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowJobDialog(true)}>
            <ClipboardList className="w-4 h-4 mr-2" />
            New Work Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
      <CreateJobDialog open={showJobDialog} onOpenChange={setShowJobDialog} />
      <CreateEventDialog open={showEventDialog} onOpenChange={setShowEventDialog} />
      <CreateProposalDialog open={showProposalDialog} onOpenChange={setShowProposalDialog} />
    </>
  );
}
