import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Trash2, Loader2 } from "lucide-react";
import { useJobTasks } from "@/hooks/useJobTasks";

interface JobTasksTabProps {
  jobId: string;
}

export const JobTasksTab = forwardRef<HTMLDivElement, JobTasksTabProps>(
  ({ jobId }, ref) => {
    const { tasks, isLoading, addTask, toggleTask, deleteTask } = useJobTasks(jobId);
    const [newTask, setNewTask] = useState("");

    const handleAddTask = () => {
      if (newTask.trim()) {
        addTask.mutate(newTask.trim());
        setNewTask("");
      }
    };

    const handleToggle = (id: string, currentCompleted: boolean) => {
      toggleTask.mutate({ id, completed: !currentCompleted });
    };

    const handleDelete = (id: string) => {
      deleteTask.mutate(id);
    };

    if (isLoading) {
      return (
        <div ref={ref} className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-6">
        {/* Add Task */}
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <Input
            placeholder="What needs to get done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 border-0 p-0 focus-visible:ring-0 bg-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <Button onClick={handleAddTask} disabled={addTask.isPending} className="gap-2">
            {addTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Task
          </Button>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id, task.completed)}
              />
              <span
                className={
                  task.completed
                    ? "line-through text-muted-foreground flex-1"
                    : "flex-1"
                }
              >
                {task.title}
              </span>
              {task.due_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {task.due_date}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    );
  }
);

JobTasksTab.displayName = "JobTasksTab";
