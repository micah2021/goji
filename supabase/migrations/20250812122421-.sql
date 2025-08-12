-- First, drop the insecure policy that allows all users to view all messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;

-- Create a proper RLS policy that restricts message access to conversation participants
-- Users can only view messages from conversations they have access to (i.e., conversations they created)
CREATE POLICY "Users can view messages from their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND c.creator_id = auth.uid()
  )
);