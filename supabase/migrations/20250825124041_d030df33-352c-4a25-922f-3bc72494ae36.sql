-- Fix security vulnerability in commandes table RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to select commandes" ON public.commandes;
DROP POLICY IF EXISTS "Allow authenticated users to insert commandes" ON public.commandes;
DROP POLICY IF EXISTS "Allow authenticated users to update commandes" ON public.commandes;
DROP POLICY IF EXISTS "Allow authenticated users to delete commandes" ON public.commandes;

-- Create secure policies that protect order details and customer information

-- Users can only view their own orders (matched by clientname = their email)
CREATE POLICY "Users can view their own orders" 
ON public.commandes
FOR SELECT 
TO authenticated
USING (
  clientname = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.commandes
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can create orders for themselves
CREATE POLICY "Users can create their own orders" 
ON public.commandes
FOR INSERT 
TO authenticated
WITH CHECK (
  clientname = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can create orders for anyone
CREATE POLICY "Admins can create any orders" 
ON public.commandes
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can update their own orders (but not change clientname)
CREATE POLICY "Users can update their own orders" 
ON public.commandes
FOR UPDATE 
TO authenticated
USING (
  clientname = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  clientname = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can update any orders
CREATE POLICY "Admins can update any orders" 
ON public.commandes
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

-- Users can delete their own orders
CREATE POLICY "Users can delete their own orders" 
ON public.commandes
FOR DELETE 
TO authenticated
USING (
  clientname = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can delete any orders
CREATE POLICY "Admins can delete any orders" 
ON public.commandes
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);