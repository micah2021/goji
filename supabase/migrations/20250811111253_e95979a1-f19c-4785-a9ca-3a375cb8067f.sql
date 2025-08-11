-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create messages table for community chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT,
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT message_content_check CHECK (text IS NOT NULL OR audio_url IS NOT NULL)
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Messages are viewable by authenticated users" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create messages" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any message" 
ON public.messages 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create AI corpus table for approved messages
CREATE TABLE public.ai_corpus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- For OpenAI embeddings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_corpus
ALTER TABLE public.ai_corpus ENABLE ROW LEVEL SECURITY;

-- Create policy for ai_corpus (readable by authenticated users)
CREATE POLICY "AI corpus is viewable by authenticated users" 
ON public.ai_corpus 
FOR SELECT 
TO authenticated
USING (true);

-- Create storage buckets for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-audio', 'chat-audio', false);

-- Create storage policies for chat audio
CREATE POLICY "Authenticated users can upload chat audio" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view chat audio" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'chat-audio');

CREATE POLICY "Users can update their own chat audio" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat audio" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to add approved messages to AI corpus
CREATE OR REPLACE FUNCTION public.add_to_ai_corpus(message_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_text TEXT;
BEGIN
  -- Get message content
  SELECT text INTO message_text FROM public.messages WHERE id = message_id;
  
  IF message_text IS NOT NULL THEN
    -- Insert into AI corpus (embedding will be added later via API)
    INSERT INTO public.ai_corpus (message_id, content)
    VALUES (message_id, message_text);
  END IF;
END;
$$;

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;