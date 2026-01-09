import { cn } from "@/lib/utils";

export interface Job {
  id: string;
  address: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  value: number;
  status: "new" | "scheduled" | "sent" | "signed" | "production" | "complete";
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    initials: string;
    name: string;
  };
  proposalStatus?: "won" | "draft" | "sent" | "viewed";
  // New fields for activity feed
  commentCount?: number;
  lastActivityAt?: Date | null;
  lastCommentAt?: Date | null;
  lastCommentSnippet?: string | null;
  priority?: string | null;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  jobs: Job[];
}

// Time ago helper
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

// Days in stage helper
export function daysInStage(date: Date): string {
  const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Get status badge classes
export function getStatusBadgeClasses(status: Job["proposalStatus"]): string {
  switch (status) {
    case "won":
      return "bg-success/10 text-success border border-success/20";
    case "draft":
      return "bg-muted text-muted-foreground border border-border";
    case "sent":
      return "bg-primary/10 text-primary border border-primary/20";
    case "viewed":
      return "bg-warning/10 text-warning border border-warning/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

// Age indicator (rotting logic)
export function getAgeIndicator(date: Date): { label: string; className: string } {
  const hours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (hours < 24) {
    return { label: "New", className: "bg-primary text-primary-foreground" };
  } else if (hours < 72) {
    return { label: `${Math.floor(hours / 24)}d`, className: "bg-warning text-warning-foreground" };
  } else {
    return { label: `${Math.floor(hours / 24)}d`, className: "bg-destructive text-destructive-foreground" };
  }
}
