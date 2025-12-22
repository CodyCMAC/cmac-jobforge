import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Send, Eye, Copy } from "lucide-react";
import { toast } from "sonner";

interface ProposalActionsMenuProps {
  proposalId: string;
}

export function ProposalActionsMenu({ proposalId }: ProposalActionsMenuProps) {
  const handleView = () => {
    toast.info("Opening proposal viewer...");
  };

  const handleEdit = () => {
    toast.info("Opening proposal editor...");
  };

  const handleSend = () => {
    toast.success("Proposal sent to customer");
  };

  const handleDuplicate = () => {
    toast.success("Proposal duplicated");
  };

  const handleDelete = () => {
    toast.success("Proposal deleted");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSend}>
          <Send className="w-4 h-4 mr-2" />
          Send
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
