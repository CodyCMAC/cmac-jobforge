import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Zap } from "lucide-react";

export default function Automations() {
  return (
    <PlaceholderPage
      title="Automations"
      description="Set up automated workflows to save time and reduce manual tasks."
      icon={Zap}
      actionLabel="New Automation"
    />
  );
}
