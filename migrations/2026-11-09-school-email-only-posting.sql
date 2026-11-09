-- Upgrade for a database that already ran an earlier init.sql.
-- Only confirmed school-email accounts (or admins) can post reviews or add landlords.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once,
-- including after an earlier version of this script.
-- New databases don't need this: init.sql already includes it.

CREATE TABLE IF NOT EXISTS public.school_email_domains (
  domain text PRIMARY KEY CHECK (domain = lower(domain) AND domain <> '' AND domain NOT LIKE '%@%'),
  school text NOT NULL,
  blocked boolean NOT NULL DEFAULT false
);
-- An earlier version of this script made the table without the blocked column.
ALTER TABLE public.school_email_domains ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;

-- Subdomains are accepted automatically now, so these earlier rows are redundant.
DELETE FROM public.school_email_domains WHERE domain IN ('student.gsu.edu', 'live.mercer.edu');

INSERT INTO public.school_email_domains (domain, school, blocked) VALUES
  ('gatech.edu', 'Georgia Tech', false),
  ('gsu.edu', 'Georgia State', false),
  ('emory.edu', 'Emory', false),
  ('morehouse.edu', 'Morehouse College', false),
  ('spelman.edu', 'Spelman College', false),
  ('cau.edu', 'Clark Atlanta University', false),
  ('msm.edu', 'Morehouse School of Medicine', false),
  ('scad.edu', 'SCAD Atlanta', false),
  ('agnesscott.edu', 'Agnes Scott College', false),
  ('mercer.edu', 'Mercer University', false),
  ('alumni.emory.edu', 'Emory', true),
  ('alumnae.spelman.edu', 'Spelman College', true)
ON CONFLICT (domain) DO UPDATE SET school = EXCLUDED.school, blocked = EXCLUDED.blocked;

CREATE OR REPLACE FUNCTION public.is_school_email()
RETURNS boolean SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT NOT d.blocked
    FROM auth.users u
    CROSS JOIN LATERAL (SELECT lower(split_part(u.email, '@', 2)) AS email_domain) e
    JOIN public.school_email_domains d
      ON e.email_domain = d.domain
      OR right(e.email_domain, length(d.domain) + 1) = '.' || d.domain
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND u.email ~ '^[^@[:space:]]+@[^@[:space:]]+$'
      AND lower(u.email) = lower(auth.jwt() ->> 'email')
    ORDER BY length(d.domain) DESC
    LIMIT 1
  ), false);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.protect_review_moderation_fields()
RETURNS trigger AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.verification_status := 'pending';
    NEW.is_deleted := false;
    -- Only school-email accounts can post, so every review is a student review.
    NEW.created_by_student := true;
  ELSE
    NEW.verification_status := OLD.verification_status;
    NEW.created_by_student := OLD.created_by_student;
    NEW.landlord_id := OLD.landlord_id;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.school_email_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view school email domains" ON public.school_email_domains;
CREATE POLICY "Anyone can view school email domains" ON public.school_email_domains
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert landlords" ON public.landlords;
DROP POLICY IF EXISTS "School-email users can insert landlords" ON public.landlords;
DROP POLICY IF EXISTS "Students can insert landlords" ON public.landlords;
CREATE POLICY "Students can insert landlords" ON public.landlords
  FOR INSERT TO authenticated WITH CHECK (public.is_school_email() OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Signed-in users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "School-email users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Students can insert reviews" ON public.reviews;
CREATE POLICY "Students can insert reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND public.is_school_email()
  );

-- The list of admin emails is no longer public: signed-in users see only their own row.
DROP POLICY IF EXISTS "Anyone can view admins" ON public.admins;
DROP POLICY IF EXISTS "Users can see their own admin row" ON public.admins;
CREATE POLICY "Users can see their own admin row" ON public.admins
  FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');
