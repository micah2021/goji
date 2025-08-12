-- Fix chat visibility - allow users to see messages from all public conversations, not just ones they created
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;

-- Create new policy that allows viewing messages from all active conversations
CREATE POLICY "Users can view messages from public conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND c.is_active = true
  )
);

-- Also allow users to view all active conversations, not just their own
DROP POLICY IF EXISTS "Users can view conversations they created" ON public.conversations;

CREATE POLICY "Users can view all active conversations" 
ON public.conversations 
FOR SELECT 
USING (is_active = true);

-- Ensure conversations table is set up for realtime
ALTER TABLE public.conversations REPLICA IDENTITY FULL;