import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FolderPlus, Upload, FileText, Image, MoreHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attachment {
  id: string;
  name: string;
  type: "pdf" | "image" | "document";
  thumbnail?: string;
}

interface JobAttachmentsSectionProps {
  jobId: string;
}

export function JobAttachmentsSection({ jobId }: JobAttachmentsSectionProps) {
  // Mock attachments for demo
  const attachments: Attachment[] = [
    { id: "1", name: "Supplemental estimate[97].pdf", type: "pdf" },
    { id: "2", name: "estimate_3662.pdf", type: "pdf" },
    { id: "3", name: "662180c0e420633b89769hc2c8948a.pdf", type: "pdf" },
    { id: "4", name: "mpio_6sx.pdf", type: "pdf" },
  ];

  const folders = ["Documents", "Photos"];

  const getIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-destructive" />;
      case "image":
        return <Image className="h-8 w-8 text-primary" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Attachments</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Folder
          </Button>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" className="gap-1">
            File type <ChevronDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            Sort by <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Folders */}
      <div className="flex items-center gap-3">
        {folders.map((folder) => (
          <div
            key={folder}
            className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <span className="text-lg">📁</span>
            <span className="font-medium text-sm">{folder}</span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              {getIcon(file.type)}
            </div>
            <div className="p-2 flex items-center justify-between">
              <p className="text-xs truncate flex-1" title={file.name}>
                {file.name}
              </p>
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Drop Zone */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop or{" "}
          <button className="text-primary hover:underline">click here</button>{" "}
          to upload files
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Maximum file size is 25 MB
        </p>
      </div>
    </div>
  );
}
