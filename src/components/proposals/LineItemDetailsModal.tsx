import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalOption } from "@/hooks/useProposals";

interface LineItemDetailsModalProps {
  option: ProposalOption;
}

export function LineItemDetailsModal({ option }: LineItemDetailsModalProps) {
  // Calculate totals
  const totalCogs = option.line_items?.reduce((sum, item) => sum + Number(item.cogs), 0) || 0;
  const grossProfit = option.subtotal - totalCogs;
  const tax = option.line_items?.reduce((sum, item) => sum + (Number(item.subtotal) * Number(item.sales_tax_percent) / 100), 0) || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{option.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="option" className="mt-4">
          <TabsList>
            <TabsTrigger value="option">Estimate option</TabsTrigger>
            <TabsTrigger value="totals">Estimate totals</TabsTrigger>
          </TabsList>

          <TabsContent value="option" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Unit cost ($)</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Waste (%)</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Adj.</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">COGS</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Margin (%)</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Subtotal ($)</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Sales tax (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {option.line_items?.map((item, idx) => {
                    const isCategory = item.category !== item.name;
                    return (
                      <>
                        {isCategory && (
                          <tr key={`cat-${idx}`} className="bg-foreground text-background">
                            <td colSpan={10} className="py-2 px-3 font-semibold">{item.category}</td>
                          </tr>
                        )}
                        <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-2 px-3">{item.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.description || "-"}</td>
                          <td className="py-2 px-3 text-right">{Number(item.unit_cost).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.quantity).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.waste_percent).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.adjustment)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.cogs).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.margin_percent)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.subtotal).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{Number(item.sales_tax_percent).toFixed(3)}</td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="totals" className="mt-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Estimate totals</h3>
              <div className="w-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2"></th>
                      <th className="text-right py-2 font-medium">Estimate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 text-muted-foreground">Cost of goods sold</td>
                      <td className="py-2 text-right bg-primary text-primary-foreground font-medium">
                        ${totalCogs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Gross profit</td>
                      <td className="py-2 text-right bg-primary text-primary-foreground font-medium">
                        ${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Subtotal</td>
                      <td className="py-2 text-right bg-primary text-primary-foreground font-medium">
                        ${option.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Tax</td>
                      <td className="py-2 text-right bg-primary text-primary-foreground font-medium">
                        ${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-2 font-semibold">Total</td>
                      <td className="py-2 text-right bg-primary text-primary-foreground font-bold">
                        ${(option.subtotal + tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
