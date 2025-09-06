-- Add RLS policies for cultural_contexts table to allow authenticated users to insert their own cultural contexts

-- Allow authenticated users to insert cultural contexts
CREATE POLICY "Authenticated users can create cultural contexts"
ON public.cultural_contexts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update their own cultural contexts
CREATE POLICY "Users can update their own cultural contexts"
ON public.cultural_contexts
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their own cultural contexts (optional)
CREATE POLICY "Users can delete their own cultural contexts"
ON public.cultural_contexts
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);