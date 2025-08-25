-- Fix security vulnerability in utilisateurs table RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to select utilisateurs" ON public.utilisateurs;
DROP POLICY IF EXISTS "Allow authenticated users to insert utilisateurs" ON public.utilisateurs;
DROP POLICY IF EXISTS "Allow authenticated users to update utilisateurs" ON public.utilisateurs;
DROP POLICY IF EXISTS "Allow authenticated users to delete utilisateurs" ON public.utilisateurs;

-- Create secure policies that protect employee personal information

-- Users can only view their own record (matched by email)
CREATE POLICY "Users can view their own utilisateur record" 
ON public.utilisateurs
FOR SELECT 
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all utilisateur records
CREATE POLICY "Admins can view all utilisateur records" 
ON public.utilisateurs
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert new utilisateur records
CREATE POLICY "Only admins can insert utilisateur records" 
ON public.utilisateurs
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update utilisateur records
CREATE POLICY "Only admins can update utilisateur records" 
ON public.utilisateurs
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete utilisateur records  
CREATE POLICY "Only admins can delete utilisateur records" 
ON public.utilisateurs
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);