import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useJobFinancialSummary,
  useJobRevenueItems,
  useJobCostItems,
  useDeleteRevenueItem,
  useDeleteCostItem,
  useRecalculateJobFinancials,
  formatCurrency,
  formatPercent,
  REVENUE_CATEGORY_LABELS,
  COST_CATEGORY_LABELS,
  type RevenueItem,
  type CostItem,
} from "@/hooks/useJobFinancials";
import {
  useJobCommissionEntries,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
  ROLE_LABELS,
} from "@/hooks/useCommissions";
import { AddRevenueItemDialog } from "./AddRevenueItemDialog";
import { AddCostItemDialog } from "./AddCostItemDialog";

interface JobFinancialsTabProps {
  jobId: string;
}

export function JobFinancialsTab({ jobId }: JobFinancialsTabProps) {
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueItem | null>(null);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);

  const { data: summary, isLoading: loadingSummary } = useJobFinancialSummary(jobId);
  const { data: revenueItems = [], isLoading: loadingRevenue } = useJobRevenueItems(jobId);
  const { data: costItems = [], isLoading: loadingCosts } = useJobCostItems(jobId);
  const { data: commissionEntries = [] } = useJobCommissionEntries(jobId);

  const deleteRevenue = useDeleteRevenueItem();
  const deleteCost = useDeleteCostItem();
  const recalculate = useRecalculateJobFinancials();

  const isLoading = loadingSummary || loadingRevenue || loadingCosts;

  // Calculate completeness
  const revenueCompleteness =
    summary && summary.revenue_items_count > 0
      ? Math.round((summary.revenue_items_with_actuals / summary.revenue_items_count) * 100)
      : 0;
  const costCompleteness =
    summary && summary.cost_items_count > 0
      ? Math.round((summary.cost_items_with_actuals / summary.cost_items_count) * 100)
      : 0;

  const showCostWarning = summary && summary.actual_costs > summary.actual_revenue;
  const showVarianceWarning = summary && Math.abs(summary.cost_variance_pct) > 10;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Revenue"
          value={formatCurrency(summary?.actual_revenue || 0)}
          subtitle={`Est: ${formatCurrency(summary?.estimated_revenue || 0)}`}
          icon={DollarSign}
          trend={
            summary && summary.actual_revenue > summary.estimated_revenue ? "up" : undefined
          }
        />
        <SummaryCard
          title="Costs"
          value={formatCurrency(summary?.actual_costs || 0)}
          subtitle={`Est: ${formatCurrency(summary?.estimated_costs || 0)}`}
          icon={DollarSign}
          trend={
            summary && summary.actual_costs < summary.estimated_costs ? "up" : "down"
          }
          trendInverted
        />
        <SummaryCard
          title="Gross Profit"
          value={formatCurrency(summary?.actual_profit || 0)}
          subtitle={`Est: ${formatCurrency(summary?.estimated_profit || 0)}`}
          icon={TrendingUp}
          trend={
            summary && summary.actual_profit > summary.estimated_profit ? "up" : "down"
          }
        />
        <SummaryCard
          title="Margin"
          value={formatPercent(summary?.actual_margin || 0)}
          subtitle={`Est: ${formatPercent(summary?.estimated_margin || 0)}`}
          icon={TrendingUp}
          trend={
            summary && summary.actual_margin > summary.estimated_margin ? "up" : "down"
          }
        />
      </div>

      {/* Warnings */}
      {showCostWarning && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            Warning: Costs exceed revenue. This job is currently unprofitable.
          </span>
        </div>
      )}

      {showVarianceWarning && (
        <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/30 rounded-lg text-warning">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            Cost variance is {formatPercent(Math.abs(summary?.cost_variance_pct || 0))}{" "}
            {(summary?.cost_variance_pct || 0) > 0 ? "over" : "under"} estimate.
          </span>
        </div>
      )}

      {/* Completeness badges */}
      <div className="flex gap-4">
        <Badge variant={revenueCompleteness === 100 ? "default" : "secondary"}>
          Revenue: {revenueCompleteness}% complete
        </Badge>
        <Badge variant={costCompleteness === 100 ? "default" : "secondary"}>
          Costs: {costCompleteness}% complete
        </Badge>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => recalculate.mutate(jobId)}
          disabled={recalculate.isPending}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", recalculate.isPending && "animate-spin")}
          />
          Recalculate
        </Button>
      </div>

      {/* Revenue Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Revenue Items</CardTitle>
          <Button size="sm" onClick={() => setShowAddRevenue(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Revenue
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No revenue items yet. Add the contract amount to get started.
                  </TableCell>
                </TableRow>
              ) : (
                revenueItems.map((item) => {
                  const variance =
                    (item.actual_amount ?? item.estimated_amount) - item.estimated_amount;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {REVENUE_CATEGORY_LABELS[item.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.estimated_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.actual_amount !== null
                          ? formatCurrency(item.actual_amount)
                          : "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          variance > 0 && "text-success",
                          variance < 0 && "text-destructive"
                        )}
                      >
                        {variance !== 0 && (
                          <>
                            {variance > 0 ? "+" : ""}
                            {formatCurrency(variance)}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingRevenue(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              deleteRevenue.mutate({ id: item.id, jobId })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Cost Items</CardTitle>
          <Button size="sm" onClick={() => setShowAddCost(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No cost items yet. Add your estimated costs.
                  </TableCell>
                </TableRow>
              ) : (
                costItems.map((item) => {
                  const variance =
                    (item.actual_amount ?? item.estimated_amount) - item.estimated_amount;
                  const overBudget = variance > item.estimated_amount * 0.1; // 10%
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {COST_CATEGORY_LABELS[item.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.vendor || "—"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.estimated_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.actual_amount !== null
                          ? formatCurrency(item.actual_amount)
                          : "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          variance < 0 && "text-success",
                          variance > 0 && "text-destructive"
                        )}
                      >
                        {variance !== 0 && (
                          <span className="flex items-center justify-end gap-1">
                            {variance > 0 ? "+" : ""}
                            {formatCurrency(variance)}
                            {overBudget && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingCost(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              deleteCost.mutate({ id: item.id, jobId })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No commissions calculated yet. Commissions will be generated when the
                    job is marked complete.
                  </TableCell>
                </TableRow>
              ) : (
                commissionEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.user_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_LABELS[entry.role] || entry.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.final_amount)}
                      {entry.override_amount && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (override)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          COMMISSION_STATUS_COLORS[entry.status as keyof typeof COMMISSION_STATUS_COLORS]
                        }
                      >
                        {COMMISSION_STATUS_LABELS[entry.status as keyof typeof COMMISSION_STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddRevenueItemDialog
        jobId={jobId}
        open={showAddRevenue || !!editingRevenue}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddRevenue(false);
            setEditingRevenue(null);
          }
        }}
        editItem={editingRevenue}
      />

      <AddCostItemDialog
        jobId={jobId}
        open={showAddCost || !!editingCost}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddCost(false);
            setEditingCost(null);
          }
        }}
        editItem={editingCost}
      />
    </div>
  );
}

// =============================================================================
// Summary Card Component
// =============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendInverted?: boolean;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendInverted,
}: SummaryCardProps) {
  const trendColor =
    trend === "up"
      ? trendInverted
        ? "text-destructive"
        : "text-success"
      : trend === "down"
      ? trendInverted
        ? "text-success"
        : "text-destructive"
      : "";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={cn("text-2xl font-bold", trendColor)}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );
}
