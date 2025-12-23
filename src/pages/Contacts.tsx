import { MainLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { CreateContactDialog, ContactActionsMenu, ContactTypeFilter } from "@/components/contacts";

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = !searchQuery || 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !typeFilter || contact.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, typeFilter]);

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Contacts"
          actions={
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ContactTypeFilter value={typeFilter} onChange={setTypeFilter} />
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Notes</th>
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
                      <td colSpan={9} className="px-4 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      {contacts.length === 0 ? "No contacts found. Create your first contact!" : "No contacts match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{contact.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {contact.type === "Lead" ? "🎯" : contact.type === "Agent" ? "🏢" : "👤"} {contact.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contact.label || "-"}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.address || "-"}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{contact.notes}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contact.createdAt}</td>
                      <td className="px-4 py-3">
                        <ContactActionsMenu contact={contact} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateContactDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </MainLayout>
  );
}
