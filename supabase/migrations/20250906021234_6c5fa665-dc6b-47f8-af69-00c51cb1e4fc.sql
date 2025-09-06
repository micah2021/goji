-- Add user_id column to cultural_contexts table to track ownership
ALTER TABLE public.cultural_contexts 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to be based on user ownership
DROP POLICY IF EXISTS "Authenticated users can create cultural contexts" ON public.cultural_contexts;
DROP POLICY IF EXISTS "Users can update their own cultural contexts" ON public.cultural_contexts;
DROP POLICY IF EXISTS "Users can delete their own cultural contexts" ON public.cultural_contexts;

-- Create new policies based on user ownership
CREATE POLICY "Users can create their own cultural contexts"
ON public.cultural_contexts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cultural contexts"
ON public.cultural_contexts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cultural contexts"
ON public.cultural_contexts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);