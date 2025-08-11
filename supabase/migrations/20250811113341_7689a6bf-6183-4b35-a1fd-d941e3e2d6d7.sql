-- Create conversations table for threading messages
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'lesson', 'practice', 'story')),
  participant_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  language_focus TEXT DEFAULT 'goji',
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audio_recordings table for detailed audio analysis
CREATE TABLE public.audio_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds DECIMAL(10,2),
  audio_format TEXT DEFAULT 'webm',
  transcription TEXT,
  transcription_confidence DECIMAL(5,4),
  language_detected TEXT,
  pronunciation_score DECIMAL(5,4),
  audio_quality_score DECIMAL(5,4),
  noise_level DECIMAL(5,4),
  ai_analysis JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_learning_data table for GPT-5 training
CREATE TABLE public.ai_learning_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  audio_recording_id UUID REFERENCES public.audio_recordings(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('text', 'audio', 'conversation_flow', 'language_pattern', 'pronunciation')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  quality_score DECIMAL(5,4) DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  learning_category TEXT CHECK (learning_category IN ('vocabulary', 'grammar', 'pronunciation', 'conversation', 'cultural')),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  language_pair TEXT DEFAULT 'goji-english',
  usage_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add conversation_id to messages table
ALTER TABLE public.messages 
ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_conversations_creator_id ON public.conversations(creator_id);
CREATE INDEX idx_conversations_type ON public.conversations(conversation_type);
CREATE INDEX idx_conversations_active ON public.conversations(is_active);
CREATE INDEX idx_audio_recordings_message_id ON public.audio_recordings(message_id);
CREATE INDEX idx_audio_recordings_user_id ON public.audio_recordings(user_id);
CREATE INDEX idx_audio_recordings_status ON public.audio_recordings(processing_status);
CREATE INDEX idx_ai_learning_data_type ON public.ai_learning_data(data_type);
CREATE INDEX idx_ai_learning_data_category ON public.ai_learning_data(learning_category);
CREATE INDEX idx_ai_learning_data_verified ON public.ai_learning_data(is_verified);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view public conversations" ON public.conversations
  FOR SELECT USING (true);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for audio_recordings
CREATE POLICY "Users can view their audio recordings" ON public.audio_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their audio recordings" ON public.audio_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their audio recordings" ON public.audio_recordings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their audio recordings" ON public.audio_recordings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_learning_data
CREATE POLICY "Verified data is viewable by all" ON public.ai_learning_data
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can view their learning data" ON public.ai_learning_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = ai_learning_data.message_id 
      AND m.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.audio_recordings ar
      WHERE ar.id = ai_learning_data.audio_recording_id
      AND ar.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert learning data" ON public.ai_learning_data
  FOR INSERT WITH CHECK (true);

-- Triggers for updating counters
CREATE OR REPLACE FUNCTION update_conversation_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count for conversations
  IF TG_OP = 'INSERT' THEN
    UPDATE public.conversations 
    SET message_count = message_count + 1,
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.conversations 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_message_count
  AFTER INSERT OR DELETE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_counters();

-- Trigger for updating timestamps
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_recordings_updated_at
  BEFORE UPDATE ON public.audio_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_learning_data_updated_at
  BEFORE UPDATE ON public.ai_learning_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate learning data from messages
CREATE OR REPLACE FUNCTION generate_learning_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate learning data for text messages
  IF NEW.text IS NOT NULL AND NEW.text != '[Audio Message]' THEN
    INSERT INTO public.ai_learning_data (
      conversation_id,
      message_id,
      data_type,
      content,
      metadata,
      learning_category,
      language_pair
    ) VALUES (
      NEW.conversation_id,
      NEW.id,
      'text',
      NEW.text,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'tags', NEW.tags,
        'created_at', NEW.created_at
      ),
      'conversation',
      'goji-english'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_learning_data
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION generate_learning_data();