import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { DollarSign } from "lucide-react";

export default function Payments() {
  return (
    <PlaceholderPage
      title="Payments"
      description="Track and record payments from your customers."
      icon={DollarSign}
      actionLabel="Record Payment"
    />
  );
}
