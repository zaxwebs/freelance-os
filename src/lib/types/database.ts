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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contract_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          billing_address: string | null
          color: string
          company: string | null
          created_at: string
          default_currency_code: string
          email: string | null
          id: string
          name: string
          tax_id: string | null
          tax_id_label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          color?: string
          company?: string | null
          created_at?: string
          default_currency_code?: string
          email?: string | null
          id?: string
          name: string
          tax_id?: string | null
          tax_id_label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          color?: string
          company?: string | null
          created_at?: string
          default_currency_code?: string
          email?: string | null
          id?: string
          name?: string
          tax_id?: string | null
          tax_id_label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_exchange_rates: {
        Row: {
          base_currency_code: string
          created_at: string
          id: string
          quote_currency_code: string
          rate: number
          rate_date: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency_code?: string
          created_at?: string
          id?: string
          quote_currency_code: string
          rate: number
          rate_date: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency_code?: string
          created_at?: string
          id?: string
          quote_currency_code?: string
          rate?: number
          rate_date?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_expenses: {
        Row: {
          amount: number
          base_amount: number
          base_currency_code: string
          billable: boolean
          category: string
          client_id: string | null
          created_at: string
          currency_code: string
          description: string
          exchange_rate: number
          expense_date: string
          id: string
          invoice_id: string | null
          notes: string | null
          project_id: string | null
          receipt_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          base_amount: number
          base_currency_code: string
          billable?: boolean
          category?: string
          client_id?: string | null
          created_at?: string
          currency_code: string
          description: string
          exchange_rate?: number
          expense_date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          project_id?: string | null
          receipt_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          base_currency_code?: string
          billable?: boolean
          category?: string
          client_id?: string | null
          created_at?: string
          currency_code?: string
          description?: string
          exchange_rate?: number
          expense_date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          project_id?: string | null
          receipt_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_settings: {
        Row: {
          base_currency_code: string
          created_at: string
          display_currency_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency_code?: string
          created_at?: string
          display_currency_code?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency_code?: string
          created_at?: string
          display_currency_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_invoice_settings: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          created_at: string
          default_payment_instructions: string | null
          default_payment_terms_days: number
          footer_note: string | null
          legal_name: string | null
          logo_path: string | null
          tax_id: string | null
          tax_id_label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          default_payment_instructions?: string | null
          default_payment_terms_days?: number
          footer_note?: string | null
          legal_name?: string | null
          logo_path?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          default_payment_instructions?: string | null
          default_payment_terms_days?: number
          footer_note?: string | null
          legal_name?: string | null
          logo_path?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          base_amount: number
          base_currency_code: string
          client_id: string | null
          created_at: string
          currency_code: string
          description: string
          exchange_rate: number
          exchange_rate_date: string
          exchange_rate_source: string
          id: string
          notes: string | null
          project_id: string | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          base_amount: number
          base_currency_code: string
          client_id?: string | null
          created_at?: string
          currency_code: string
          description: string
          exchange_rate?: number
          exchange_rate_date?: string
          exchange_rate_source?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          base_currency_code?: string
          client_id?: string | null
          created_at?: string
          currency_code?: string
          description?: string
          exchange_rate?: number
          exchange_rate_date?: string
          exchange_rate_source?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          amount: number
          base_amount: number
          base_currency_code: string
          created_at: string
          exchange_rate_date: string
          exchange_rate_to_usd: number
          description: string
          id: string
          invoice_id: string
          position: number
          project_id: string | null
          quantity: number
          source_expense_id: string | null
          tax_rate: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          position?: number
          project_id?: string | null
          quantity?: number
          source_expense_id?: string | null
          tax_rate?: number
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          project_id?: string | null
          quantity?: number
          source_expense_id?: string | null
          tax_rate?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_source_expense_id_fkey"
            columns: ["source_expense_id"]
            isOneToOne: false
            referencedRelation: "finance_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          base_amount: number
          base_currency_code: string
          created_at: string
          exchange_rate_date: string
          exchange_rate_to_usd: number
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_date: string
          reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          base_amount?: number
          base_currency_code?: string
          created_at?: string
          exchange_rate_date?: string
          exchange_rate_to_usd?: number
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          base_currency_code?: string
          created_at?: string
          exchange_rate_date?: string
          exchange_rate_to_usd?: number
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          base_amount_paid: number
          base_currency_code: string
          base_discount_total: number
          base_subtotal: number
          base_tax_total: number
          base_total: number
          client_id: string
          created_at: string
          currency_code: string
          discount_total: number
          due_date: string
          exchange_rate_date: string
          exchange_rate_to_usd: number
          id: string
          invoice_number: string
          issue_date: string
          issuer_snapshot: Json
          client_snapshot: Json
          notes: string | null
          paid_at: string | null
          payment_instructions: string | null
          project_id: string | null
          sent_at: string | null
          snapshot_at: string | null
          status: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          base_amount_paid?: number
          base_currency_code?: string
          base_discount_total?: number
          base_subtotal?: number
          base_tax_total?: number
          base_total?: number
          client_id: string
          created_at?: string
          currency_code: string
          discount_total?: number
          due_date?: string
          exchange_rate_date?: string
          exchange_rate_to_usd?: number
          id?: string
          invoice_number: string
          issue_date?: string
          issuer_snapshot?: Json
          client_snapshot?: Json
          notes?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          project_id?: string | null
          sent_at?: string | null
          snapshot_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          base_amount_paid?: number
          base_currency_code?: string
          base_discount_total?: number
          base_subtotal?: number
          base_tax_total?: number
          base_total?: number
          client_id?: string
          created_at?: string
          currency_code?: string
          discount_total?: number
          due_date?: string
          exchange_rate_date?: string
          exchange_rate_to_usd?: number
          id?: string
          invoice_number?: string
          issue_date?: string
          issuer_snapshot?: Json
          client_snapshot?: Json
          notes?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          project_id?: string | null
          sent_at?: string | null
          snapshot_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          billing_currency_code: string | null
          client_id: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_currency_code?: string | null
          client_id?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_currency_code?: string | null
          client_id?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          position: number
          proposal_id: string
          quantity: number
          tax_rate: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          position?: number
          proposal_id: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          position?: number
          proposal_id?: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_line_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          client_id: string
          converted_at: string | null
          created_at: string
          currency_code: string
          declined_at: string | null
          id: string
          issue_date: string
          notes: string | null
          overview: string | null
          payment_terms: string | null
          proposal_number: string
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          timeline: string | null
          title: string
          total: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          converted_at?: string | null
          created_at?: string
          currency_code: string
          declined_at?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          overview?: string | null
          payment_terms?: string | null
          proposal_number: string
          scope?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          timeline?: string | null
          title: string
          total?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          converted_at?: string | null
          created_at?: string
          currency_code?: string
          declined_at?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          overview?: string | null
          payment_terms?: string | null
          proposal_number?: string
          scope?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          timeline?: string | null
          title?: string
          total?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
