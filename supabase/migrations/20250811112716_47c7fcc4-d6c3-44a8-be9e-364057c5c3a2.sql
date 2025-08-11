-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN full_name TEXT,
ADD COLUMN role TEXT DEFAULT 'member';