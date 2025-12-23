import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, ChevronDown, X } from "lucide-react";
import { formatCurrency } from "@/components/jobs/types";

interface JobFinancialsSectionProps {
  proposals: any[];
}

export function JobFinancialsSection({ proposals }: JobFinancialsSectionProps) {
  // Calculate financials from proposals
  const totalRevenue = proposals.reduce((sum, p) => sum + Number(p.total || 0), 0);
  const subtotal = proposals.reduce((sum, p) => sum + Number(p.subtotal || 0), 0);
  
  // Estimate COGS as 60% of subtotal (typical construction)
  const cogs = subtotal * 0.6;
  const grossProfit = totalRevenue - cogs;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Financials</h3>
            <p className="text-sm text-muted-foreground">Invoices</p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Invoice
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Offer instant online payment options. Track your payments and see when your funds get deposited.
        </p>
      </div>

      {/* Costing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Costing</h3>
            <p className="text-sm text-muted-foreground">Projected</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Select proposals
            </Button>
            <Button variant="ghost" size="sm">Hide</Button>
          </div>
        </div>

        {/* Financials Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">COGS</p>
            <p className="text-2xl font-bold">{formatCurrency(cogs)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Gross profit</p>
            <p className="text-2xl font-bold">{formatCurrency(grossProfit)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Gross profit margin</p>
            <p className="text-2xl font-bold">{marginPercent.toFixed(2)}%</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm flex-1">
            Projected job cost is automatically generated from your job's won proposals.{" "}
            <button className="text-primary hover:underline">View your proposals</button>{" "}
            to see the breakdown of these values.
          </p>
          <Button variant="ghost" size="icon" className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actuals Section */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actuals</p>
              <p className="text-sm text-muted-foreground">When the job is complete, enter the actual costs</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Actual
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
