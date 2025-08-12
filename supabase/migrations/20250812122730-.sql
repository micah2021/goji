-- Create a security definer function to check if user is admin
-- This prevents RLS recursion issues when checking user roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

-- Drop the overly permissive policies that allow any authenticated user to access contact data
DROP POLICY IF EXISTS "Only authenticated users can read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Only authenticated users can update messages" ON public.contact_messages;

-- Create admin-only policies for reading and updating contact messages
CREATE POLICY "Only admins can read contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (public.is_admin());