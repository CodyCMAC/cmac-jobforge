import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Eye } from "lucide-react";

interface WorkOrder {
  id: string;
  orderNumber: string;
  type: string;
  date: string;
  crewContact: string;
  status: "draft" | "sent" | "complete";
}

interface JobWorkOrdersSectionProps {
  jobId: string;
}

export function JobWorkOrdersSection({ jobId }: JobWorkOrdersSectionProps) {
  // Mock work orders for demo
  const workOrders: WorkOrder[] = [
    {
      id: "1",
      orderNumber: "00001",
      type: "Install",
      date: "January 5",
      crewContact: "Ateam",
      status: "sent"
    }
  ];

  const getStatusBadge = (status: WorkOrder["status"]) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Sent</Badge>;
      case "complete":
        return <Badge className="bg-success/10 text-success border-success/20">Complete</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Work Orders</h3>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Work order
        </Button>
      </div>

      {/* Work Orders Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Work order #</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Crew contact</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((order) => (
              <tr key={order.id} className="border-t border-border hover:bg-accent/50">
                <td className="p-3">{getStatusBadge(order.status)}</td>
                <td className="p-3 font-mono text-sm">{order.orderNumber}</td>
                <td className="p-3">{order.type}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">{order.crewContact}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {workOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No work orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
