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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          callback_requested: boolean
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          project_type: string | null
        }
        Insert: {
          callback_requested?: boolean
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          project_type?: string | null
        }
        Update: {
          callback_requested?: boolean
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          project_type?: string | null
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          name: string
          rate_to_usd: number
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          name: string
          rate_to_usd?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          name?: string
          rate_to_usd?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          company: string | null
          created_at: string
          currency: string
          email: string
          full_name: string
          id: string
          installments: Json
          invoice_number: string
          notes: string | null
          others_amount: number
          payment_method: string
          payment_plan: string
          phone: string | null
          quote_id: string | null
          services: Json
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          currency?: string
          email: string
          full_name: string
          id?: string
          installments?: Json
          invoice_number: string
          notes?: string | null
          others_amount?: number
          payment_method?: string
          payment_plan?: string
          phone?: string | null
          quote_id?: string | null
          services?: Json
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          currency?: string
          email?: string
          full_name?: string
          id?: string
          installments?: Json
          invoice_number?: string
          notes?: string | null
          others_amount?: number
          payment_method?: string
          payment_plan?: string
          phone?: string | null
          quote_id?: string | null
          services?: Json
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          additional_notes: string | null
          company: string | null
          created_at: string
          currency: string
          email: string
          estimated_price: number | null
          full_name: string
          id: string
          phone: string | null
          project_classification: string
          project_type: string
          requirement_period: string | null
          selected_services: string[]
          status: string
          timeline: string
        }
        Insert: {
          additional_notes?: string | null
          company?: string | null
          created_at?: string
          currency?: string
          email: string
          estimated_price?: number | null
          full_name: string
          id?: string
          phone?: string | null
          project_classification: string
          project_type: string
          requirement_period?: string | null
          selected_services?: string[]
          status?: string
          timeline: string
        }
        Update: {
          additional_notes?: string | null
          company?: string | null
          created_at?: string
          currency?: string
          email?: string
          estimated_price?: number | null
          full_name?: string
          id?: string
          phone?: string | null
          project_classification?: string
          project_type?: string
          requirement_period?: string | null
          selected_services?: string[]
          status?: string
          timeline?: string
        }
        Relationships: []
      }
      quote_template: {
        Row: {
          acceptance_text: string
          company_address: string
          company_name: string
          company_phone_1: string
          company_phone_2: string
          company_website: string
          default_currency: string
          id: string
          others_amount: number
          others_label: string
          supported_currencies: string[]
          tax_label: string
          tax_percentage: number
          terms_conditions: string[]
          updated_at: string
          validity_days: number
        }
        Insert: {
          acceptance_text?: string
          company_address?: string
          company_name?: string
          company_phone_1?: string
          company_phone_2?: string
          company_website?: string
          default_currency?: string
          id?: string
          others_amount?: number
          others_label?: string
          supported_currencies?: string[]
          tax_label?: string
          tax_percentage?: number
          terms_conditions?: string[]
          updated_at?: string
          validity_days?: number
        }
        Update: {
          acceptance_text?: string
          company_address?: string
          company_name?: string
          company_phone_1?: string
          company_phone_2?: string
          company_website?: string
          default_currency?: string
          id?: string
          others_amount?: number
          others_label?: string
          supported_currencies?: string[]
          tax_label?: string
          tax_percentage?: number
          terms_conditions?: string[]
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      service_pricing: {
        Row: {
          base_price: number
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          price_per_unit: string | null
          service_category: string
          service_name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price_per_unit?: string | null
          service_category?: string
          service_name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price_per_unit?: string | null
          service_category?: string
          service_name?: string
          updated_at?: string
        }
        Relationships: []
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
