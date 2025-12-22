import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  ExternalLink,
  QrCode,
  Code2,
  DollarSign,
  Users,
  Calendar,
  Link2,
  Share2,
} from "lucide-react";
import { InstantEstimator, useUpdateEstimator } from "@/hooks/useInstantEstimators";
import { ESTIMATE_TYPES, EstimateTypeIcon } from "./EstimateTypeIcon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EstimatorSettingsProps {
  estimator: InstantEstimator;
}

export function EstimatorSettings({ estimator }: EstimatorSettingsProps) {
  const updateEstimator = useUpdateEstimator();
  const [localState, setLocalState] = useState(estimator);

  const estimatorUrl = `${window.location.origin}/estimate/${estimator.slug}`;
  const embedCode = `<iframe src="${estimatorUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(estimatorUrl);
    toast.success("Link copied to clipboard");
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied");
  };

  const handleUpdate = async (updates: Partial<InstantEstimator>) => {
    setLocalState((prev) => ({ ...prev, ...updates }));
    await updateEstimator.mutateAsync({ id: estimator.id, updates });
  };

  return (
    <div className="space-y-6">
      {/* Share & Embed Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Share & Embed</h3>
            <p className="text-sm text-muted-foreground">
              Get the link or embed code for your estimator
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Shareable Link */}
          <div className="flex gap-2">
            <Input
              value={estimatorUrl}
              readOnly
              className="font-mono text-sm bg-muted/50"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(estimatorUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopyEmbed}
            >
              <Code2 className="w-4 h-4" />
              Embed Code
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="general" className="gap-2">
            <EstimateTypeIcon type={localState.estimate_type} size="sm" />
            General
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Users className="w-4 h-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Link2 className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Estimator Name</Label>
              <Input
                value={localState.name}
                onChange={(e) => setLocalState({ ...localState, name: e.target.value })}
                onBlur={() => handleUpdate({ name: localState.name })}
              />
            </div>

            <div className="space-y-2">
              <Label>Estimate Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ESTIMATE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = localState.estimate_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleUpdate({ estimate_type: type.value })}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this estimator
                </p>
              </div>
              <Switch
                checked={localState.is_active}
                onCheckedChange={(checked) => handleUpdate({ is_active: checked })}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Pricing Unit</Label>
              <Select
                value={localState.pricing_unit}
                onValueChange={(value) => handleUpdate({ pricing_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_sqft">Per Square Foot</SelectItem>
                  <SelectItem value="per_square">Per Square (100 sq ft)</SelectItem>
                  <SelectItem value="flat_rate">Flat Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Price Range</Label>
                <p className="text-sm text-muted-foreground">
                  Display estimates as a range instead of fixed price
                </p>
              </div>
              <Switch
                checked={localState.show_price_range}
                onCheckedChange={(checked) => handleUpdate({ show_price_range: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Financing Options</Label>
                <p className="text-sm text-muted-foreground">
                  Display financing information with estimates
                </p>
              </div>
              <Switch
                checked={localState.show_financing}
                onCheckedChange={(checked) => handleUpdate({ show_financing: checked })}
              />
            </div>

            {localState.show_financing && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label>Financing Link</Label>
                <Input
                  value={localState.financing_link || ""}
                  onChange={(e) =>
                    setLocalState({ ...localState, financing_link: e.target.value })
                  }
                  onBlur={() => handleUpdate({ financing_link: localState.financing_link })}
                  placeholder="https://your-financing-page.com"
                />
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Default Job Owner</Label>
              <Input
                value={localState.default_assignee || ""}
                onChange={(e) =>
                  setLocalState({ ...localState, default_assignee: e.target.value })
                }
                onBlur={() => handleUpdate({ default_assignee: localState.default_assignee })}
                placeholder="John Doe"
              />
              <p className="text-xs text-muted-foreground">
                New leads from this estimator will be assigned to this person
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={localState.contact_name || ""}
                  onChange={(e) =>
                    setLocalState({ ...localState, contact_name: e.target.value })
                  }
                  onBlur={() => handleUpdate({ contact_name: localState.contact_name })}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={localState.contact_email || ""}
                  onChange={(e) =>
                    setLocalState({ ...localState, contact_email: e.target.value })
                  }
                  onBlur={() => handleUpdate({ contact_email: localState.contact_email })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={localState.contact_phone || ""}
                  onChange={(e) =>
                    setLocalState({ ...localState, contact_phone: e.target.value })
                  }
                  onBlur={() => handleUpdate({ contact_phone: localState.contact_phone })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduling Link</Label>
                <Input
                  value={localState.scheduling_link || ""}
                  onChange={(e) =>
                    setLocalState({ ...localState, scheduling_link: e.target.value })
                  }
                  onBlur={() => handleUpdate({ scheduling_link: localState.scheduling_link })}
                  placeholder="Calendly, Cal.com, etc."
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card className="p-6 space-y-6">
            <h4 className="font-medium">Lead Capture Requirements</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Phone Number</Label>
                <p className="text-sm text-muted-foreground">
                  Customers must provide a phone number
                </p>
              </div>
              <Switch
                checked={localState.require_phone}
                onCheckedChange={(checked) => handleUpdate({ require_phone: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email</Label>
                <p className="text-sm text-muted-foreground">
                  Customers must provide an email address
                </p>
              </div>
              <Switch
                checked={localState.require_email}
                onCheckedChange={(checked) => handleUpdate({ require_email: checked })}
              />
            </div>

            <Separator />

            <h4 className="font-medium">Additional Content</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Project Showcase</Label>
                <p className="text-sm text-muted-foreground">
                  Display previous projects to customers
                </p>
              </div>
              <Switch
                checked={localState.show_project_showcase}
                onCheckedChange={(checked) =>
                  handleUpdate({ show_project_showcase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Social Media Links</Label>
                <p className="text-sm text-muted-foreground">
                  Display your social media profiles
                </p>
              </div>
              <Switch
                checked={localState.show_social_links}
                onCheckedChange={(checked) => handleUpdate({ show_social_links: checked })}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
