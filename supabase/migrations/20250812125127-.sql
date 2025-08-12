-- Fix messages security vulnerability - ensure all access requires authentication
-- Replace the current SELECT policy to require authentication for ALL access

DROP POLICY IF EXISTS "Users can view messages from accessible conversations" ON public.messages;

-- Create a secure policy that requires authentication and proper conversation access
CREATE POLICY "Authenticated users can view messages from accessible conversations" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND c.is_active = true
    AND (
      auth.uid() = c.creator_id OR 
      c.conversation_type IN ('general', 'public')
    )
  )
);

-- Ensure all other policies also explicitly require authentication
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
CREATE POLICY "Authenticated users can create messages" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Authenticated users can update their own messages" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Authenticated users can delete their own messages" 
ON public.messages 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Ensure RLS is enabled (should already be, but making sure)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;