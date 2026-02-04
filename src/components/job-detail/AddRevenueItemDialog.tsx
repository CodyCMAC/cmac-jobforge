import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateRevenueItem,
  useUpdateRevenueItem,
  REVENUE_CATEGORY_LABELS,
  dollarsToCents,
  centsToDollars,
  type RevenueItem,
  type RevenueCategory,
} from "@/hooks/useJobFinancials";

interface AddRevenueItemDialogProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: RevenueItem | null;
}

export function AddRevenueItemDialog({
  jobId,
  open,
  onOpenChange,
  editItem,
}: AddRevenueItemDialogProps) {
  const createItem = useCreateRevenueItem();
  const updateItem = useUpdateRevenueItem();

  const [formData, setFormData] = useState({
    category: "contract" as RevenueCategory,
    description: "",
    estimated_amount: "",
    actual_amount: "",
    item_date: "",
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        category: editItem.category,
        description: editItem.description || "",
        estimated_amount: centsToDollars(editItem.estimated_amount).toString(),
        actual_amount:
          editItem.actual_amount !== null
            ? centsToDollars(editItem.actual_amount).toString()
            : "",
        item_date: editItem.item_date || "",
      });
    } else {
      setFormData({
        category: "contract",
        description: "",
        estimated_amount: "",
        actual_amount: "",
        item_date: "",
      });
    }
  }, [editItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      job_id: jobId,
      category: formData.category,
      description: formData.description.trim() || null,
      estimated_amount: dollarsToCents(parseFloat(formData.estimated_amount) || 0),
      actual_amount: formData.actual_amount
        ? dollarsToCents(parseFloat(formData.actual_amount))
        : null,
      item_date: formData.item_date || null,
      attachment_url: null,
    };

    if (editItem) {
      await updateItem.mutateAsync({ id: editItem.id, updates: data });
    } else {
      await createItem.mutateAsync(data);
    }

    onOpenChange(false);
  };

  const isSubmitting = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Edit Revenue Item" : "Add Revenue Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value as RevenueCategory }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REVENUE_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="e.g., Base contract amount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated">Estimated ($)</Label>
              <Input
                id="estimated"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, estimated_amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual">Actual ($)</Label>
              <Input
                id="actual"
                type="number"
                step="0.01"
                min="0"
                value={formData.actual_amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, actual_amount: e.target.value }))
                }
                placeholder="Leave blank if not yet known"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.item_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, item_date: e.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
