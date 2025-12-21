import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Tag } from "lucide-react";

export default function Catalog() {
  return (
    <PlaceholderPage
      title="Catalog"
      description="Manage your products, materials, and pricing library."
      icon={Tag}
      actionLabel="Add Product"
    />
  );
}
