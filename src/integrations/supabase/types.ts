export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_learning_data: {
        Row: {
          audio_recording_id: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          data_type: string
          difficulty_level: string | null
          id: string
          is_verified: boolean | null
          language_pair: string | null
          learning_category: string | null
          message_id: string | null
          metadata: Json | null
          quality_score: number | null
          updated_at: string | null
          usage_context: string | null
          verified_by: string | null
        }
        Insert: {
          audio_recording_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          data_type: string
          difficulty_level?: string | null
          id?: string
          is_verified?: boolean | null
          language_pair?: string | null
          learning_category?: string | null
          message_id?: string | null
          metadata?: Json | null
          quality_score?: number | null
          updated_at?: string | null
          usage_context?: string | null
          verified_by?: string | null
        }
        Update: {
          audio_recording_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          data_type?: string
          difficulty_level?: string | null
          id?: string
          is_verified?: boolean | null
          language_pair?: string | null
          learning_category?: string | null
          message_id?: string | null
          metadata?: Json | null
          quality_score?: number | null
          updated_at?: string | null
          usage_context?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_data_audio_recording_id_fkey"
            columns: ["audio_recording_id"]
            isOneToOne: false
            referencedRelation: "audio_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_data_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_data_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_stories: {
        Row: {
          approved_at: string
          contribution_id: string
          contributor_id: string
          created_at: string
          cultural_context: string | null
          english_translation: string
          goji_text: string
          hausa_translation: string | null
          id: string
          title: string
        }
        Insert: {
          approved_at?: string
          contribution_id: string
          contributor_id: string
          created_at?: string
          cultural_context?: string | null
          english_translation: string
          goji_text: string
          hausa_translation?: string | null
          id?: string
          title: string
        }
        Update: {
          approved_at?: string
          contribution_id?: string
          contributor_id?: string
          created_at?: string
          cultural_context?: string | null
          english_translation?: string
          goji_text?: string
          hausa_translation?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "approved_stories_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_recordings: {
        Row: {
          ai_analysis: Json | null
          audio_format: string | null
          audio_quality_score: number | null
          conversation_id: string | null
          created_at: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          language_detected: string | null
          message_id: string | null
          noise_level: number | null
          processing_status: string | null
          pronunciation_score: number | null
          transcription: string | null
          transcription_confidence: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          audio_format?: string | null
          audio_quality_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          language_detected?: string | null
          message_id?: string | null
          noise_level?: number | null
          processing_status?: string | null
          pronunciation_score?: number | null
          transcription?: string | null
          transcription_confidence?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          audio_format?: string | null
          audio_quality_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          language_detected?: string | null
          message_id?: string | null
          noise_level?: number | null
          processing_status?: string | null
          pronunciation_score?: number | null
          transcription?: string | null
          transcription_confidence?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_recordings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_recordings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          equipment: string
          first_name: string
          id: string
          ip_address: unknown | null
          last_name: string
          message: string
          organization: string
          phone: string
          status: string | null
          updated_at: string | null
          user_agent: string | null
          webhook_sent: boolean | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          equipment: string
          first_name: string
          id?: string
          ip_address?: unknown | null
          last_name: string
          message: string
          organization: string
          phone: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          webhook_sent?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          equipment?: string
          first_name?: string
          id?: string
          ip_address?: unknown | null
          last_name?: string
          message?: string
          organization?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          webhook_sent?: boolean | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      contribution_votes: {
        Row: {
          contribution_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          contribution_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          contribution_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_votes_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          created_at: string
          cultural_context: string | null
          english_translation: string
          example_sentence: string | null
          goji_text: string
          hausa_translation: string | null
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
          votes_against: number
          votes_for: number
        }
        Insert: {
          created_at?: string
          cultural_context?: string | null
          english_translation: string
          example_sentence?: string | null
          goji_text: string
          hausa_translation?: string | null
          id?: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
          votes_against?: number
          votes_for?: number
        }
        Update: {
          created_at?: string
          cultural_context?: string | null
          english_translation?: string
          example_sentence?: string | null
          goji_text?: string
          hausa_translation?: string | null
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          conversation_type: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          language_focus: string | null
          message_count: number | null
          metadata: Json | null
          participant_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          language_focus?: string | null
          message_count?: number | null
          metadata?: Json | null
          participant_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          conversation_type?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          language_focus?: string | null
          message_count?: number | null
          metadata?: Json | null
          participant_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dictionary_entries: {
        Row: {
          approved_at: string
          contribution_id: string
          contributor_id: string
          created_at: string
          cultural_context: string | null
          english_translation: string
          example_sentence: string | null
          goji_word: string
          hausa_translation: string | null
          id: string
        }
        Insert: {
          approved_at?: string
          contribution_id: string
          contributor_id: string
          created_at?: string
          cultural_context?: string | null
          english_translation: string
          example_sentence?: string | null
          goji_word: string
          hausa_translation?: string | null
          id?: string
        }
        Update: {
          approved_at?: string
          contribution_id?: string
          contributor_id?: string
          created_at?: string
          cultural_context?: string | null
          english_translation?: string
          example_sentence?: string | null
          goji_word?: string
          hausa_translation?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dictionary_entries_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audio_url: string | null
          conversation_id: string | null
          created_at: string
          id: string
          tags: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          tags?: string | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          tags?: string | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          availability: string
          brand: string
          category: string
          condition: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          availability?: string
          brand: string
          category: string
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          availability?: string
          brand?: string
          category?: string
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          full_name: string | null
          id: string
          points: number
          role: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          points?: number
          role?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          points?: number
          role?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_contribution: {
        Args: { contribution_id: string }
        Returns: undefined
      }
      get_weather_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
