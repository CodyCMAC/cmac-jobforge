import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { ClipboardList } from "lucide-react";

export default function WorkOrders() {
  return (
    <PlaceholderPage
      title="Work Orders"
      description="Create and assign work orders to your production crews."
      icon={ClipboardList}
      actionLabel="New Work Order"
    />
  );
}
