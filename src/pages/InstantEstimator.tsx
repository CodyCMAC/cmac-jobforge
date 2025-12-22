import { useState } from "react";
import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, LayoutGrid, List, Settings } from "lucide-react";
import { useInstantEstimators } from "@/hooks/useInstantEstimators";
import {
  CreateEstimatorDialog,
  EstimatorCard,
  EstimatorEmptyState,
  ESTIMATE_TYPES,
} from "@/components/instant-estimator";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstantEstimator() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: estimators, isLoading } = useInstantEstimators();

  const filteredEstimators = estimators?.filter((est) => {
    const matchesSearch = est.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || est.estimate_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Instant Estimator"
          description="Create and manage automated estimators for your customers"
          actions={
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              New Estimator
            </Button>
          }
        />

        <Tabs defaultValue="estimators" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="h-10">
              <TabsTrigger value="estimators" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                All Estimators
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* View Toggle - only show when we have estimators */}
            {estimators && estimators.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="estimators" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : !estimators || estimators.length === 0 ? (
              <EstimatorEmptyState onCreateClick={() => setShowCreateDialog(true)} />
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search estimators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={typeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter("all")}
                    >
                      All Types
                    </Button>
                    {ESTIMATE_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Button
                          key={type.value}
                          variant={typeFilter === type.value ? "default" : "outline"}
                          size="sm"
                          className="gap-2"
                          onClick={() => setTypeFilter(type.value)}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimator Grid/List */}
                {filteredEstimators && filteredEstimators.length > 0 ? (
                  <div
                    className={cn(
                      viewMode === "grid"
                        ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        : "flex flex-col gap-3"
                    )}
                  >
                    {filteredEstimators.map((estimator) => (
                      <EstimatorCard key={estimator.id} estimator={estimator} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No estimators match your search criteria
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl mx-auto py-8 text-center text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">
                Global Settings
              </h3>
              <p>
                Configure default settings for all your estimators. Coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <CreateEstimatorDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </MainLayout>
  );
}
