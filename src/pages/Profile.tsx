 import { useState } from "react";
 import { MainLayout, PageHeader } from "@/components/layout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Separator } from "@/components/ui/separator";
 import { useAuth } from "@/contexts/AuthContext";
 import { useUserRole } from "@/hooks/useUserRole";
 import { toast } from "sonner";
 import { User, Mail, Shield, Calendar, Save, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { format } from "date-fns";
 
 export default function Profile() {
   const { user } = useAuth();
   const { data: roleData, isLoading: roleLoading } = useUserRole();
   const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
   const [saving, setSaving] = useState(false);
 
   const handleSaveProfile = async () => {
     if (!user) return;
     
     setSaving(true);
     try {
       const { error } = await supabase.auth.updateUser({
         data: { full_name: displayName }
       });
 
       if (error) throw error;
       toast.success("Profile updated successfully");
     } catch (error) {
       console.error("Error updating profile:", error);
       toast.error("Failed to update profile");
     } finally {
       setSaving(false);
     }
   };
 
   const getRoleBadgeVariant = (role: string) => {
     switch (role) {
       case "admin": return "destructive";
       case "manager": return "default";
       default: return "secondary";
     }
   };
 
   const getRoleLabel = (role: string) => {
     switch (role) {
       case "admin": return "Administrator";
       case "manager": return "Manager";
       default: return "Team Member";
     }
   };
 
   return (
     <MainLayout>
       <div className="animate-fade-in">
         <PageHeader title="My Profile" />
 
         <div className="grid gap-6 md:grid-cols-2">
           {/* Profile Information */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <User className="w-5 h-5" />
                 Profile Information
               </CardTitle>
               <CardDescription>
                 Update your personal details
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="displayName">Display Name</Label>
                 <Input
                   id="displayName"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   placeholder="Enter your display name"
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input
                   id="email"
                   value={user?.email || ""}
                   disabled
                   className="bg-muted"
                 />
                 <p className="text-xs text-muted-foreground">
                   Email cannot be changed here. Contact an administrator.
                 </p>
               </div>
 
               <Button 
                 onClick={handleSaveProfile} 
                 disabled={saving}
                 className="w-full"
               >
                 {saving ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Saving...
                   </>
                 ) : (
                   <>
                     <Save className="w-4 h-4 mr-2" />
                     Save Changes
                   </>
                 )}
               </Button>
             </CardContent>
           </Card>
 
           {/* Account Details */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="w-5 h-5" />
                 Account Details
               </CardTitle>
               <CardDescription>
                 Your account information and role
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                 <div className="flex items-center gap-3">
                   <Mail className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Email</p>
                     <p className="text-sm text-muted-foreground">{user?.email}</p>
                   </div>
                 </div>
               </div>
 
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                 <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Role</p>
                     {roleLoading ? (
                       <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                     ) : (
                       <Badge variant={getRoleBadgeVariant(roleData?.role || "member")}>
                         {getRoleLabel(roleData?.role || "member")}
                       </Badge>
                     )}
                   </div>
                 </div>
               </div>
 
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                 <div className="flex items-center gap-3">
                   <Calendar className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm font-medium">Account Created</p>
                     <p className="text-sm text-muted-foreground">
                       {user?.created_at 
                         ? format(new Date(user.created_at), "MMMM d, yyyy")
                         : "Unknown"}
                     </p>
                   </div>
                 </div>
               </div>
 
               <Separator />
 
               <div className="space-y-2">
                 <p className="text-sm font-medium">User ID</p>
                 <code className="block p-2 text-xs bg-muted rounded font-mono break-all">
                   {user?.id}
                 </code>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </MainLayout>
   );
 }