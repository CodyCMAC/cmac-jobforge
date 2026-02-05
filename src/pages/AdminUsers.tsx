import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ClipboardList, Mail, Pencil, Plus, RefreshCw, ShieldAlert, Trash2, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MainLayout, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminUpdateUser,
  useAdminUsers,
  useAdminInvites,
  useCreateInvite,
  useDeleteInvite,
  useAdminAuditLog,
  type AdminUser,
  type AdminUserRole,
  type UserInvite,
  type AuditLogEntry,
} from "@/hooks/useAdminUsers";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function roleLabel(role: AdminUserRole) {
  if (role === "member") return "Standard";
  return role === "admin" ? "Admin" : "Manager";
}

function roleBadgeVariant(role: AdminUserRole): "default" | "secondary" | "destructive" {
  if (role === "admin") return "destructive";
  if (role === "manager") return "default";
  return "secondary";
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const isAdmin = !!roleData?.isAdmin;

  const { data: users = [], isLoading, isFetching, refetch, error } = useAdminUsers({ enabled: isAdmin });
  const updateUser = useAdminUpdateUser();
  const { data: invites = [], isLoading: invitesLoading, refetch: refetchInvites } = useAdminInvites({ enabled: isAdmin });
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();
  const { data: auditLogs = [], isLoading: auditLoading, refetch: refetchAudit } = useAdminAuditLog({ enabled: isAdmin, limit: 100 });

  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<AdminUserRole>("member");

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminUserRole>("member");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const haystack = [u.email, u.full_name, u.role].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [users, search]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditFullName(u.full_name ?? "");
    setEditRole(u.role);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    await updateUser.mutateAsync({
      userId: editingUser.id,
      role: editRole,
      fullName: editFullName,
    });
    setEditingUser(null);
  };

  const handleInvite = async () => {
    await createInvite.mutateAsync({ email: inviteEmail, role: inviteRole });
    setInviteDialogOpen(false);
    setInviteEmail("");
    setInviteRole("member");
  };

  const handleRefreshAll = () => {
    refetch();
    refetchInvites();
    refetchAudit();
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="User Management"
          description="View and edit users in your system"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button variant="outline" onClick={() => refetch()} disabled={!isAdmin || isFetching} className="gap-2">
                <RefreshCw className={"w-4 h-4" + (isFetching ? " animate-spin" : "")} />
                Refresh
              </Button>
              <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite User
              </Button>
            </div>
          }
        />

        {roleLoading ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading…</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 rounded-md bg-muted animate-pulse" />
              </CardContent>
            </Card>
          </div>
        ) : !isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Admin access required
              </CardTitle>
              <CardDescription>
                You don’t have permission to view this page.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="invites" className="gap-2">
                <Mail className="w-4 h-4" />
                Pending Invites ({invites.length})
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Users
                  </CardTitle>
                  <CardDescription>Search, review, and edit roles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="max-w-md w-full">
                      <Label htmlFor="userSearch">Search</Label>
                      <Input
                        id="userSearch"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or role"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">{filtered.length} users</div>
                  </div>

                  {error ? (
                    <div className="text-sm text-destructive">
                      Failed to load users: {(error as any)?.message || "Unknown error"}
                    </div>
                  ) : isLoading ? (
                    <div className="h-24 rounded-md bg-muted animate-pulse" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last sign-in</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                            <TableCell>{u.email || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={roleBadgeVariant(u.role)}>{roleLabel(u.role)}</Badge>
                            </TableCell>
                            <TableCell>
                              {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                            </TableCell>
                            <TableCell>
                              {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, yyyy") : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="gap-2">
                                <Pencil className="w-4 h-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invites Tab */}
            <TabsContent value="invites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Pending Invites
                  </CardTitle>
                  <CardDescription>Invitations that haven't been accepted yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  {invitesLoading ? (
                    <div className="h-24 rounded-md bg-muted animate-pulse" />
                  ) : invites.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No pending invites</p>
                      <Button variant="outline" className="mt-4" onClick={() => setInviteDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Invite someone
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Invited By</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invites.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.email}</TableCell>
                            <TableCell>
                              <Badge variant={roleBadgeVariant(inv.role)}>{roleLabel(inv.role)}</Badge>
                            </TableCell>
                            <TableCell>{inv.invited_by_email ?? "—"}</TableCell>
                            <TableCell>{format(new Date(inv.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>{format(new Date(inv.expires_at), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteInvite.mutate(inv.id)}
                                disabled={deleteInvite.isPending}
                                className="gap-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Audit Log
                  </CardTitle>
                  <CardDescription>History of role changes and invites.</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLoading ? (
                    <div className="h-24 rounded-md bg-muted animate-pulse" />
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No audit entries yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>When</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>By</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action.replace("_", " ")}</Badge>
                            </TableCell>
                            <TableCell>{log.target_user_email ?? log.target_user_id.slice(0, 8)}</TableCell>
                            <TableCell>{log.actor_email ?? log.actor_user_id.slice(0, 8)}</TableCell>
                            <TableCell className="max-w-xs truncate" title={log.details ?? ""}>
                              {log.details ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update role and display name.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingUser?.email ?? ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Display name</Label>
                <Input
                  id="fullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as AdminUserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser?.id === currentUser?.id && editRole !== "admin" && (
                <div className="text-sm text-destructive">
                  You can’t remove your own admin role.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)} disabled={updateUser.isPending}>
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                disabled={
                  updateUser.isPending ||
                  !editingUser ||
                  (editingUser?.id === currentUser?.id && editRole !== "admin")
                }
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>Send an email invitation to join JobForge.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AdminUserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={createInvite.isPending}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={createInvite.isPending || !inviteEmail.includes("@")}>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
