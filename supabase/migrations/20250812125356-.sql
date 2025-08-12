-- Fix conversations security vulnerability - ensure only authenticated users can access conversations
-- Remove all existing SELECT policies and create a single secure one

DROP POLICY IF EXISTS "Users can view conversations based on participation or public type" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Create a single, secure SELECT policy that requires authentication
CREATE POLICY "Authenticated users can view accessible conversations" 
ON public.conversations 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Users can see conversations they created
    auth.uid() = creator_id 
    OR 
    -- Users can see active public/general conversations (for community chat)
    (is_active = true AND conversation_type IN ('general', 'public'))
  )
);

-- Ensure all other policies also require authentication
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = creator_id
);

DROP POLICY IF EXISTS "Creators can update their conversations" ON public.conversations;
CREATE POLICY "Authenticated creators can update their conversations" 
ON public.conversations 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = creator_id
);

DROP POLICY IF EXISTS "Creators can delete their conversations" ON public.conversations;
CREATE POLICY "Authenticated creators can delete their conversations" 
ON public.conversations 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = creator_id
);

-- Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;