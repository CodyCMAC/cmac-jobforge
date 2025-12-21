import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Contacts"
          actions={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New contact
            </Button>
          }
        />

        {/* Search and filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone"
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Type
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Name
                    <span className="ml-1 opacity-50">↕</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Type
                    <span className="ml-1 opacity-50">↕</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Label
                    <span className="ml-1 opacity-50">↕</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Created
                    <span className="ml-1 opacity-50">↕</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={8} className="px-4 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{contact.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {contact.type === "Crew" ? "👷" : "👤"} {contact.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contact.label || "-"}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.job}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contact.createdAt}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
