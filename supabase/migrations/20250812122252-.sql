-- First, drop the insecure policy that allows all users to view all conversations
DROP POLICY IF EXISTS "Users can view public conversations" ON public.conversations;

-- Create a proper RLS policy that restricts conversation access to creators only
-- (Since there's no participants table, we'll restrict to creators for now)
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = creator_id);

-- Optional: If you want to allow conversations to be shared, you could create
-- a more complex policy later that checks for participants in a separate table