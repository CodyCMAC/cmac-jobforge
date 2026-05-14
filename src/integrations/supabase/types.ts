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
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string
          created_at: string
          details: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          target_user_email: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_user_email?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_user_email?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      commission_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_amount: number
          base_type: string
          calculated_amount: number
          clawback_of: string | null
          clawback_reason: string | null
          created_at: string
          final_amount: number
          id: string
          job_id: string
          margin_at_calc: number | null
          override_amount: number | null
          paid_at: string | null
          payment_reference: string | null
          rate_applied: number | null
          role: string
          rule_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount: number
          base_type: string
          calculated_amount: number
          clawback_of?: string | null
          clawback_reason?: string | null
          created_at?: string
          final_amount: number
          id?: string
          job_id: string
          margin_at_calc?: number | null
          override_amount?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          rate_applied?: number | null
          role: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number
          base_type?: string
          calculated_amount?: number
          clawback_of?: string | null
          clawback_reason?: string | null
          created_at?: string
          final_amount?: number
          id?: string
          job_id?: string
          margin_at_calc?: number | null
          override_amount?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          rate_applied?: number | null
          role?: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_entries_clawback_of_fkey"
            columns: ["clawback_of"]
            isOneToOne: false
            referencedRelation: "commission_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_entries_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_events: {
        Row: {
          actor_name: string | null
          actor_user_id: string | null
          created_at: string
          entry_id: string
          event_type: Database["public"]["Enums"]["commission_event_type"]
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
        }
        Insert: {
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string
          entry_id: string
          event_type: Database["public"]["Enums"]["commission_event_type"]
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
        }
        Update: {
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string
          entry_id?: string
          event_type?: Database["public"]["Enums"]["commission_event_type"]
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_events_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "commission_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          calculation_type: Database["public"]["Enums"]["commission_calc_type"]
          created_at: string
          flat_amount: number | null
          id: string
          is_active: boolean
          plan_id: string
          priority: number
          rate: number | null
          role: string
          split_percentage: number | null
          tiers: Json | null
          updated_at: string
        }
        Insert: {
          calculation_type?: Database["public"]["Enums"]["commission_calc_type"]
          created_at?: string
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          plan_id: string
          priority?: number
          rate?: number | null
          role: string
          split_percentage?: number | null
          tiers?: Json | null
          updated_at?: string
        }
        Update: {
          calculation_type?: Database["public"]["Enums"]["commission_calc_type"]
          created_at?: string
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          plan_id?: string
          priority?: number
          rate?: number | null
          role?: string
          split_percentage?: number | null
          tiers?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "commission_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          label: string | null
          name: string
          notes: string | null
          owner_user_id: string | null
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
          owner_user_id?: string | null
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
          owner_user_id?: string | null
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
      instant_estimator_contact_details: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          estimator_id: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          estimator_id: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          estimator_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instant_estimator_contact_details_estimator_id_fkey"
            columns: ["estimator_id"]
            isOneToOne: true
            referencedRelation: "instant_estimators"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_estimators: {
        Row: {
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
      invoices: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          job_id: string | null
          notes: string | null
          paid_date: string | null
          status: string
          tax_amount: number
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          job_id?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string
          tax_amount?: number
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          job_id?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string
          tax_amount?: number
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_activities: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          job_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          job_id: string
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          job_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_activities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_activity: {
        Row: {
          actor_initials: string | null
          actor_name: string | null
          actor_user_id: string | null
          created_at: string
          id: string
          job_id: string
          metadata: Json | null
          summary: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          actor_initials?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          job_id: string
          metadata?: Json | null
          summary: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          actor_initials?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          job_id?: string
          metadata?: Json | null
          summary?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "job_activity_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_comments: {
        Row: {
          author_initials: string
          author_name: string
          author_user_id: string
          body: string
          created_at: string
          id: string
          is_deleted: boolean
          job_id: string
          parent_comment_id: string | null
          updated_at: string
        }
        Insert: {
          author_initials: string
          author_name: string
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          job_id: string
          parent_comment_id?: string | null
          updated_at?: string
        }
        Update: {
          author_initials?: string
          author_name?: string
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          job_id?: string
          parent_comment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_comments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "job_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_cost_items: {
        Row: {
          actual_amount: number | null
          category: Database["public"]["Enums"]["cost_category"]
          created_at: string
          created_by: string | null
          description: string | null
          estimated_amount: number | null
          id: string
          item_date: string | null
          job_id: string
          receipt_url: string | null
          updated_at: string
          updated_by: string | null
          vendor: string | null
        }
        Insert: {
          actual_amount?: number | null
          category?: Database["public"]["Enums"]["cost_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          item_date?: string | null
          job_id: string
          receipt_url?: string | null
          updated_at?: string
          updated_by?: string | null
          vendor?: string | null
        }
        Update: {
          actual_amount?: number | null
          category?: Database["public"]["Enums"]["cost_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          item_date?: string | null
          job_id?: string
          receipt_url?: string | null
          updated_at?: string
          updated_by?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_cost_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_financial_summary: {
        Row: {
          actual_costs: number | null
          actual_margin: number | null
          actual_profit: number | null
          actual_revenue: number | null
          approved_commissions: number | null
          collected_amount: number | null
          cost_items_count: number | null
          cost_items_with_actuals: number | null
          cost_variance: number | null
          cost_variance_pct: number | null
          draft_commissions: number | null
          estimated_costs: number | null
          estimated_margin: number | null
          estimated_profit: number | null
          estimated_revenue: number | null
          job_id: string
          last_calculated_at: string | null
          paid_commissions: number | null
          revenue_items_count: number | null
          revenue_items_with_actuals: number | null
          total_commissions: number | null
          updated_at: string | null
        }
        Insert: {
          actual_costs?: number | null
          actual_margin?: number | null
          actual_profit?: number | null
          actual_revenue?: number | null
          approved_commissions?: number | null
          collected_amount?: number | null
          cost_items_count?: number | null
          cost_items_with_actuals?: number | null
          cost_variance?: number | null
          cost_variance_pct?: number | null
          draft_commissions?: number | null
          estimated_costs?: number | null
          estimated_margin?: number | null
          estimated_profit?: number | null
          estimated_revenue?: number | null
          job_id: string
          last_calculated_at?: string | null
          paid_commissions?: number | null
          revenue_items_count?: number | null
          revenue_items_with_actuals?: number | null
          total_commissions?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_costs?: number | null
          actual_margin?: number | null
          actual_profit?: number | null
          actual_revenue?: number | null
          approved_commissions?: number | null
          collected_amount?: number | null
          cost_items_count?: number | null
          cost_items_with_actuals?: number | null
          cost_variance?: number | null
          cost_variance_pct?: number | null
          draft_commissions?: number | null
          estimated_costs?: number | null
          estimated_margin?: number | null
          estimated_profit?: number | null
          estimated_revenue?: number | null
          job_id?: string
          last_calculated_at?: string | null
          paid_commissions?: number | null
          revenue_items_count?: number | null
          revenue_items_with_actuals?: number | null
          total_commissions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_financial_summary_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_revenue_items: {
        Row: {
          actual_amount: number | null
          attachment_url: string | null
          category: Database["public"]["Enums"]["revenue_category"]
          created_at: string
          created_by: string | null
          description: string | null
          estimated_amount: number | null
          id: string
          item_date: string | null
          job_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_amount?: number | null
          attachment_url?: string | null
          category?: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          item_date?: string | null
          job_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_amount?: number | null
          attachment_url?: string | null
          category?: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          item_date?: string | null
          job_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_revenue_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tasks: {
        Row: {
          assignee: string | null
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          job_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          job_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          job_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string
          assignee_initials: string
          assignee_name: string
          comment_count: number
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          last_activity_at: string | null
          last_comment_at: string | null
          last_comment_snippet: string | null
          owner_user_id: string | null
          priority: string | null
          proposal_status: string | null
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          address: string
          assignee_initials: string
          assignee_name: string
          comment_count?: number
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          last_activity_at?: string | null
          last_comment_at?: string | null
          last_comment_snippet?: string | null
          owner_user_id?: string | null
          priority?: string | null
          proposal_status?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          address?: string
          assignee_initials?: string
          assignee_name?: string
          comment_count?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          last_activity_at?: string | null
          last_comment_at?: string | null
          last_comment_snippet?: string | null
          owner_user_id?: string | null
          priority?: string | null
          proposal_status?: string | null
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      payout_batches: {
        Row: {
          batch_number: number
          created_at: string
          description: string | null
          entry_ids: string[]
          exported_at: string | null
          exported_by: string | null
          exported_format: string | null
          id: string
          total_amount: number
        }
        Insert: {
          batch_number?: number
          created_at?: string
          description?: string | null
          entry_ids: string[]
          exported_at?: string | null
          exported_by?: string | null
          exported_format?: string | null
          id?: string
          total_amount: number
        }
        Update: {
          batch_number?: number
          created_at?: string
          description?: string | null
          entry_ids?: string[]
          exported_at?: string | null
          exported_by?: string | null
          exported_format?: string | null
          id?: string
          total_amount?: number
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
      user_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          invited_by_email: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_by_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_by_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assigned_crew: string | null
          completed_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          job_id: string | null
          notes: string | null
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_crew?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_crew?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_job_id_fkey"
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
      calculate_job_financials: {
        Args: { p_job_id: string }
        Returns: {
          actual_costs: number | null
          actual_margin: number | null
          actual_profit: number | null
          actual_revenue: number | null
          approved_commissions: number | null
          collected_amount: number | null
          cost_items_count: number | null
          cost_items_with_actuals: number | null
          cost_variance: number | null
          cost_variance_pct: number | null
          draft_commissions: number | null
          estimated_costs: number | null
          estimated_margin: number | null
          estimated_profit: number | null
          estimated_revenue: number | null
          job_id: string
          last_calculated_at: string | null
          paid_commissions: number | null
          revenue_items_count: number | null
          revenue_items_with_actuals: number | null
          total_commissions: number | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "job_financial_summary"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "comment_created"
        | "status_changed"
        | "assigned_changed"
        | "job_created"
        | "task_completed"
        | "proposal_created"
        | "proposal_sent"
        | "proposal_signed"
      app_role: "admin" | "manager" | "member"
      commission_calc_type:
        | "percentage_of_revenue"
        | "percentage_of_collected"
        | "percentage_of_profit"
        | "flat_amount"
        | "tiered_percentage"
      commission_event_type:
        | "created"
        | "recalculated"
        | "status_changed"
        | "amount_overridden"
        | "voided"
        | "paid"
        | "clawback_created"
      commission_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "payable"
        | "paid"
        | "voided"
      cost_category:
        | "materials_shingles"
        | "materials_underlayment"
        | "materials_flashing"
        | "materials_other"
        | "labor_crew"
        | "labor_repair"
        | "subcontractor"
        | "dump_haul"
        | "permits"
        | "equipment_rental"
        | "commission"
        | "warranty_reserve"
        | "overhead_allocation"
        | "other_expense"
      revenue_category:
        | "contract"
        | "change_order"
        | "supplement"
        | "upgrade"
        | "discount"
        | "refund"
        | "sales_tax"
        | "other_revenue"
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
    Enums: {
      activity_type: [
        "comment_created",
        "status_changed",
        "assigned_changed",
        "job_created",
        "task_completed",
        "proposal_created",
        "proposal_sent",
        "proposal_signed",
      ],
      app_role: ["admin", "manager", "member"],
      commission_calc_type: [
        "percentage_of_revenue",
        "percentage_of_collected",
        "percentage_of_profit",
        "flat_amount",
        "tiered_percentage",
      ],
      commission_event_type: [
        "created",
        "recalculated",
        "status_changed",
        "amount_overridden",
        "voided",
        "paid",
        "clawback_created",
      ],
      commission_status: [
        "draft",
        "pending_approval",
        "approved",
        "payable",
        "paid",
        "voided",
      ],
      cost_category: [
        "materials_shingles",
        "materials_underlayment",
        "materials_flashing",
        "materials_other",
        "labor_crew",
        "labor_repair",
        "subcontractor",
        "dump_haul",
        "permits",
        "equipment_rental",
        "commission",
        "warranty_reserve",
        "overhead_allocation",
        "other_expense",
      ],
      revenue_category: [
        "contract",
        "change_order",
        "supplement",
        "upgrade",
        "discount",
        "refund",
        "sales_tax",
        "other_revenue",
      ],
    },
  },
} as const
