import { useState, useEffect } from "react";
import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  User, 
  Activity,
  Clock,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface HealthCheck {
  name: string;
  status: "pass" | "fail" | "pending" | "warning";
  message: string;
  duration?: number;
}

interface AuditEvent {
  id: string;
  type: string;
  summary: string;
  actor_name: string | null;
  created_at: string;
  job_id: string;
}

export default function AdminHealth() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [recentErrors, setRecentErrors] = useState<string[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "checking">("checking");
  const [authStatus, setAuthStatus] = useState<"authenticated" | "error" | "checking">("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check database connectivity
  const checkDatabase = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Database Connection",
        status: "pass",
        message: `Connected - ${count ?? 0} jobs found`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Database Connection",
        status: "fail",
        message: err instanceof Error ? err.message : "Connection failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check auth status
  const checkAuth = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        return {
          name: "Authentication",
          status: "pass",
          message: `Authenticated as ${session.user.email}`,
          duration: Date.now() - start,
        };
      } else {
        return {
          name: "Authentication",
          status: "warning",
          message: "No active session",
          duration: Date.now() - start,
        };
      }
    } catch (err) {
      return {
        name: "Authentication",
        status: "fail",
        message: err instanceof Error ? err.message : "Auth check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check RLS policies by attempting operations
  const checkRLS = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      // Try to read jobs - should work if RLS is configured correctly
      const { error } = await supabase.from("jobs").select("id").limit(1);
      
      if (error) {
        return {
          name: "RLS Policies (Jobs)",
          status: "fail",
          message: error.message,
          duration: Date.now() - start,
        };
      }
      
      return {
        name: "RLS Policies (Jobs)",
        status: "pass",
        message: "Read access verified",
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "RLS Policies (Jobs)",
        status: "fail",
        message: err instanceof Error ? err.message : "RLS check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check contacts table
  const checkContacts = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Contacts Table",
        status: "pass",
        message: `${count ?? 0} contacts accessible`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Contacts Table",
        status: "fail",
        message: err instanceof Error ? err.message : "Check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check proposals table
  const checkProposals = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Proposals Table",
        status: "pass",
        message: `${count ?? 0} proposals accessible`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Proposals Table",
        status: "fail",
        message: err instanceof Error ? err.message : "Check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check job tasks
  const checkTasks = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("job_tasks")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Job Tasks Table",
        status: "pass",
        message: `${count ?? 0} tasks accessible`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Job Tasks Table",
        status: "fail",
        message: err instanceof Error ? err.message : "Check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check financial summary RPC
  const checkFinancials = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { data: jobs } = await supabase.from("jobs").select("id").limit(1);
      
      if (jobs && jobs.length > 0) {
        const { error } = await supabase.rpc("calculate_job_financials", {
          p_job_id: jobs[0].id,
        });
        
        if (error) throw error;
      }
      
      return {
        name: "Financial Calculation RPC",
        status: "pass",
        message: "RPC function accessible",
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Financial Calculation RPC",
        status: "fail",
        message: err instanceof Error ? err.message : "RPC check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check commission tables
  const checkCommissions = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("commission_entries")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Commission Entries",
        status: "pass",
        message: `${count ?? 0} entries accessible`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Commission Entries",
        status: "fail",
        message: err instanceof Error ? err.message : "Check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Check instant estimators
  const checkEstimators = async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from("instant_estimators")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      
      return {
        name: "Instant Estimators",
        status: "pass",
        message: `${count ?? 0} estimators accessible`,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        name: "Instant Estimators",
        status: "fail",
        message: err instanceof Error ? err.message : "Check failed",
        duration: Date.now() - start,
      };
    }
  };

  // Fetch recent audit events
  const fetchAuditEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("job_activity")
        .select("id, type, summary, actor_name, created_at, job_id")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setAuditEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch audit events:", err);
    }
  };

  // Run all smoke tests
  const runSmokeTests = async () => {
    setIsRunning(true);
    setHealthChecks([]);
    
    const checks: HealthCheck[] = [];
    
    // Run checks sequentially to avoid overwhelming the API
    checks.push(await checkAuth());
    setHealthChecks([...checks]);
    
    checks.push(await checkDatabase());
    setHealthChecks([...checks]);
    
    checks.push(await checkRLS());
    setHealthChecks([...checks]);
    
    checks.push(await checkContacts());
    setHealthChecks([...checks]);
    
    checks.push(await checkProposals());
    setHealthChecks([...checks]);
    
    checks.push(await checkTasks());
    setHealthChecks([...checks]);
    
    checks.push(await checkFinancials());
    setHealthChecks([...checks]);
    
    checks.push(await checkCommissions());
    setHealthChecks([...checks]);
    
    checks.push(await checkEstimators());
    setHealthChecks([...checks]);
    
    // Update status indicators
    const authCheck = checks.find(c => c.name === "Authentication");
    const dbCheck = checks.find(c => c.name === "Database Connection");
    
    setAuthStatus(authCheck?.status === "pass" ? "authenticated" : "error");
    setDbStatus(dbCheck?.status === "pass" ? "connected" : "error");
    
    await fetchAuditEvents();
    
    setLastChecked(new Date());
    setIsRunning(false);
  };

  // Initial checks on mount
  useEffect(() => {
    runSmokeTests();
  }, []);

  const passCount = healthChecks.filter(c => c.status === "pass").length;
  const failCount = healthChecks.filter(c => c.status === "fail").length;
  const warnCount = healthChecks.filter(c => c.status === "warning").length;

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="System Health"
          description="Monitor system connectivity, run diagnostics, and view audit logs"
          actions={
            <Button 
              className="gap-2" 
              onClick={runSmokeTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? "Running..." : "Run Smoke Tests"}
            </Button>
          }
        />

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {dbStatus === "checking" ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : dbStatus === "connected" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-semibold capitalize">{dbStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {authStatus === "checking" ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : authStatus === "authenticated" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-semibold capitalize">{authStatus}</span>
              </div>
              {user && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-success">
                  {passCount} Pass
                </Badge>
                {failCount > 0 && (
                  <Badge variant="destructive">
                    {failCount} Fail
                  </Badge>
                )}
                {warnCount > 0 && (
                  <Badge variant="outline" className="border-warning text-warning">
                    {warnCount} Warn
                  </Badge>
                )}
              </div>
              {lastChecked && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last run: {format(lastChecked, "h:mm:ss a")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Health Checks</CardTitle>
              <CardDescription>
                Connectivity and access verification for all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {healthChecks.length === 0 && !isRunning && (
                    <p className="text-muted-foreground text-center py-8">
                      Click "Run Smoke Tests" to check system health
                    </p>
                  )}
                  {healthChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        check.status === "pass" && "bg-success/5 border-success/20",
                        check.status === "fail" && "bg-destructive/5 border-destructive/20",
                        check.status === "warning" && "bg-warning/5 border-warning/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-xs text-muted-foreground">{check.message}</p>
                        </div>
                      </div>
                      {check.duration && (
                        <span className="text-xs text-muted-foreground">
                          {check.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <CardDescription>
                Last 20 activity events across all jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {auditEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No audit events found
                    </p>
                  ) : (
                    auditEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.summary}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.type.replace("_", " ")}
                              </Badge>
                              {event.actor_name && (
                                <span className="text-xs text-muted-foreground">
                                  by {event.actor_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(event.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}