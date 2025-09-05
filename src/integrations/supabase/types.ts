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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          experiment_id: string | null
          id: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          experiment_id?: string | null
          id?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          experiment_id?: string | null
          id?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_learning_data: {
        Row: {
          audio_recording_id: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          data_type: string
          difficulty_level: string | null
          embedding: string | null
          id: string
          is_verified: boolean | null
          language_pair: string | null
          learning_category: string | null
          learning_effectiveness_score: number | null
          message_id: string | null
          metadata: Json | null
          pronunciation_analysis: Json | null
          quality_score: number | null
          semantic_tags: string[] | null
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
          embedding?: string | null
          id?: string
          is_verified?: boolean | null
          language_pair?: string | null
          learning_category?: string | null
          learning_effectiveness_score?: number | null
          message_id?: string | null
          metadata?: Json | null
          pronunciation_analysis?: Json | null
          quality_score?: number | null
          semantic_tags?: string[] | null
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
          embedding?: string | null
          id?: string
          is_verified?: boolean | null
          language_pair?: string | null
          learning_category?: string | null
          learning_effectiveness_score?: number | null
          message_id?: string | null
          metadata?: Json | null
          pronunciation_analysis?: Json | null
          quality_score?: number | null
          semantic_tags?: string[] | null
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
      baseline_results: {
        Row: {
          avg_reward_algorithm: number
          avg_reward_baseline: number
          baseline_name: string
          cooperation_rate: number
          created_at: string
          experiment_id: string
          games_played: number
          id: string
          vs_algorithm: string
        }
        Insert: {
          avg_reward_algorithm: number
          avg_reward_baseline: number
          baseline_name: string
          cooperation_rate: number
          created_at?: string
          experiment_id: string
          games_played: number
          id?: string
          vs_algorithm: string
        }
        Update: {
          avg_reward_algorithm?: number
          avg_reward_baseline?: number
          baseline_name?: string
          cooperation_rate?: number
          created_at?: string
          experiment_id?: string
          games_played?: number
          id?: string
          vs_algorithm?: string
        }
        Relationships: [
          {
            foreignKeyName: "baseline_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          author_email: string | null
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          metadata: Json | null
          published: boolean
          published_at: string | null
          read_time: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author: string
          author_email?: string | null
          category: string
          content: string
          created_at?: string
          excerpt: string
          featured?: boolean
          id?: string
          metadata?: Json | null
          published?: boolean
          published_at?: string | null
          read_time?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author?: string
          author_email?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          metadata?: Json | null
          published?: boolean
          published_at?: string | null
          read_time?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      competition_submissions: {
        Row: {
          algorithm_details: Json
          code_repository: string | null
          competition_id: string
          description: string
          id: string
          paper_url: string | null
          ranking: number | null
          score: number | null
          status: string
          submitted_at: string
          title: string
          user_id: string
        }
        Insert: {
          algorithm_details: Json
          code_repository?: string | null
          competition_id: string
          description: string
          id?: string
          paper_url?: string | null
          ranking?: number | null
          score?: number | null
          status?: string
          submitted_at?: string
          title: string
          user_id: string
        }
        Update: {
          algorithm_details?: Json
          code_repository?: string | null
          competition_id?: string
          description?: string
          id?: string
          paper_url?: string | null
          ranking?: number | null
          score?: number | null
          status?: string
          submitted_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_submissions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          competition_type: string
          created_at: string
          description: string
          end_date: string
          evaluation_criteria: Json | null
          id: string
          organizer_id: string | null
          prizes: Json | null
          rules: string | null
          start_date: string
          status: string
          submission_deadline: string
          title: string
          updated_at: string
        }
        Insert: {
          competition_type: string
          created_at?: string
          description: string
          end_date: string
          evaluation_criteria?: Json | null
          id?: string
          organizer_id?: string | null
          prizes?: Json | null
          rules?: string | null
          start_date: string
          status?: string
          submission_deadline: string
          title: string
          updated_at?: string
        }
        Update: {
          competition_type?: string
          created_at?: string
          description?: string
          end_date?: string
          evaluation_criteria?: Json | null
          id?: string
          organizer_id?: string | null
          prizes?: Json | null
          rules?: string | null
          start_date?: string
          status?: string
          submission_deadline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      conversation_analytics: {
        Row: {
          ai_feedback: Json | null
          conversation_id: string
          created_at: string | null
          cultural_topics_discussed: string[] | null
          difficulty_progression: number | null
          engagement_score: number | null
          id: string
          learning_objectives_met: string[] | null
          new_words_encountered: string[] | null
          pronunciation_improvements: Json | null
          session_duration_minutes: number | null
          session_summary: string | null
          suggested_focus_areas: string[] | null
          user_id: string
          vocabulary_used: string[] | null
        }
        Insert: {
          ai_feedback?: Json | null
          conversation_id: string
          created_at?: string | null
          cultural_topics_discussed?: string[] | null
          difficulty_progression?: number | null
          engagement_score?: number | null
          id?: string
          learning_objectives_met?: string[] | null
          new_words_encountered?: string[] | null
          pronunciation_improvements?: Json | null
          session_duration_minutes?: number | null
          session_summary?: string | null
          suggested_focus_areas?: string[] | null
          user_id: string
          vocabulary_used?: string[] | null
        }
        Update: {
          ai_feedback?: Json | null
          conversation_id?: string
          created_at?: string | null
          cultural_topics_discussed?: string[] | null
          difficulty_progression?: number | null
          engagement_score?: number | null
          id?: string
          learning_objectives_met?: string[] | null
          new_words_encountered?: string[] | null
          pronunciation_improvements?: Json | null
          session_duration_minutes?: number | null
          session_summary?: string | null
          suggested_focus_areas?: string[] | null
          user_id?: string
          vocabulary_used?: string[] | null
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
      cross_play_results: {
        Row: {
          agent1_config: Json
          agent2_config: Json
          avg_reward_agent1: number
          avg_reward_agent2: number
          cooperation_rate: number
          created_at: string
          experiment_id: string
          games_played: number
          id: string
        }
        Insert: {
          agent1_config: Json
          agent2_config: Json
          avg_reward_agent1: number
          avg_reward_agent2: number
          cooperation_rate: number
          created_at?: string
          experiment_id: string
          games_played: number
          id?: string
        }
        Update: {
          agent1_config?: Json
          agent2_config?: Json
          avg_reward_agent1?: number
          avg_reward_agent2?: number
          cooperation_rate?: number
          created_at?: string
          experiment_id?: string
          games_played?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_play_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_contexts: {
        Row: {
          clan_associations: string[] | null
          context_type: string
          created_at: string | null
          cultural_significance: string | null
          description: string
          difficulty_level: string | null
          embedding: string | null
          english_content: string | null
          geographical_region: string | null
          goji_content: string | null
          hausa_content: string | null
          historical_period: string | null
          id: string
          related_vocabulary: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          clan_associations?: string[] | null
          context_type: string
          created_at?: string | null
          cultural_significance?: string | null
          description: string
          difficulty_level?: string | null
          embedding?: string | null
          english_content?: string | null
          geographical_region?: string | null
          goji_content?: string | null
          hausa_content?: string | null
          historical_period?: string | null
          id?: string
          related_vocabulary?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          clan_associations?: string[] | null
          context_type?: string
          created_at?: string | null
          cultural_significance?: string | null
          description?: string
          difficulty_level?: string | null
          embedding?: string | null
          english_content?: string | null
          geographical_region?: string | null
          goji_content?: string | null
          hausa_content?: string | null
          historical_period?: string | null
          id?: string
          related_vocabulary?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      dictionary_entries: {
        Row: {
          approved_at: string
          audio_quality_score: number | null
          contribution_id: string | null
          contributor_id: string | null
          created_at: string
          cross_references: string[] | null
          cultural_context: string | null
          difficulty_level: string | null
          embedding: string | null
          english_translation: string
          example_sentence: string | null
          goji_word: string
          hausa_translation: string | null
          id: string
          last_updated: string | null
          linguistic_notes: string | null
          literal_translation: string | null
          part_of_speech: string | null
          pronunciation_guide: string | null
          semantic_category: string | null
          tone_marking: string | null
          usage_frequency: number | null
          word_family: string[] | null
        }
        Insert: {
          approved_at?: string
          audio_quality_score?: number | null
          contribution_id?: string | null
          contributor_id?: string | null
          created_at?: string
          cross_references?: string[] | null
          cultural_context?: string | null
          difficulty_level?: string | null
          embedding?: string | null
          english_translation: string
          example_sentence?: string | null
          goji_word: string
          hausa_translation?: string | null
          id?: string
          last_updated?: string | null
          linguistic_notes?: string | null
          literal_translation?: string | null
          part_of_speech?: string | null
          pronunciation_guide?: string | null
          semantic_category?: string | null
          tone_marking?: string | null
          usage_frequency?: number | null
          word_family?: string[] | null
        }
        Update: {
          approved_at?: string
          audio_quality_score?: number | null
          contribution_id?: string | null
          contributor_id?: string | null
          created_at?: string
          cross_references?: string[] | null
          cultural_context?: string | null
          difficulty_level?: string | null
          embedding?: string | null
          english_translation?: string
          example_sentence?: string | null
          goji_word?: string
          hausa_translation?: string | null
          id?: string
          last_updated?: string | null
          linguistic_notes?: string | null
          literal_translation?: string | null
          part_of_speech?: string | null
          pronunciation_guide?: string | null
          semantic_category?: string | null
          tone_marking?: string | null
          usage_frequency?: number | null
          word_family?: string[] | null
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
      dictionary_import_staging: {
        Row: {
          batch_id: string
          category: string | null
          created_at: string | null
          cultural_context: string | null
          difficulty_level: string | null
          english_translation: string | null
          example_sentence: string | null
          goji_word: string
          hausa_translation: string | null
          id: string
          import_status: string | null
          imported_by: string | null
          pronunciation_guide: string | null
          source_document: string | null
          validation_errors: string[] | null
        }
        Insert: {
          batch_id?: string
          category?: string | null
          created_at?: string | null
          cultural_context?: string | null
          difficulty_level?: string | null
          english_translation?: string | null
          example_sentence?: string | null
          goji_word: string
          hausa_translation?: string | null
          id?: string
          import_status?: string | null
          imported_by?: string | null
          pronunciation_guide?: string | null
          source_document?: string | null
          validation_errors?: string[] | null
        }
        Update: {
          batch_id?: string
          category?: string | null
          created_at?: string | null
          cultural_context?: string | null
          difficulty_level?: string | null
          english_translation?: string | null
          example_sentence?: string | null
          goji_word?: string
          hausa_translation?: string | null
          id?: string
          import_status?: string | null
          imported_by?: string | null
          pronunciation_guide?: string | null
          source_document?: string | null
          validation_errors?: string[] | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          availability: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          manufacturer: string
          model: string | null
          name: string
          price_range: string | null
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          availability?: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manufacturer: string
          model?: string | null
          name: string
          price_range?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          availability?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manufacturer?: string
          model?: string | null
          name?: string
          price_range?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      experiment_comments: {
        Row: {
          content: string
          created_at: string
          experiment_id: string
          id: string
          parent_comment_id: string | null
          resolved: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          experiment_id: string
          id?: string
          parent_comment_id?: string | null
          resolved?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          experiment_id?: string
          id?: string
          parent_comment_id?: string | null
          resolved?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "experiment_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_runs: {
        Row: {
          config: Json
          convergence_episode: number | null
          cooperation_history: number[]
          created_at: string
          experiment_id: string
          final_cooperation_rate: number
          id: string
          metrics: Json
          q_values: Json | null
          raw_results: Json
          reward_history: Json
          run_number: number
          seed: number
        }
        Insert: {
          config: Json
          convergence_episode?: number | null
          cooperation_history: number[]
          created_at?: string
          experiment_id: string
          final_cooperation_rate: number
          id?: string
          metrics: Json
          q_values?: Json | null
          raw_results: Json
          reward_history: Json
          run_number: number
          seed: number
        }
        Update: {
          config?: Json
          convergence_episode?: number | null
          cooperation_history?: number[]
          created_at?: string
          experiment_id?: string
          final_cooperation_rate?: number
          id?: string
          metrics?: Json
          q_values?: Json | null
          raw_results?: Json
          reward_history?: Json
          run_number?: number
          seed?: number
        }
        Relationships: [
          {
            foreignKeyName: "experiment_runs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_statistics: {
        Row: {
          confidence_interval_lower: number
          confidence_interval_upper: number
          created_at: string
          effect_size: number | null
          experiment_id: string
          id: string
          mean_value: number
          metric_name: string
          p_value: number | null
          sample_size: number
          std_dev: number
        }
        Insert: {
          confidence_interval_lower: number
          confidence_interval_upper: number
          created_at?: string
          effect_size?: number | null
          experiment_id: string
          id?: string
          mean_value: number
          metric_name: string
          p_value?: number | null
          sample_size: number
          std_dev: number
        }
        Update: {
          confidence_interval_lower?: number
          confidence_interval_upper?: number
          created_at?: string
          effect_size?: number | null
          experiment_id?: string
          id?: string
          mean_value?: number
          metric_name?: string
          p_value?: number | null
          sample_size?: number
          std_dev?: number
        }
        Relationships: [
          {
            foreignKeyName: "experiment_statistics_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          seed: number
          started_at: string | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          seed: number
          started_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          seed?: number
          started_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          id: string
          metric_type: string
          notes: string | null
          recorded_at: string
          unit: string
          user_id: string
          value_1: number
          value_2: number | null
        }
        Insert: {
          id?: string
          metric_type: string
          notes?: string | null
          recorded_at?: string
          unit: string
          user_id: string
          value_1: number
          value_2?: number | null
        }
        Update: {
          id?: string
          metric_type?: string
          notes?: string | null
          recorded_at?: string
          unit?: string
          user_id?: string
          value_1?: number
          value_2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_profiles: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          height_cm: number | null
          id: string
          medical_notes: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string
          medical_notes?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string
          medical_notes?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_orders: {
        Row: {
          budget_range: string | null
          created_at: string
          department: string | null
          equipment_requested: Json
          id: string
          institution_id: string
          justification: string | null
          notes: string | null
          quantity: number
          status: string
          student_email: string
          student_id: string | null
          student_name: string
          student_phone: string
          supervisor_email: string | null
          supervisor_name: string | null
          updated_at: string
          urgency_level: string
          year_of_study: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          department?: string | null
          equipment_requested: Json
          id?: string
          institution_id: string
          justification?: string | null
          notes?: string | null
          quantity?: number
          status?: string
          student_email: string
          student_id?: string | null
          student_name: string
          student_phone: string
          supervisor_email?: string | null
          supervisor_name?: string | null
          updated_at?: string
          urgency_level?: string
          year_of_study?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          department?: string | null
          equipment_requested?: Json
          id?: string
          institution_id?: string
          justification?: string | null
          notes?: string | null
          quantity?: number
          status?: string
          student_email?: string
          student_id?: string | null
          student_name?: string
          student_phone?: string
          supervisor_email?: string | null
          supervisor_name?: string | null
          updated_at?: string
          urgency_level?: string
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_orders_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          state: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          state: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          state?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      learner_profiles: {
        Row: {
          created_at: string | null
          cultural_interests: string[] | null
          id: string
          last_active: string | null
          learning_goals: Json | null
          learning_level: string
          native_language: string | null
          preferred_learning_style: string | null
          progress_data: Json | null
          pronunciation_score_history: number[] | null
          streak_days: number | null
          strengths: string[] | null
          total_study_time_minutes: number | null
          updated_at: string | null
          user_id: string
          vocabulary_mastery_count: number | null
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          cultural_interests?: string[] | null
          id?: string
          last_active?: string | null
          learning_goals?: Json | null
          learning_level?: string
          native_language?: string | null
          preferred_learning_style?: string | null
          progress_data?: Json | null
          pronunciation_score_history?: number[] | null
          streak_days?: number | null
          strengths?: string[] | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id: string
          vocabulary_mastery_count?: number | null
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          cultural_interests?: string[] | null
          id?: string
          last_active?: string | null
          learning_goals?: Json | null
          learning_level?: string
          native_language?: string | null
          preferred_learning_style?: string | null
          progress_data?: Json | null
          pronunciation_score_history?: number[] | null
          streak_days?: number | null
          strengths?: string[] | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          vocabulary_mastery_count?: number | null
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      medication_reminders: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          scheduled_time: string
          status: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_time: string
          status?: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_time?: string
          status?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          start_date: string
          time_slots: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          start_date: string
          time_slots?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          start_date?: string
          time_slots?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      newsletter_subscriptions: {
        Row: {
          categories: string[] | null
          confirmation_token: string | null
          confirmed: boolean
          confirmed_at: string | null
          email: string
          id: string
          metadata: Json | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          categories?: string[] | null
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          categories?: string[] | null
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
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
      shared_experiments: {
        Row: {
          experiment_id: string
          expires_at: string | null
          id: string
          is_live: boolean | null
          permissions: Json | null
          shared_at: string
          shared_by: string
          workspace_id: string | null
        }
        Insert: {
          experiment_id: string
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          permissions?: Json | null
          shared_at?: string
          shared_by: string
          workspace_id?: string | null
        }
        Update: {
          experiment_id?: string
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          permissions?: Json | null
          shared_at?: string
          shared_by?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_experiments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          activity_context: string | null
          created_at: string
          experiment_id: string | null
          id: string
          last_seen: string
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_context?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          last_seen?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_context?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          last_seen?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vocabulary_mastery: {
        Row: {
          confidence_score: number | null
          correct_attempts: number | null
          created_at: string | null
          dictionary_entry_id: string
          first_encountered: string | null
          id: string
          last_practiced: string | null
          learning_context: string | null
          mastery_level: string
          notes: string | null
          pronunciation_scores: number[] | null
          response_times_ms: number[] | null
          total_attempts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          correct_attempts?: number | null
          created_at?: string | null
          dictionary_entry_id: string
          first_encountered?: string | null
          id?: string
          last_practiced?: string | null
          learning_context?: string | null
          mastery_level?: string
          notes?: string | null
          pronunciation_scores?: number[] | null
          response_times_ms?: number[] | null
          total_attempts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          correct_attempts?: number | null
          created_at?: string | null
          dictionary_entry_id?: string
          first_encountered?: string | null
          id?: string
          last_practiced?: string | null
          learning_context?: string | null
          mastery_level?: string
          notes?: string | null
          pronunciation_scores?: number[] | null
          response_times_ms?: number[] | null
          total_attempts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          permissions: Json | null
          role: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_duplicate_newsletter_subscription: {
        Args: { _email: string }
        Returns: boolean
      }
      clear_demo_entries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_embeddings_for_dictionary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_newsletter_confirmation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_anonymous_contribution_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          approved_contributions: number
          pending_contributions: number
          total_contributions: number
          total_votes_cast: number
        }[]
      }
      get_contribution_vote_summary: {
        Args: { _contribution_id: string }
        Returns: {
          total_votes: number
          user_vote: string
          votes_against: number
          votes_for: number
        }[]
      }
      get_learner_progress: {
        Args: { learner_user_id: string }
        Returns: {
          average_pronunciation_score: number
          improvement_areas: string[]
          preferred_topics: string[]
          streak_days: number
          total_study_time_minutes: number
          vocabulary_familiar: number
          vocabulary_learning: number
          vocabulary_mastered: number
        }[]
      }
      get_personalized_recommendations: {
        Args: { learner_user_id: string; recommendation_count?: number }
        Returns: {
          difficulty_level: string
          english_translation: string
          goji_word: string
          hausa_translation: string
          id: string
          priority_score: number
          recommendation_reason: string
        }[]
      }
      get_weather_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      manually_approve_contribution: {
        Args: { contribution_id: string }
        Returns: Json
      }
      match_cultural_contexts: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          clan_associations: string[]
          context_type: string
          cultural_significance: string
          description: string
          difficulty_level: string
          english_content: string
          geographical_region: string
          goji_content: string
          hausa_content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      match_dictionary_entries: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          cultural_context: string
          difficulty_level: string
          english_translation: string
          example_sentence: string
          goji_word: string
          hausa_translation: string
          id: string
          pronunciation_guide: string
          similarity: number
          usage_frequency: number
        }[]
      }
      match_learning_data: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          data_type: string
          difficulty_level: string
          id: string
          language_pair: string
          learning_category: string
          quality_score: number
          semantic_tags: string[]
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_vocabulary_mastery: {
        Args: {
          learner_user_id: string
          pronunciation_score?: number
          response_time_ms: number
          was_correct: boolean
          word_id: string
        }
        Returns: undefined
      }
      validate_newsletter_token: {
        Args: { _email: string; _token: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      verify_student_email_access: {
        Args: { _email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
