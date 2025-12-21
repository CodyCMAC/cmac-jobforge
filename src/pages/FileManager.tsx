import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { FolderOpen } from "lucide-react";

export default function FileManager() {
  return (
    <PlaceholderPage
      title="File Manager"
      description="Upload, organize, and manage all your project files and documents."
      icon={FolderOpen}
      actionLabel="Upload File"
    />
  );
}
