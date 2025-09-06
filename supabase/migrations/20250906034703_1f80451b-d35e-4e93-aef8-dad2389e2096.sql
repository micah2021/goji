-- Create images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for images bucket
CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);