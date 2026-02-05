 import { useState, useEffect } from "react";
 import { MainLayout, PageHeader } from "@/components/layout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { Separator } from "@/components/ui/separator";
 import { useAuth } from "@/contexts/AuthContext";
 import { useTheme } from "@/contexts/ThemeContext";
 import { toast } from "sonner";
 import { 
   Settings as SettingsIcon, 
   Bell, 
   Moon, 
   Sun, 
   Shield, 
   Loader2,
   Key,
   AlertTriangle
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 
 export default function Settings() {
   const { theme, toggleTheme } = useTheme();
   const { user } = useAuth();
   
   // Notification preferences (stored in localStorage for now)
   const [emailNotifications, setEmailNotifications] = useState(true);
   const [pushNotifications, setPushNotifications] = useState(false);
   const [weeklyDigest, setWeeklyDigest] = useState(true);
   
   // Password change
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [changingPassword, setChangingPassword] = useState(false);
 
   useEffect(() => {
     // Load notification preferences from localStorage
     const prefs = localStorage.getItem("notification_preferences");
     if (prefs) {
       const parsed = JSON.parse(prefs);
       setEmailNotifications(parsed.email ?? true);
       setPushNotifications(parsed.push ?? false);
       setWeeklyDigest(parsed.weekly ?? true);
     }
   }, []);
 
   const saveNotificationPreferences = () => {
     const prefs = {
       email: emailNotifications,
       push: pushNotifications,
       weekly: weeklyDigest,
     };
     localStorage.setItem("notification_preferences", JSON.stringify(prefs));
     toast.success("Notification preferences saved");
   };
 
   const handlePasswordChange = async () => {
     if (newPassword !== confirmPassword) {
       toast.error("New passwords do not match");
       return;
     }
 
     if (newPassword.length < 6) {
       toast.error("Password must be at least 6 characters");
       return;
     }
 
     setChangingPassword(true);
     try {
       const { error } = await supabase.auth.updateUser({
         password: newPassword
       });
 
       if (error) throw error;
 
       toast.success("Password updated successfully");
       setCurrentPassword("");
       setNewPassword("");
       setConfirmPassword("");
     } catch (error: any) {
       console.error("Error changing password:", error);
       toast.error(error.message || "Failed to change password");
     } finally {
       setChangingPassword(false);
     }
   };
 
   return (
     <MainLayout>
       <div className="animate-fade-in">
         <PageHeader title="Settings" />
 
         <div className="grid gap-6 max-w-2xl">
           {/* Appearance */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 Appearance
               </CardTitle>
               <CardDescription>
                 Customize how JobForge looks
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Dark Mode</Label>
                   <p className="text-sm text-muted-foreground">
                     Switch between light and dark themes
                   </p>
                 </div>
                 <Switch
                   checked={theme === "dark"}
                   onCheckedChange={toggleTheme}
                 />
               </div>
             </CardContent>
           </Card>
 
           {/* Notifications */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Bell className="w-5 h-5" />
                 Notifications
               </CardTitle>
               <CardDescription>
                 Manage how you receive updates
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Email Notifications</Label>
                   <p className="text-sm text-muted-foreground">
                     Receive updates via email
                   </p>
                 </div>
                 <Switch
                   checked={emailNotifications}
                   onCheckedChange={setEmailNotifications}
                 />
               </div>
 
               <Separator />
 
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Push Notifications</Label>
                   <p className="text-sm text-muted-foreground">
                     Get browser push notifications
                   </p>
                 </div>
                 <Switch
                   checked={pushNotifications}
                   onCheckedChange={setPushNotifications}
                 />
               </div>
 
               <Separator />
 
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Weekly Digest</Label>
                   <p className="text-sm text-muted-foreground">
                     Receive a weekly summary email
                   </p>
                 </div>
                 <Switch
                   checked={weeklyDigest}
                   onCheckedChange={setWeeklyDigest}
                 />
               </div>
 
               <Button onClick={saveNotificationPreferences} className="w-full mt-4">
                 Save Notification Preferences
               </Button>
             </CardContent>
           </Card>
 
           {/* Security */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="w-5 h-5" />
                 Security
               </CardTitle>
               <CardDescription>
                 Manage your account security
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="newPassword">New Password</Label>
                 <Input
                   id="newPassword"
                   type="password"
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="Enter new password"
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="confirmPassword">Confirm New Password</Label>
                 <Input
                   id="confirmPassword"
                   type="password"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="Confirm new password"
                 />
               </div>
 
               <Button 
                 onClick={handlePasswordChange}
                 disabled={changingPassword || !newPassword || !confirmPassword}
                 className="w-full"
               >
                 {changingPassword ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Updating...
                   </>
                 ) : (
                   <>
                     <Key className="w-4 h-4 mr-2" />
                     Update Password
                   </>
                 )}
               </Button>
             </CardContent>
           </Card>
 
           {/* Danger Zone */}
           <Card className="border-destructive/50">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-destructive">
                 <AlertTriangle className="w-5 h-5" />
                 Danger Zone
               </CardTitle>
               <CardDescription>
                 Irreversible actions
               </CardDescription>
             </CardHeader>
             <CardContent>
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button variant="destructive" className="w-full">
                     Delete Account
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                       This action cannot be undone. This will permanently delete your
                       account and remove all your data from our servers.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                       onClick={() => toast.info("Account deletion requires admin approval. Please contact support.")}
                       className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     >
                       Delete Account
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
               <p className="text-xs text-muted-foreground mt-2 text-center">
                 Account deletion requires admin approval
               </p>
             </CardContent>
           </Card>
         </div>
       </div>
     </MainLayout>
   );
 }