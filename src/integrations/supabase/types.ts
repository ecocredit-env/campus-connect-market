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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      interest_requests: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          initial_message: string | null
          listing_id: string
          responded_at: string | null
          response_message: string | null
          seller_id: string
          status: Database["public"]["Enums"]["interest_status"]
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          initial_message?: string | null
          listing_id: string
          responded_at?: string | null
          response_message?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["interest_status"]
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          initial_message?: string | null
          listing_id?: string
          responded_at?: string | null
          response_message?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["interest_status"]
        }
        Relationships: [
          {
            foreignKeyName: "interest_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at: string
          delivery_charge_note: string | null
          delivery_fee: number | null
          delivery_option: string
          description: string
          expires_at: string
          id: string
          location: string | null
          manufacturing_year: number | null
          model: string | null
          original_price: number | null
          photos: string[]
          price: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          subcategory: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          delivery_charge_note?: string | null
          delivery_fee?: number | null
          delivery_option?: string
          description: string
          expires_at?: string
          id?: string
          location?: string | null
          manufacturing_year?: number | null
          model?: string | null
          original_price?: number | null
          photos?: string[]
          price: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          condition?: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          delivery_charge_note?: string | null
          delivery_fee?: number | null
          delivery_option?: string
          description?: string
          expires_at?: string
          id?: string
          location?: string | null
          manufacturing_year?: number | null
          model?: string | null
          original_price?: number | null
          photos?: string[]
          price?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid: number
          buyer_contact_email: string | null
          buyer_contact_phone: string | null
          buyer_id: string
          commission_amount: number
          created_at: string
          currency: string
          delivery_address: string | null
          id: string
          listing_id: string
          payout_note: string | null
          payout_status: string
          seller_id: string
          seller_payout_amount: number
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid: number
          buyer_contact_email?: string | null
          buyer_contact_phone?: string | null
          buyer_id: string
          commission_amount?: number
          created_at?: string
          currency?: string
          delivery_address?: string | null
          id?: string
          listing_id: string
          payout_note?: string | null
          payout_status?: string
          seller_id: string
          seller_payout_amount: number
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          buyer_contact_email?: string | null
          buyer_contact_phone?: string | null
          buyer_id?: string
          commission_amount?: number
          created_at?: string
          currency?: string
          delivery_address?: string | null
          id?: string
          listing_id?: string
          payout_note?: string | null
          payout_status?: string
          seller_id?: string
          seller_payout_amount?: number
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          average_rating: number | null
          bio: string | null
          college_email: string | null
          created_at: string
          department: string | null
          full_name: string
          id: string
          id_document_path: string | null
          payout_account_holder: string | null
          payout_account_number: string | null
          payout_bank_name: string | null
          payout_ifsc: string | null
          payout_upi_id: string | null
          phone: string | null
          profile_photo: string | null
          registration_number: string | null
          total_transactions: number
          updated_at: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          year_of_study: string | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          college_email?: string | null
          created_at?: string
          department?: string | null
          full_name: string
          id: string
          id_document_path?: string | null
          payout_account_holder?: string | null
          payout_account_number?: string | null
          payout_bank_name?: string | null
          payout_ifsc?: string | null
          payout_upi_id?: string | null
          phone?: string | null
          profile_photo?: string | null
          registration_number?: string | null
          total_transactions?: number
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          year_of_study?: string | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          college_email?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          id_document_path?: string | null
          payout_account_holder?: string | null
          payout_account_number?: string | null
          payout_bank_name?: string | null
          payout_ifsc?: string | null
          payout_upi_id?: string | null
          phone?: string | null
          profile_photo?: string | null
          registration_number?: string | null
          total_transactions?: number
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          buyer_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          order_id: string
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          buyer_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          order_id: string
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          buyer_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          order_id?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      public_profiles: {
        Row: {
          average_rating: number | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          profile_photo: string | null
          total_transactions: number | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          profile_photo?: string | null
          total_transactions?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          profile_photo?: string | null
          total_transactions?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_counterparty_contact: {
        Args: { _other_user: string }
        Returns: {
          college_email: string
          full_name: string
          id: string
          phone: string
        }[]
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
      app_role: "admin" | "moderator" | "user"
      interest_status: "pending" | "approved" | "rejected" | "blocked"
      listing_category: "cycles" | "coolers" | "electronics"
      listing_condition: "new" | "like_new" | "good" | "fair" | "poor"
      listing_status: "active" | "sold" | "archived" | "pending_review"
      verification_status: "pending" | "approved" | "rejected" | "suspended"
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
      app_role: ["admin", "moderator", "user"],
      interest_status: ["pending", "approved", "rejected", "blocked"],
      listing_category: ["cycles", "coolers", "electronics"],
      listing_condition: ["new", "like_new", "good", "fair", "poor"],
      listing_status: ["active", "sold", "archived", "pending_review"],
      verification_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
