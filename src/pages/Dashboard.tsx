import { MainLayout, PageHeader } from "@/components/layout";
import { StatCard, DashboardCalendar } from "@/components/dashboard";
import { NewItemDropdown } from "@/components/dashboard/NewItemDropdown";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { Users, FileText, Eye, Receipt } from "lucide-react";

const stats = [
  {
    title: "Unactioned leads",
    value: 14,
    icon: Users,
    href: "/jobs?stage=new-lead",
  },
  {
    title: "Unopened sent proposals",
    value: 0,
    subtitle: "$0.00",
    icon: FileText,
    href: "/proposals?status=sent",
  },
  {
    title: "Unsigned viewed proposals",
    value: 0,
    subtitle: "$0.00",
    icon: Eye,
    href: "/proposals?status=viewed",
  },
  {
    title: "Overdue invoices",
    value: 0,
    subtitle: "$0.00",
    icon: Receipt,
    href: "/invoices?status=overdue",
  },
];

export default function Dashboard() {
  const userName = "Cody";

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-3xl">👋</span> Hi {userName}, welcome home
          </h1>
          <div className="flex items-center gap-3">
            <UserDropdown userName="Cody Viveiros" />
            <NewItemDropdown />
          </div>
        </div>

        {/* Your Jobs Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your jobs</h2>
            <p className="text-sm text-muted-foreground">Some of your jobs may need a follow-up</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                href={stat.href}
              />
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <DashboardCalendar />
      </div>
    </MainLayout>
  );
}
