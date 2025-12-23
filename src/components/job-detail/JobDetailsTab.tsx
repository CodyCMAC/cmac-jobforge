import { forwardRef, useState } from "react";
import { Job, formatCurrency, daysInStage, getStatusBadgeClasses } from "@/components/jobs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, CheckCircle, FileText, AlertCircle, Plus, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { useJobTasks } from "@/hooks/useJobTasks";
import { useJobActivities } from "@/hooks/useJobActivities";

interface JobDetailsTabProps {
  job: Job & { customerEmail?: string; customerPhone?: string };
  proposals: any[];
  proposalTotal: number;
}

export const JobDetailsTab = forwardRef<HTMLDivElement, JobDetailsTabProps>(
  ({ job, proposals, proposalTotal }, ref) => {
    const [isInsurance, setIsInsurance] = useState(false);
    const [taskInput, setTaskInput] = useState("");
    const updateJob = useUpdateJob(job.id);
    const { addTask } = useJobTasks(job.id);
    const { addActivity } = useJobActivities(job.id);

    const handleStatusChange = (newStatus: string) => {
      updateJob.mutate(
        { status: newStatus },
        {
          onSuccess: () => {
            toast.success("Workflow stage updated");
            // Log activity for stage change
            addActivity.mutate({
              type: "status_change",
              title: "Workflow stage changed",
              body: `Status updated to "${getStageLabel(newStatus)}"`,
            });
          },
        }
      );
    };

    const getStageLabel = (status: string) => {
      const labels: Record<string, string> = {
        new: "New lead",
        scheduled: "Appointment scheduled",
        sent: "Proposal sent/presented",
        signed: "Proposal signed",
        production: "Production",
        complete: "Complete",
      };
      return labels[status] || status;
    };

    const handleAddTask = () => {
      if (taskInput.trim()) {
        addTask.mutate(taskInput.trim(), {
          onSuccess: () => {
            toast.success("Task added successfully");
            setTaskInput("");
          },
        });
      }
    };

    // Calculate suggested value from proposals
    const suggestedValue = proposals.length > 0 ? proposalTotal : 0;
    const showSuggestion = suggestedValue > 0 && suggestedValue !== job.value;

    return (
      <div ref={ref} className="space-y-6">
        {/* Status Bar */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-muted-foreground">• {daysInStage(job.updatedAt)}</span>
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            0/0
          </Badge>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            No reports
          </Badge>
          {job.proposalStatus && (
            <Badge className={"gap-1 " + getStatusBadgeClasses(job.proposalStatus)}>
              <CheckCircle className="h-3 w-3" />
              {job.proposalStatus === "won" ? "Won" : job.proposalStatus}
            </Badge>
          )}
          <span className="text-muted-foreground">
            Updated {format(job.updatedAt, "MMM d, yyyy")}
          </span>
          <span className="text-muted-foreground">• Changes auto-saved</span>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee(s)</Label>
            <Select defaultValue={job.assignee.name}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={job.assignee.name}>{job.assignee.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Owner */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Job owner
              <Info className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input defaultValue={job.assignee.name} disabled aria-label="Job owner" />
          </div>

          {/* Workflow & Stages */}
          <div className="space-y-2">
            <Label>Workflow & stages</Label>
            <Select value={job.status} onValueChange={handleStatusChange}>
              <SelectTrigger disabled={updateJob.isPending}>
                {updateJob.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New lead</SelectItem>
                <SelectItem value="scheduled">Appointment scheduled</SelectItem>
                <SelectItem value="sent">Proposal sent/presented</SelectItem>
                <SelectItem value="signed">Proposal signed</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Close Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Close date
              <Info className="h-3 w-3 text-muted-foreground" />
            </Label>
            <div className="relative">
              <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">Set automatically by Roofr</p>
          </div>

          {/* Job Value */}
          <div className="space-y-2">
            <Label>Job value</Label>
            <Input defaultValue={formatCurrency(job.value)} className="font-semibold" />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>Source</Label>
            <Input placeholder="Start typing to add new or select..." />
          </div>
        </div>

        {/* Proposal Suggestion Banner */}
        {showSuggestion && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm flex-1">
              Proposals suggests a job value of <strong>{formatCurrency(suggestedValue)}</strong>.{" "}
              <button className="text-primary hover:underline font-medium">Click here</button> to
              apply.
            </p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          <Label>Details</Label>
          <Textarea
            placeholder="Frequently referenced info (gate codes, material selection, parking, etc.)"
            className="min-h-[80px]"
          />
        </div>

        {/* Insurance Toggle */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="font-medium">Insurance</span>
          </div>
          <Switch checked={isInsurance} onCheckedChange={setIsInsurance} />
        </div>

        {/* Task Input */}
        <div className="space-y-2">
          <Label className="font-semibold text-base">Task</Label>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            <Input
              placeholder="What needs to get done?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="flex-1 border-0 p-0 focus-visible:ring-0 bg-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <Button onClick={handleAddTask} disabled={addTask.isPending} className="gap-2">
              {addTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Task
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

JobDetailsTab.displayName = "JobDetailsTab";
