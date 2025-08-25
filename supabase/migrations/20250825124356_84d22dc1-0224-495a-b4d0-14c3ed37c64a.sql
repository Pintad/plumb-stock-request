-- Prevent RLS infinite recursion by using a SECURITY DEFINER helper
-- 1) Create helper function to check admin role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = COALESCE(_uid, auth.uid())
      AND p.role = 'admin'
  );
$$;

-- 2) Update profiles policies to use is_admin() instead of recursive subqueries
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can select all profiles"
ON public.profiles
FOR SELECT TO authenticated
USING ( public.is_admin(auth.uid()) );

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE TO authenticated
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

-- 3) Update utilisateurs policies to avoid recursion and allow self-service for own record
DROP POLICY IF EXISTS "Admins can view all utilisateur records" ON public.utilisateurs;
DROP POLICY IF EXISTS "Only admins can insert utilisateur records" ON public.utilisateurs;
DROP POLICY IF EXISTS "Only admins can update utilisateur records" ON public.utilisateurs;
DROP POLICY IF EXISTS "Only admins can delete utilisateur records" ON public.utilisateurs;
DROP POLICY IF EXISTS "Users can view their own utilisateur record" ON public.utilisateurs;

-- Users may view their own record (matched by email)
CREATE POLICY "Users can view their own utilisateur record"
ON public.utilisateurs
FOR SELECT TO authenticated
USING ( email = (SELECT email FROM auth.users WHERE id = auth.uid()) );

-- Admins can view all
CREATE POLICY "Admins can view all utilisateur records"
ON public.utilisateurs
FOR SELECT TO authenticated
USING ( public.is_admin(auth.uid()) );

-- Users can insert their own utilisateur row (email must match their auth email)
CREATE POLICY "Users can insert their own utilisateur record"
ON public.utilisateurs
FOR INSERT TO authenticated
WITH CHECK ( email = (SELECT email FROM auth.users WHERE id = auth.uid()) );

-- Users can update their own utilisateur row
CREATE POLICY "Users can update their own utilisateur record"
ON public.utilisateurs
FOR UPDATE TO authenticated
USING ( email = (SELECT email FROM auth.users WHERE id = auth.uid()) )
WITH CHECK ( email = (SELECT email FROM auth.users WHERE id = auth.uid()) );

-- Only admins can delete utilisateur rows
CREATE POLICY "Admins can delete utilisateur records"
ON public.utilisateurs
FOR DELETE TO authenticated
USING ( public.is_admin(auth.uid()) );

-- 4) Update commandes policies to use is_admin() and keep self-access by email
DROP POLICY IF EXISTS "Admins can view all orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can create any orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can update any orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can delete any orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.commandes;

CREATE POLICY "Users can view their own orders"
ON public.commandes
FOR SELECT TO authenticated
USING ( clientname = (SELECT email FROM auth.users WHERE id = auth.uid()) );

CREATE POLICY "Admins can view all orders"
ON public.commandes
FOR SELECT TO authenticated
USING ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can create their own orders"
ON public.commandes
FOR INSERT TO authenticated
WITH CHECK ( clientname = (SELECT email FROM auth.users WHERE id = auth.uid()) );

CREATE POLICY "Admins can create any orders"
ON public.commandes
FOR INSERT TO authenticated
WITH CHECK ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can update their own orders"
ON public.commandes
FOR UPDATE TO authenticated
USING ( clientname = (SELECT email FROM auth.users WHERE id = auth.uid()) )
WITH CHECK ( clientname = (SELECT email FROM auth.users WHERE id = auth.uid()) );

CREATE POLICY "Admins can update any orders"
ON public.commandes
FOR UPDATE TO authenticated
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can delete their own orders"
ON public.commandes
FOR DELETE TO authenticated
USING ( clientname = (SELECT email FROM auth.users WHERE id = auth.uid()) );

CREATE POLICY "Admins can delete any orders"
ON public.commandes
FOR DELETE TO authenticated
USING ( public.is_admin(auth.uid()) );