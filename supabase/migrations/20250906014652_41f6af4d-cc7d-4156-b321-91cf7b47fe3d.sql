-- Create RLS policies for storage.objects to allow authenticated users to upload audio files

-- Policy to allow authenticated users to upload files to chat-audio bucket
CREATE POLICY "Authenticated users can upload to chat-audio bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-audio' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to view files in chat-audio bucket (since it's public)
CREATE POLICY "Anyone can view files in chat-audio bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-audio');

-- Policy to allow users to update their own files in chat-audio bucket
CREATE POLICY "Users can update their own files in chat-audio bucket" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-audio' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to delete their own files in chat-audio bucket
CREATE POLICY "Users can delete their own files in chat-audio bucket" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-audio' 
  AND auth.role() = 'authenticated'
);