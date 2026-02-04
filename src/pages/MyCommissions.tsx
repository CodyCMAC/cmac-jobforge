import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Wallet
} from "lucide-react";
import { 
  useMyCommissionEntries,
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

export default function MyCommissions() {
  const { data: myCommissions = [], isLoading } = useMyCommissionEntries();

  // Fetch job data for commissions
  const { data: commissionsWithJobs = [] } = useQuery({
    queryKey: ["my-commissions-with-jobs", myCommissions],
    queryFn: async () => {
      if (myCommissions.length === 0) return [];

      const jobIds = [...new Set(myCommissions.map(c => c.job_id))];
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, address, customer_name")
        .in("id", jobIds);

      const jobMap = new Map(jobs?.map(j => [j.id, j]) || []);

      return myCommissions.map(c => ({
        ...c,
        job_address: jobMap.get(c.job_id)?.address || "Unknown",
        customer_name: jobMap.get(c.job_id)?.customer_name || "Unknown",
      }));
    },
    enabled: myCommissions.length > 0,
  });

  // Calculate totals
  const totalEarned = myCommissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const totalPending = myCommissions
    .filter(c => ["draft", "pending_approval", "approved", "payable"].includes(c.status))
    .reduce((sum, c) => sum + c.final_amount, 0);

  const totalPayable = myCommissions
    .filter(c => c.status === "payable")
    .reduce((sum, c) => sum + c.final_amount, 0);

  const thisMonthEarned = myCommissions
    .filter(c => {
      if (c.status !== "paid" || !c.paid_at) return false;
      const paidDate = new Date(c.paid_at);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && 
             paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + c.final_amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Commissions"
          description="Track your earnings and commission history"
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalEarned)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time paid commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Pay</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalPayable)}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress / awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(thisMonthEarned)}
              </div>
              <p className="text-xs text-muted-foreground">
                Paid this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading your commissions...
              </div>
            ) : commissionsWithJobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No commissions yet</p>
                <p className="text-sm">
                  Commissions will appear here as jobs are completed
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Base Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionsWithJobs.map((commission) => (
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
                            (adjusted)
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
                        {commission.paid_at && (
                          <p className="text-xs text-success">
                            Paid {format(new Date(commission.paid_at), "MMM d")}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
