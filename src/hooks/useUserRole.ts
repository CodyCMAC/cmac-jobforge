 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import type { Database } from "@/integrations/supabase/types";
 
 type AppRole = Database["public"]["Enums"]["app_role"];
 
 export interface UserRole {
   role: AppRole;
   isAdmin: boolean;
   isManager: boolean;
   isMember: boolean;
 }
 
 export function useUserRole() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["user-role", user?.id],
     queryFn: async (): Promise<UserRole> => {
       if (!user) {
         return { role: "member", isAdmin: false, isManager: false, isMember: true };
       }
 
       const { data, error } = await supabase
         .from("user_roles")
         .select("role")
         .eq("user_id", user.id)
         .maybeSingle();
 
       if (error) {
         console.error("Error fetching user role:", error);
         return { role: "member", isAdmin: false, isManager: false, isMember: true };
       }
 
       const role = data?.role || "member";
       return {
         role,
         isAdmin: role === "admin",
         isManager: role === "manager",
         isMember: role === "member",
       };
     },
     enabled: !!user,
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
 }