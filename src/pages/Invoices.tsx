import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Receipt } from "lucide-react";

export default function Invoices() {
  return (
    <PlaceholderPage
      title="Invoices"
      description="Create invoices and track payment status for your jobs."
      icon={Receipt}
      actionLabel="New Invoice"
    />
  );
}
