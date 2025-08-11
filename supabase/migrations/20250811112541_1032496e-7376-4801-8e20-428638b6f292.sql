-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  tags TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Messages are viewable by everyone" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create chat-audio storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-audio', 'chat-audio', true);

-- Create storage policies for chat audio
CREATE POLICY "Audio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-audio');

CREATE POLICY "Users can upload their own audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);