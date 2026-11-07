-- Run this once in the Supabase SQL Editor on a database that was set up with an
-- older init.sql. New databases get the same rules from init.sql and don't need it.
--
-- What it does: only signed-in users with a school email (or admins) can add
-- landlords or reviews. Logged-out visitors can no longer post anonymous reviews.
-- Keep the domain list the same as the emailDomains in siteSettings.ts.

CREATE OR REPLACE FUNCTION public.is_school_email()
RETURNS boolean STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(ARRAY[
      'gatech.edu', 'gsu.edu', 'emory.edu', 'morehouse.edu',
      'spelman.edu', 'cau.edu', 'msm.edu', 'scad.edu'
    ]) AS school(domain),
    LATERAL (SELECT lower(substring(auth.jwt() ->> 'email' FROM '@([^@]+)$')) AS email_domain) AS e
    WHERE e.email_domain = school.domain OR e.email_domain LIKE '%.' || school.domain
  );
$$ LANGUAGE sql;

DROP POLICY IF EXISTS "Authenticated users can insert landlords" ON public.landlords;
DROP POLICY IF EXISTS "Students can insert landlords" ON public.landlords;
CREATE POLICY "Students can insert landlords" ON public.landlords
  FOR INSERT TO authenticated WITH CHECK (public.is_school_email() OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Students can insert reviews" ON public.reviews;
CREATE POLICY "Students can insert reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND (public.is_school_email() OR public.is_admin())
  );
