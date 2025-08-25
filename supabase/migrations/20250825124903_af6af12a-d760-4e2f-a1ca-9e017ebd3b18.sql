-- Eliminate permission error by avoiding auth.users in RLS policies
-- 1) Helper to get current user's email safely (no RLS recursion)
CREATE OR REPLACE FUNCTION public.current_user_email(_uid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE p.id = COALESCE(_uid, auth.uid())
$$;

-- 2) Update utilisateurs policies to use current_user_email()
DROP POLICY IF EXISTS "Users can view their own utilisateur record" ON public.utilisateurs;
DROP POLICY IF EXISTS "Users can insert their own utilisateur record" ON public.utilisateurs;
DROP POLICY IF EXISTS "Users can update their own utilisateur record" ON public.utilisateurs;
DROP POLICY IF EXISTS "Admins can delete utilisateur records" ON public.utilisateurs;
DROP POLICY IF EXISTS "Admins can view all utilisateur records" ON public.utilisateurs;

CREATE POLICY "Users can view their own utilisateur record"
ON public.utilisateurs
FOR SELECT TO authenticated
USING ( email = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can view all utilisateur records"
ON public.utilisateurs
FOR SELECT TO authenticated
USING ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can insert their own utilisateur record"
ON public.utilisateurs
FOR INSERT TO authenticated
WITH CHECK ( email = public.current_user_email(auth.uid()) );

CREATE POLICY "Users can update their own utilisateur record"
ON public.utilisateurs
FOR UPDATE TO authenticated
USING ( email = public.current_user_email(auth.uid()) )
WITH CHECK ( email = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can delete utilisateur records"
ON public.utilisateurs
FOR DELETE TO authenticated
USING ( public.is_admin(auth.uid()) );

-- 3) Update commandes policies to use current_user_email()
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can create any orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can update any orders" ON public.commandes;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can delete any orders" ON public.commandes;

CREATE POLICY "Users can view their own orders"
ON public.commandes
FOR SELECT TO authenticated
USING ( clientname = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can view all orders"
ON public.commandes
FOR SELECT TO authenticated
USING ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can create their own orders"
ON public.commandes
FOR INSERT TO authenticated
WITH CHECK ( clientname = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can create any orders"
ON public.commandes
FOR INSERT TO authenticated
WITH CHECK ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can update their own orders"
ON public.commandes
FOR UPDATE TO authenticated
USING ( clientname = public.current_user_email(auth.uid()) )
WITH CHECK ( clientname = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can update any orders"
ON public.commandes
FOR UPDATE TO authenticated
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

CREATE POLICY "Users can delete their own orders"
ON public.commandes
FOR DELETE TO authenticated
USING ( clientname = public.current_user_email(auth.uid()) );

CREATE POLICY "Admins can delete any orders"
ON public.commandes
FOR DELETE TO authenticated
USING ( public.is_admin(auth.uid()) );