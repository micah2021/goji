-- Fix conversations security vulnerability 
-- Only allow viewing conversations based on participation or public type

DROP POLICY IF EXISTS "Users can view all active conversations" ON public.conversations;

-- Create a more secure policy that only allows:
-- 1. Users to view conversations they created
-- 2. Everyone to view public/general community conversations  
CREATE POLICY "Users can view conversations based on participation or public type" 
ON public.conversations 
FOR SELECT 
USING (
  auth.uid() = creator_id OR 
  (is_active = true AND conversation_type IN ('general', 'public'))
);

-- Also update messages policy to be more secure for private conversations
DROP POLICY IF EXISTS "Users can view messages from public conversations" ON public.messages;

CREATE POLICY "Users can view messages from accessible conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
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