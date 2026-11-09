-- Fix: admins could not delete a landlord ("new row violates row-level security policy").
-- The admin "view all landlords" rule only let admins see landlords that were NOT deleted, so
-- marking one deleted was rejected. Paste into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once. New databases don't need this: init.sql already includes it.

DROP POLICY IF EXISTS "Admins can view all landlords" ON public.landlords;
CREATE POLICY "Admins can view all landlords" ON public.landlords
  FOR SELECT TO public USING (public.is_admin());
