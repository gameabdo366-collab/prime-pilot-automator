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
      accounts: {
        Row: {
          created_at: string
          email: string
          id: string
          last_execution: string | null
          notes: string
          password_encrypted: string
          prime_expiration: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_execution?: string | null
          notes?: string
          password_encrypted?: string
          prime_expiration?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_execution?: string | null
          notes?: string
          password_encrypted?: string
          prime_expiration?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      activation_codes: {
        Row: {
          activated_at: string | null
          card_id: string | null
          code: string
          created_at: string
          customer_email: string
          customer_password_encrypted: string
          driver: string
          expires_at: string | null
          id: string
          notes: string
          renewal_date: string | null
          session_token: string | null
          status: Database["public"]["Enums"]["activation_status"]
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          card_id?: string | null
          code: string
          created_at?: string
          customer_email?: string
          customer_password_encrypted?: string
          driver?: string
          expires_at?: string | null
          id?: string
          notes?: string
          renewal_date?: string | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["activation_status"]
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          activated_at?: string | null
          card_id?: string | null
          code?: string
          created_at?: string
          customer_email?: string
          customer_password_encrypted?: string
          driver?: string
          expires_at?: string | null
          id?: string
          notes?: string
          renewal_date?: string | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["activation_status"]
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activation_codes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          alias: string
          card_last4: string
          card_number_encrypted: string
          created_at: string
          cvv_encrypted: string
          expires_at: string | null
          expiry: string
          id: string
          notes: string
          status: Database["public"]["Enums"]["card_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          alias: string
          card_last4?: string
          card_number_encrypted?: string
          created_at?: string
          cvv_encrypted?: string
          expires_at?: string | null
          expiry?: string
          id?: string
          notes?: string
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          alias?: string
          card_last4?: string
          card_number_encrypted?: string
          created_at?: string
          cvv_encrypted?: string
          expires_at?: string | null
          expiry?: string
          id?: string
          notes?: string
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
          task_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      screenshots: {
        Row: {
          created_at: string
          id: string
          image: string
          step: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          step?: string
          task_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          step?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screenshots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          headless_mode: boolean
          retries: number
          runner_token: string
          runner_url: string
          timeout_seconds: number
          updated_at: string
          user_id: string
          visible_browser: boolean
        }
        Insert: {
          headless_mode?: boolean
          retries?: number
          runner_token?: string
          runner_url?: string
          timeout_seconds?: number
          updated_at?: string
          user_id?: string
          visible_browser?: boolean
        }
        Update: {
          headless_mode?: boolean
          retries?: number
          runner_token?: string
          runner_url?: string
          timeout_seconds?: number
          updated_at?: string
          user_id?: string
          visible_browser?: boolean
        }
        Relationships: []
      }
      tasks: {
        Row: {
          account_id: string | null
          card_id: string | null
          created_at: string
          finished_at: string | null
          id: string
          notes: string
          priority: Database["public"]["Enums"]["task_priority"]
          progress: number
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
          workflow: string
        }
        Insert: {
          account_id?: string | null
          card_id?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          notes?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
          workflow: string
        }
        Update: {
          account_id?: string | null
          card_id?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          notes?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
          workflow?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
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
      account_status: "Active" | "Inactive" | "Expired" | "Unknown"
      activation_status:
        | "Unused"
        | "Reserved"
        | "Running"
        | "Activated"
        | "Expired"
        | "Cancelled"
      card_status: "Available" | "Running" | "Consumed" | "Expired" | "Failed"
      log_level: "debug" | "info" | "warn" | "error"
      task_priority: "Low" | "Normal" | "High" | "Urgent"
      task_status:
        | "Pending"
        | "Running"
        | "Paused"
        | "Completed"
        | "Failed"
        | "Cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["Active", "Inactive", "Expired", "Unknown"],
      activation_status: [
        "Unused",
        "Reserved",
        "Running",
        "Activated",
        "Expired",
        "Cancelled",
      ],
      card_status: ["Available", "Running", "Consumed", "Expired", "Failed"],
      log_level: ["debug", "info", "warn", "error"],
      task_priority: ["Low", "Normal", "High", "Urgent"],
      task_status: [
        "Pending",
        "Running",
        "Paused",
        "Completed",
        "Failed",
        "Cancelled",
      ],
    },
  },
} as const
