import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronDown, MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Communications() {
  const [activeTab, setActiveTab] = useState<"inbox" | "templates">("inbox");
  const [filter, setFilter] = useState<"all" | "emails" | "texts">("all");

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Communications"
          description="Create and manage your messaging templates used in Roofr"
          actions={
            <>
              <Button variant="outline" className="gap-2">
                New template
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button className="gap-2">
                New message
                <ChevronDown className="w-4 h-4" />
              </Button>
            </>
          }
        />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("inbox")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === "inbox"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Inbox (0)
              <span className="px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">Beta</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "templates"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Templates
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Panel - Message List */}
          <div className="flex-1 max-w-xl">
            <div className="bg-card rounded-lg border border-border p-4">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search messages" className="pl-9" />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Inbox
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium transition-colors",
                      filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("emails")}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium transition-colors",
                      filter === "emails" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Emails
                  </button>
                  <button
                    onClick={() => setFilter("texts")}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium transition-colors",
                      filter === "texts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Texts
                  </button>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">No messages found</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Message Detail */}
          <div className="flex-1 bg-card rounded-lg border border-border flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No message selected</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
