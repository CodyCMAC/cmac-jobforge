export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          label: string | null
          name: string
          notes: string | null
          phone: string | null
          type: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          label?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          type?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          label?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          type?: string
        }
        Relationships: []
      }
      estimator_leads: {
        Row: {
          address: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          estimate_type: string
          estimated_price: number | null
          estimated_sqft: number | null
          estimator_id: string
          id: string
          questionnaire_responses: Json | null
          selected_material_id: string | null
          status: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          estimate_type: string
          estimated_price?: number | null
          estimated_sqft?: number | null
          estimator_id: string
          id?: string
          questionnaire_responses?: Json | null
          selected_material_id?: string | null
          status?: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          estimate_type?: string
          estimated_price?: number | null
          estimated_sqft?: number | null
          estimator_id?: string
          id?: string
          questionnaire_responses?: Json | null
          selected_material_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimator_leads_estimator_id_fkey"
            columns: ["estimator_id"]
            isOneToOne: false
            referencedRelation: "instant_estimators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimator_leads_selected_material_id_fkey"
            columns: ["selected_material_id"]
            isOneToOne: false
            referencedRelation: "estimator_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      estimator_materials: {
        Row: {
          created_at: string
          description: string | null
          estimator_id: string
          id: string
          is_default: boolean
          name: string
          price_per_unit: number
          unit_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimator_id: string
          id?: string
          is_default?: boolean
          name: string
          price_per_unit?: number
          unit_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimator_id?: string
          id?: string
          is_default?: boolean
          name?: string
          price_per_unit?: number
          unit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimator_materials_estimator_id_fkey"
            columns: ["estimator_id"]
            isOneToOne: false
            referencedRelation: "instant_estimators"
            referencedColumns: ["id"]
          },
        ]
      }
      estimator_questions: {
        Row: {
          created_at: string
          estimator_id: string
          id: string
          is_required: boolean
          options: Json | null
          question_text: string
          question_type: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          estimator_id: string
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text: string
          question_type?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          estimator_id?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text?: string
          question_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimator_questions_estimator_id_fkey"
            columns: ["estimator_id"]
            isOneToOne: false
            referencedRelation: "instant_estimators"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_estimators: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          default_assignee: string | null
          estimate_type: string
          financing_link: string | null
          id: string
          is_active: boolean
          name: string
          pricing_unit: string
          require_email: boolean
          require_phone: boolean
          scheduling_link: string | null
          show_financing: boolean
          show_price_range: boolean
          show_project_showcase: boolean
          show_social_links: boolean
          slug: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          default_assignee?: string | null
          estimate_type?: string
          financing_link?: string | null
          id?: string
          is_active?: boolean
          name: string
          pricing_unit?: string
          require_email?: boolean
          require_phone?: boolean
          scheduling_link?: string | null
          show_financing?: boolean
          show_price_range?: boolean
          show_project_showcase?: boolean
          show_social_links?: boolean
          slug?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          default_assignee?: string | null
          estimate_type?: string
          financing_link?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pricing_unit?: string
          require_email?: boolean
          require_phone?: boolean
          scheduling_link?: string | null
          show_financing?: boolean
          show_price_range?: boolean
          show_project_showcase?: boolean
          show_social_links?: boolean
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string
          assignee_initials: string
          assignee_name: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          proposal_status: string | null
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          address: string
          assignee_initials: string
          assignee_name: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          proposal_status?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          address?: string
          assignee_initials?: string
          assignee_name?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          proposal_status?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      proposal_line_items: {
        Row: {
          adjustment: number
          category: string
          cogs: number
          created_at: string
          description: string | null
          id: string
          margin_percent: number
          name: string
          option_id: string
          quantity: number
          sales_tax_percent: number
          sort_order: number
          subtotal: number
          unit_cost: number
          waste_percent: number
        }
        Insert: {
          adjustment?: number
          category?: string
          cogs?: number
          created_at?: string
          description?: string | null
          id?: string
          margin_percent?: number
          name: string
          option_id: string
          quantity?: number
          sales_tax_percent?: number
          sort_order?: number
          subtotal?: number
          unit_cost?: number
          waste_percent?: number
        }
        Update: {
          adjustment?: number
          category?: string
          cogs?: number
          created_at?: string
          description?: string | null
          id?: string
          margin_percent?: number
          name?: string
          option_id?: string
          quantity?: number
          sales_tax_percent?: number
          sort_order?: number
          subtotal?: number
          unit_cost?: number
          waste_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_line_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "proposal_options"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_selected: boolean
          name: string
          proposal_id: string
          sort_order: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_selected?: boolean
          name?: string
          proposal_id: string
          sort_order?: number
          subtotal?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_selected?: boolean
          name?: string
          proposal_id?: string
          sort_order?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_options_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          contractor_signature: string
          contractor_signed_at: string | null
          created_at: string
          customer_notes: string | null
          customer_signature: string | null
          customer_signed_at: string | null
          id: string
          job_id: string
          status: string
          subtotal: number
          tax_amount: number
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          contractor_signature?: string
          contractor_signed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          customer_signature?: string | null
          customer_signed_at?: string | null
          id?: string
          job_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          contractor_signature?: string
          contractor_signed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          customer_signature?: string | null
          customer_signed_at?: string | null
          id?: string
          job_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
