import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, DollarSign, Users, History } from "lucide-react";
import {
  useJobCommissionEntries,
  useDefaultCommissionPlan,
  useCommissionRules,
  useUpdateCommissionStatus,
  useOverrideCommissionAmount,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
  ROLE_LABELS,
  type CommissionStatus,
} from "@/hooks/useCommissions";
import { useJobFinancialSummary } from "@/hooks/useJobFinancials";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobCommissionsSectionProps {
  jobId: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export function JobCommissionsSection({ jobId }: JobCommissionsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [overrideAmount, setOverrideAmount] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedRole, setSelectedRole] = useState("sales_rep");
  const [isCreating, setIsCreating] = useState(false);

  const { data: commissions = [], isLoading } = useJobCommissionEntries(jobId);
  const { data: summary } = useJobFinancialSummary(jobId);
  const { data: defaultPlan } = useDefaultCommissionPlan();
  const { data: rules = [] } = useCommissionRules(defaultPlan?.id);
  const updateStatus = useUpdateCommissionStatus();
  const overrideCommission = useOverrideCommissionAmount();

  const totalCommissions = commissions
    .filter((c) => c.status !== "voided")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const handleGenerateCommission = async () => {
    if (!defaultPlan || !summary) {
      toast.error("No commission plan or financial data available");
      return;
    }

    const rule = rules.find((r) => r.role === selectedRole);
    if (!rule) {
      toast.error(`No rule found for role: ${selectedRole}`);
      return;
    }

    setIsCreating(true);

    try {
      // Calculate commission based on rule type
      let baseAmount = 0;
      let calculatedAmount = 0;

      if (rule.calculation_type === "percentage_of_revenue") {
        baseAmount = summary.actual_revenue || summary.estimated_revenue || 0;
        calculatedAmount = Math.round(baseAmount * (rule.rate || 0));
      } else if (rule.calculation_type === "percentage_of_profit") {
        baseAmount = summary.actual_profit || summary.estimated_profit || 0;
        calculatedAmount = Math.round(baseAmount * (rule.rate || 0));
      } else if (rule.calculation_type === "flat_amount") {
        baseAmount = summary.actual_revenue || summary.estimated_revenue || 0;
        calculatedAmount = rule.flat_amount || 0;
      }

      // Apply split percentage
      const finalAmount = Math.round(calculatedAmount * ((rule.split_percentage || 100) / 100));

      const { error } = await supabase.from("commission_entries").insert({
        job_id: jobId,
        rule_id: rule.id,
        user_id: user?.id,
        role: selectedRole,
        status: "draft",
        base_amount: baseAmount,
        base_type: rule.calculation_type === "percentage_of_profit" ? "profit" : "revenue",
        rate_applied: rule.rate || null,
        margin_at_calc: summary.actual_margin || summary.estimated_margin || null,
        calculated_amount: calculatedAmount,
        final_amount: finalAmount,
      });

      if (error) throw error;

      // Log the creation event
      const { data: newEntry } = await supabase
        .from("commission_entries")
        .select("id")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (newEntry) {
        await supabase.from("commission_events").insert({
          entry_id: newEntry.id,
          event_type: "created",
          actor_user_id: user?.id,
          actor_name: user?.email?.split("@")[0] || "Unknown",
          new_value: { role: selectedRole, amount: finalAmount },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["commission-entries"] });
      toast.success("Commission entry created");
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error(`Failed to create commission: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOverride = () => {
    if (!selectedEntry || !overrideAmount) return;

    const amountInCents = Math.round(parseFloat(overrideAmount) * 100);
    overrideCommission.mutate(
      {
        entryId: selectedEntry,
        overrideAmount: amountInCents,
        reason: overrideReason || "Manual override",
      },
      {
        onSuccess: () => {
          setShowOverrideDialog(false);
          setSelectedEntry(null);
          setOverrideAmount("");
          setOverrideReason("");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Commissions</CardTitle>
          {totalCommissions > 0 && (
            <Badge variant="secondary">{formatCurrency(totalCommissions)} total</Badge>
          )}
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Commission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Commission Entry</DialogTitle>
              <DialogDescription>
                Create a commission entry based on the current job financials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.role}>
                        {ROLE_LABELS[rule.role] || rule.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {summary && (
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Revenue:</span>{" "}
                    {formatCurrency(summary.actual_revenue || summary.estimated_revenue || 0)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Profit:</span>{" "}
                    {formatCurrency(summary.actual_profit || summary.estimated_profit || 0)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Margin:</span>{" "}
                    {(summary.actual_margin || summary.estimated_margin || 0).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateCommission} disabled={isCreating}>
                {isCreating ? "Creating..." : "Generate Commission"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No commissions recorded for this job</p>
            <p className="text-sm">Click "Add Commission" to generate entries</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant="outline">{ROLE_LABELS[entry.role] || entry.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(entry.base_amount)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({entry.base_type})
                    </span>
                  </TableCell>
                  <TableCell>
                    {entry.rate_applied ? `${(entry.rate_applied * 100).toFixed(1)}%` : "Flat"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(entry.final_amount)}
                    {entry.override_amount && (
                      <span className="ml-1 text-xs text-warning">(override)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-medium",
                        COMMISSION_STATUS_COLORS[entry.status as CommissionStatus]
                      )}
                    >
                      {COMMISSION_STATUS_LABELS[entry.status as CommissionStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {entry.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateStatus.mutate({
                              entryId: entry.id,
                              newStatus: "pending_approval",
                            })
                          }
                        >
                          Submit
                        </Button>
                      )}
                      {entry.status !== "paid" && entry.status !== "voided" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEntry(entry.id);
                            setOverrideAmount((entry.final_amount / 100).toFixed(2));
                            setShowOverrideDialog(true);
                          }}
                        >
                          Override
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Override Dialog */}
        <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Override Commission Amount</DialogTitle>
              <DialogDescription>
                Enter a new amount and reason for the override
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>New Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain the reason for override"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleOverride} disabled={!overrideAmount}>
                Save Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
