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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          vault_base_path: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          vault_base_path: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          vault_base_path?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          client_ip: string | null
          details: string | null
          id: string
          resource_id: string | null
          resource_type: string | null
          success: boolean
          target_details: Json | null
          timestamp: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_ip?: string | null
          details?: string | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean
          target_details?: Json | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_ip?: string | null
          details?: string | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean
          target_details?: Json | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      environments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          vault_address: string
          vault_auth_type: string
          vault_password: string | null
          vault_token_ttl: number | null
          vault_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          vault_address: string
          vault_auth_type: string
          vault_password?: string | null
          vault_token_ttl?: number | null
          vault_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          vault_address?: string
          vault_auth_type?: string
          vault_password?: string | null
          vault_token_ttl?: number | null
          vault_user_id?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      locked_secret_keys: {
        Row: {
          application_id: string
          created_at: string | null
          environment_id: string
          id: string
          namespace_name: string
          secret_key: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          environment_id: string
          id?: string
          namespace_name: string
          secret_key: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          environment_id?: string
          id?: string
          namespace_name?: string
          secret_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "locked_secret_keys_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      namespaces: {
        Row: {
          created_at: string | null
          environment_id: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          environment_id: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          environment_id?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "namespaces_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_add_apps: boolean
          can_delete_secrets: boolean
          can_edit_secrets: boolean
          can_manage_access: boolean
          can_manage_envs: boolean
          can_manage_locks: boolean
          can_view_secrets: boolean
          created_at: string | null
          environment_id: string | null
          group_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          can_add_apps?: boolean
          can_delete_secrets?: boolean
          can_edit_secrets?: boolean
          can_manage_access?: boolean
          can_manage_envs?: boolean
          can_manage_locks?: boolean
          can_view_secrets?: boolean
          created_at?: string | null
          environment_id?: string | null
          group_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          can_add_apps?: boolean
          can_delete_secrets?: boolean
          can_edit_secrets?: boolean
          can_manage_access?: boolean
          can_manage_envs?: boolean
          can_manage_locks?: boolean
          can_view_secrets?: boolean
          created_at?: string | null
          environment_id?: string | null
          group_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string | null
          group_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          oidc_subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          oidc_subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          oidc_subject?: string | null
          updated_at?: string | null
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
