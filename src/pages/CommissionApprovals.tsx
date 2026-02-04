import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  MoreHorizontal,
  ArrowRight,
  Banknote,
  Download,
  FileSpreadsheet,
  CalendarIcon,
  Users,
  CheckSquare
} from "lucide-react";
import { 
  useUpdateCommissionStatus,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
  ROLE_LABELS,
  type CommissionStatus 
} from "@/hooks/useCommissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

// Generate CSV content
const generateCSV = (commissions: any[]) => {
  const headers = [
    "Employee ID",
    "Role",
    "Job Address",
    "Customer",
    "Base Amount",
    "Base Type",
    "Rate Applied",
    "Commission Amount",
    "Status",
    "Created Date",
    "Approved Date",
  ];
  
  const rows = commissions.map(c => [
    c.user_id,
    ROLE_LABELS[c.role] || c.role,
    `"${c.job_address?.replace(/"/g, '""') || ""}"`,
    `"${c.customer_name?.replace(/"/g, '""') || ""}"`,
    (c.base_amount / 100).toFixed(2),
    c.base_type,
    c.rate_applied ? (c.rate_applied * 100).toFixed(2) + "%" : "Flat",
    (c.final_amount / 100).toFixed(2),
    COMMISSION_STATUS_LABELS[c.status as CommissionStatus],
    format(new Date(c.created_at), "yyyy-MM-dd"),
    c.approved_at ? format(new Date(c.approved_at), "yyyy-MM-dd") : "",
  ]);
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
};

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function CommissionApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CommissionStatus | "all">("pending_approval");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchDescription, setBatchDescription] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const updateStatus = useUpdateCommissionStatus();

  // Fetch all commissions with job data
  const { data: allCommissions = [], isLoading } = useQuery({
    queryKey: ["commission-entries", "all-with-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch job addresses for each commission
      const jobIds = [...new Set(data.map(c => c.job_id))];
      if (jobIds.length === 0) return [];
      
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, address, customer_name")
        .in("id", jobIds);

      const jobMap = new Map(jobs?.map(j => [j.id, j]) || []);

      return data.map(c => ({
        ...c,
        job_address: jobMap.get(c.job_id)?.address || "Unknown",
        customer_name: jobMap.get(c.job_id)?.customer_name || "Unknown",
      }));
    },
  });

  // Create payout batch mutation
  const createBatch = useMutation({
    mutationFn: async (entryIds: string[]) => {
      const selectedCommissions = allCommissions.filter(c => entryIds.includes(c.id));
      const totalAmount = selectedCommissions.reduce((sum, c) => sum + c.final_amount, 0);
      
      // Create payout batch
      const { data: batch, error: batchError } = await supabase
        .from("payout_batches")
        .insert({
          entry_ids: entryIds,
          total_amount: totalAmount,
          description: batchDescription || `Batch payout - ${format(new Date(), "MMM d, yyyy")}`,
          exported_by: user?.id,
          exported_at: new Date().toISOString(),
          exported_format: "csv",
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Update all entries to paid
      for (const id of entryIds) {
        await supabase
          .from("commission_entries")
          .update({ 
            status: "paid", 
            paid_at: new Date().toISOString(),
            payment_reference: `BATCH-${batch.batch_number}`,
          })
          .eq("id", id);
      }

      return { batch, commissions: selectedCommissions };
    },
    onSuccess: ({ batch, commissions }) => {
      // Generate and download CSV
      const csv = generateCSV(commissions);
      downloadCSV(csv, `commission-payout-batch-${batch.batch_number}.csv`);
      
      queryClient.invalidateQueries({ queryKey: ["commission-entries"] });
      toast.success(`Batch #${batch.batch_number} created and exported`);
      setSelectedIds(new Set());
      setShowBatchDialog(false);
      setBatchDescription("");
    },
    onError: (error: any) => {
      toast.error(`Failed to create batch: ${error.message}`);
    },
  });

  // Filter by date range
  const dateFilteredCommissions = allCommissions.filter(c => {
    if (!dateRange?.from) return true;
    const createdAt = new Date(c.created_at);
    return isWithinInterval(createdAt, {
      start: dateRange.from,
      end: dateRange.to || dateRange.from,
    });
  });

  const filteredCommissions = activeTab === "all" 
    ? dateFilteredCommissions 
    : dateFilteredCommissions.filter(c => c.status === activeTab);

  const statusCounts = {
    pending_approval: dateFilteredCommissions.filter(c => c.status === "pending_approval").length,
    approved: dateFilteredCommissions.filter(c => c.status === "approved").length,
    payable: dateFilteredCommissions.filter(c => c.status === "payable").length,
    paid: dateFilteredCommissions.filter(c => c.status === "paid").length,
    voided: dateFilteredCommissions.filter(c => c.status === "voided").length,
  };

  const totalPending = dateFilteredCommissions
    .filter(c => c.status === "pending_approval")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const totalPayable = dateFilteredCommissions
    .filter(c => c.status === "payable")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const totalPaid = dateFilteredCommissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const handleStatusChange = (entryId: string, newStatus: CommissionStatus) => {
    updateStatus.mutate({ entryId, newStatus });
  };

  const getNextStatus = (currentStatus: CommissionStatus): CommissionStatus | null => {
    const flow: Record<CommissionStatus, CommissionStatus | null> = {
      draft: "pending_approval",
      pending_approval: "approved",
      approved: "payable",
      payable: "paid",
      paid: null,
      voided: null,
    };
    return flow[currentStatus];
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAllPayable = () => {
    const payableIds = filteredCommissions
      .filter(c => c.status === "payable")
      .map(c => c.id);
    setSelectedIds(new Set(payableIds));
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? filteredCommissions.filter(c => selectedIds.has(c.id))
      : filteredCommissions;
    
    if (toExport.length === 0) {
      toast.error("No commissions to export");
      return;
    }
    
    const csv = generateCSV(toExport);
    const dateStr = format(new Date(), "yyyy-MM-dd");
    downloadCSV(csv, `commissions-${activeTab}-${dateStr}.csv`);
    toast.success(`Exported ${toExport.length} commissions`);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    
    const toApprove = filteredCommissions.filter(
      c => selectedIds.has(c.id) && c.status === "pending_approval"
    );
    
    for (const c of toApprove) {
      await updateStatus.mutateAsync({ entryId: c.id, newStatus: "approved" });
    }
    
    setSelectedIds(new Set());
    toast.success(`Approved ${toApprove.length} commissions`);
  };

  const handleBulkMakePayable = async () => {
    if (selectedIds.size === 0) return;
    
    const toMakePayable = filteredCommissions.filter(
      c => selectedIds.has(c.id) && c.status === "approved"
    );
    
    for (const c of toMakePayable) {
      await updateStatus.mutateAsync({ entryId: c.id, newStatus: "payable" });
    }
    
    setSelectedIds(new Set());
    toast.success(`${toMakePayable.length} commissions marked payable`);
  };

  const selectedPayableAmount = filteredCommissions
    .filter(c => selectedIds.has(c.id) && c.status === "payable")
    .reduce((sum, c) => sum + c.final_amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Commission Approvals"
            description="Review, approve, and manage commission payouts"
          />
          <div className="flex items-center gap-2">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export {selectedIds.size > 0 ? `${selectedIds.size} Selected` : "All Visible"} as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.pending_approval}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalPending)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Pay</CardTitle>
              <Banknote className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.payable}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalPayable)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.approved}</div>
              <p className="text-xs text-muted-foreground">awaiting payable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid (Period)</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">{statusCounts.paid} commissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.size} selected</span>
                {selectedPayableAmount > 0 && (
                  <Badge variant="secondary">
                    {formatCurrency(selectedPayableAmount)} payable
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={!filteredCommissions.some(c => selectedIds.has(c.id) && c.status === "pending_approval")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMakePayable}
                  disabled={!filteredCommissions.some(c => selectedIds.has(c.id) && c.status === "approved")}
                >
                  <Banknote className="h-4 w-4 mr-1" />
                  Mark Payable
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowBatchDialog(true)}
                  disabled={!filteredCommissions.some(c => selectedIds.has(c.id) && c.status === "payable")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Create Payout Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different statuses */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CommissionStatus | "all")}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending_approval" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({statusCounts.pending_approval})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Approved ({statusCounts.approved})
              </TabsTrigger>
              <TabsTrigger value="payable" className="gap-2">
                <Banknote className="h-4 w-4" />
                Payable ({statusCounts.payable})
              </TabsTrigger>
              <TabsTrigger value="paid">Paid ({statusCounts.paid})</TabsTrigger>
              <TabsTrigger value="voided">Voided ({statusCounts.voided})</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            {activeTab === "payable" && statusCounts.payable > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAllPayable}>
                <Users className="h-4 w-4 mr-1" />
                Select All Payable
              </Button>
            )}
          </div>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading commissions...
                  </div>
                ) : filteredCommissions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No commissions found in this status
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={filteredCommissions.length > 0 && filteredCommissions.every(c => selectedIds.has(c.id))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIds(new Set(filteredCommissions.map(c => c.id)));
                              } else {
                                setSelectedIds(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Base</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.map((commission) => {
                        const nextStatus = getNextStatus(commission.status as CommissionStatus);
                        return (
                          <TableRow key={commission.id} className={selectedIds.has(commission.id) ? "bg-primary/5" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(commission.id)}
                                onCheckedChange={() => toggleSelect(commission.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Link 
                                to={`/jobs/${commission.job_id}`}
                                className="font-medium hover:text-primary hover:underline"
                              >
                                {commission.job_address}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {commission.customer_name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {ROLE_LABELS[commission.role] || commission.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(commission.base_amount)}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({commission.base_type})
                              </span>
                            </TableCell>
                            <TableCell>
                              {commission.rate_applied 
                                ? `${(commission.rate_applied * 100).toFixed(1)}%`
                                : "Flat"
                              }
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(commission.final_amount)}
                              {commission.override_amount && (
                                <span className="ml-1 text-xs text-warning">
                                  (override)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "font-medium",
                                COMMISSION_STATUS_COLORS[commission.status as CommissionStatus]
                              )}>
                                {COMMISSION_STATUS_LABELS[commission.status as CommissionStatus]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(commission.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {nextStatus && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(commission.id, nextStatus)}
                                    >
                                      <ArrowRight className="h-4 w-4 mr-2" />
                                      Move to {COMMISSION_STATUS_LABELS[nextStatus]}
                                    </DropdownMenuItem>
                                  )}
                                  {commission.status !== "voided" && commission.status !== "paid" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleStatusChange(commission.id, "voided")}
                                        className="text-destructive"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Void Commission
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link to={`/jobs/${commission.job_id}`}>
                                      View Job
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Batch Dialog */}
        <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payout Batch</DialogTitle>
              <DialogDescription>
                This will mark {filteredCommissions.filter(c => selectedIds.has(c.id) && c.status === "payable").length} commissions as paid and generate a CSV for payroll.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payout Amount</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(
                    filteredCommissions
                      .filter(c => selectedIds.has(c.id) && c.status === "payable")
                      .reduce((sum, c) => sum + c.final_amount, 0)
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Batch Description (optional)</Label>
                <Input
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder={`Batch payout - ${format(new Date(), "MMM d, yyyy")}`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const payableIds = filteredCommissions
                    .filter(c => selectedIds.has(c.id) && c.status === "payable")
                    .map(c => c.id);
                  createBatch.mutate(payableIds);
                }}
                disabled={createBatch.isPending}
              >
                {createBatch.isPending ? "Creating..." : "Create Batch & Export CSV"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
