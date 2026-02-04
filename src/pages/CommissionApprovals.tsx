import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  MoreHorizontal,
  AlertTriangle,
  ArrowRight,
  Banknote
} from "lucide-react";
import { 
  usePendingApprovalCommissions, 
  useUpdateCommissionStatus,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
  ROLE_LABELS,
  type CommissionStatus 
} from "@/hooks/useCommissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export default function CommissionApprovals() {
  const [activeTab, setActiveTab] = useState<CommissionStatus | "all">("pending_approval");
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

  const filteredCommissions = activeTab === "all" 
    ? allCommissions 
    : allCommissions.filter(c => c.status === activeTab);

  const statusCounts = {
    pending_approval: allCommissions.filter(c => c.status === "pending_approval").length,
    approved: allCommissions.filter(c => c.status === "approved").length,
    payable: allCommissions.filter(c => c.status === "payable").length,
    paid: allCommissions.filter(c => c.status === "paid").length,
    voided: allCommissions.filter(c => c.status === "voided").length,
  };

  const totalPending = allCommissions
    .filter(c => c.status === "pending_approval")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const totalPayable = allCommissions
    .filter(c => c.status === "payable")
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Commission Approvals"
          description="Review, approve, and manage commission payouts"
        />

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
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.paid}</div>
              <p className="text-xs text-muted-foreground">commissions paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different statuses */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CommissionStatus | "all")}>
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
                          <TableRow key={commission.id}>
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
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(commission.id, "voided")}
                                      className="text-destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Void Commission
                                    </DropdownMenuItem>
                                  )}
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
      </div>
    </MainLayout>
  );
}
