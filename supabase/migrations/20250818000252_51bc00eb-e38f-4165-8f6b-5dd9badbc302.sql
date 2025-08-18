-- Create storage bucket for chat audio if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-audio', 'chat-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat audio uploads
CREATE POLICY "Authenticated users can upload chat audio" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'chat-audio' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own chat audio" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'chat-audio' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own chat audio" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'chat-audio' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own chat audio" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'chat-audio' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);