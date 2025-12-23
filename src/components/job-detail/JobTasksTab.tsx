import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

interface JobTasksTabProps {
  jobId: string;
}

export function JobTasksTab({ jobId }: JobTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Schedule initial consultation", completed: true },
    { id: "2", title: "Create proposal", completed: false, dueDate: "2024-01-15" },
    { id: "3", title: "Send contract", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), title: newTask, completed: false }
      ]);
      setNewTask("");
      toast.success("Task added");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="space-y-6">
      {/* Add Task */}
      <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
        <Input
          placeholder="What needs to get done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border-0 p-0 focus-visible:ring-0 bg-transparent"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <Button onClick={handleAddTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
            />
            <span className={task.completed ? "line-through text-muted-foreground flex-1" : "flex-1"}>
              {task.title}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {task.dueDate}
              </span>
            )}
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
