import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Ruler } from "lucide-react";

export default function Measurements() {
  return (
    <PlaceholderPage
      title="Measurements"
      description="Create and manage roof measurements using satellite imagery."
      icon={Ruler}
      actionLabel="New Measurement"
    />
  );
}
