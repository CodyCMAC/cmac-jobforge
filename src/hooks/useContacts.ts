import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Contact {
  id: string;
  name: string;
  type: "Lead" | "Customer" | "Agent";
  label?: string;
  email: string;
  phone: string;
  address?: string;
  notes: string;
  createdAt: string;
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform database format to Contact type
      const contacts: Contact[] = (data || []).map((contact) => ({
        id: contact.id,
        name: contact.name,
        type: contact.type as "Lead" | "Customer" | "Agent",
        label: contact.label || undefined,
        email: contact.email,
        phone: contact.phone || "-",
        address: contact.address || undefined,
        notes: contact.notes || "-",
        createdAt: new Date(contact.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));

      return contacts;
    },
  });
}
