-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector embeddings to dictionary entries
ALTER TABLE dictionary_entries 
ADD COLUMN embedding vector(1536),
ADD COLUMN pronunciation_guide text,
ADD COLUMN difficulty_level text DEFAULT 'beginner',
ADD COLUMN usage_frequency integer DEFAULT 0,
ADD COLUMN audio_quality_score numeric DEFAULT 0.0,
ADD COLUMN last_updated timestamp with time zone DEFAULT now();

-- Add vector embeddings to ai_learning_data
ALTER TABLE ai_learning_data 
ADD COLUMN embedding vector(1536),
ADD COLUMN semantic_tags text[],
ADD COLUMN pronunciation_analysis jsonb DEFAULT '{}',
ADD COLUMN learning_effectiveness_score numeric DEFAULT 0.0;

-- Create learner profiles table for personalized learning
CREATE TABLE public.learner_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  learning_level text NOT NULL DEFAULT 'beginner',
  preferred_learning_style text DEFAULT 'mixed',
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  learning_goals jsonb DEFAULT '{}',
  progress_data jsonb DEFAULT '{}',
  pronunciation_score_history numeric[] DEFAULT '{}',
  vocabulary_mastery_count integer DEFAULT 0,
  total_study_time_minutes integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_active timestamp with time zone DEFAULT now(),
  cultural_interests text[] DEFAULT '{}',
  native_language text DEFAULT 'english',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create enhanced cultural contexts table
CREATE TABLE public.cultural_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  context_type text NOT NULL, -- story, tradition, ceremony, daily_life, etc
  goji_content text,
  english_content text,
  hausa_content text,
  related_vocabulary uuid[] DEFAULT '{}',
  difficulty_level text DEFAULT 'beginner',
  cultural_significance text,
  historical_period text,
  geographical_region text,
  clan_associations text[] DEFAULT '{}',
  embedding vector(1536),
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create vocabulary mastery tracking
CREATE TABLE public.vocabulary_mastery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  dictionary_entry_id uuid NOT NULL,
  mastery_level text NOT NULL DEFAULT 'learning', -- learning, familiar, mastered
  first_encountered timestamp with time zone DEFAULT now(),
  last_practiced timestamp with time zone DEFAULT now(),
  correct_attempts integer DEFAULT 0,
  total_attempts integer DEFAULT 1,
  confidence_score numeric DEFAULT 0.0,
  pronunciation_scores numeric[] DEFAULT '{}',
  response_times_ms integer[] DEFAULT '{}',
  learning_context text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, dictionary_entry_id)
);

-- Create enhanced conversation analysis
CREATE TABLE public.conversation_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  session_duration_minutes numeric,
  vocabulary_used text[],
  new_words_encountered text[],
  pronunciation_improvements jsonb,
  engagement_score numeric DEFAULT 0.0,
  learning_objectives_met text[],
  suggested_focus_areas text[],
  cultural_topics_discussed text[],
  difficulty_progression numeric DEFAULT 0.0,
  session_summary text,
  ai_feedback jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create bulk import staging table
CREATE TABLE public.dictionary_import_staging (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  goji_word text NOT NULL,
  english_translation text,
  hausa_translation text,
  example_sentence text,
  cultural_context text,
  pronunciation_guide text,
  category text,
  difficulty_level text DEFAULT 'beginner',
  source_document text,
  import_status text DEFAULT 'pending',
  validation_errors text[],
  imported_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_dictionary_entries_embedding ON dictionary_entries USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_ai_learning_data_embedding ON ai_learning_data USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_cultural_contexts_embedding ON cultural_contexts USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_learner_profiles_user_id ON learner_profiles(user_id);
CREATE INDEX idx_vocabulary_mastery_user_id ON vocabulary_mastery(user_id);
CREATE INDEX idx_vocabulary_mastery_entry_id ON vocabulary_mastery(dictionary_entry_id);
CREATE INDEX idx_conversation_analytics_user_id ON conversation_analytics(user_id);
CREATE INDEX idx_dictionary_staging_batch_id ON dictionary_import_staging(batch_id);

-- Enable Row Level Security
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_import_staging ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own learner profile" 
ON learner_profiles FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Cultural contexts are viewable by everyone" 
ON cultural_contexts FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their vocabulary mastery" 
ON vocabulary_mastery FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their conversation analytics" 
ON conversation_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert conversation analytics" 
ON conversation_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can import dictionary entries" 
ON dictionary_import_staging FOR ALL 
USING (auth.uid() = imported_by OR auth.uid() IS NOT NULL);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_learner_profile_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE learner_profiles 
  SET 
    last_active = now(),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_vocabulary_mastery_activity
  AFTER INSERT OR UPDATE ON vocabulary_mastery
  FOR EACH ROW EXECUTE FUNCTION update_learner_profile_activity();

CREATE TRIGGER update_conversation_analytics_activity
  AFTER INSERT ON conversation_analytics
  FOR EACH ROW EXECUTE FUNCTION update_learner_profile_activity();