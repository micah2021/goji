-- Drop the insecure policy that allows everyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that restricts profile access to authenticated users only
-- This prevents anonymous users from scraping personal information while allowing
-- the app to function normally for logged-in users (e.g., showing conversation creators)
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');