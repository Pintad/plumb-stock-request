-- Fix security issue: Restrict app_settings access to authenticated users only
-- Currently the SELECT policy allows public access with "true", which is a security risk

-- Drop the existing insecure SELECT policy
DROP POLICY IF EXISTS "Authenticated users can select app_settings" ON public.app_settings;

-- Create a new secure SELECT policy that actually checks for authentication
CREATE POLICY "Authenticated users can select app_settings" 
ON public.app_settings 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- Verify other policies are secure
-- The INSERT policy should also be restricted to authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert app_settings" ON public.app_settings;

CREATE POLICY "Authenticated users can insert app_settings" 
ON public.app_settings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- The UPDATE policy should also be restricted to authenticated users  
DROP POLICY IF EXISTS "Authenticated users can update app_settings" ON public.app_settings;

CREATE POLICY "Authenticated users can update app_settings" 
ON public.app_settings 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);