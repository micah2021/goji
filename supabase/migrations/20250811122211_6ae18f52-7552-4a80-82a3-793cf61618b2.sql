-- Fix the foreign key relationship for conversations table
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;