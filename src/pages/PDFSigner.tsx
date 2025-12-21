import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { PenTool } from "lucide-react";

export default function PDFSigner() {
  return (
    <PlaceholderPage
      title="PDF Signer"
      description="Upload documents for digital signing and track signature status."
      icon={PenTool}
      actionLabel="Upload Document"
    />
  );
}
