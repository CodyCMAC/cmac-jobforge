import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Package } from "lucide-react";

export default function MaterialOrders() {
  return (
    <PlaceholderPage
      title="Material Orders"
      description="Create and track material orders from your signed proposals."
      icon={Package}
      actionLabel="New Order"
    />
  );
}
