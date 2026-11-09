-- Upgrade for a database that already ran the earlier init.sql.
-- Only confirmed school-email accounts can post reviews or add landlords.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once.
-- New databases don't need this: init.sql already includes it.

CREATE TABLE IF NOT EXISTS public.school_email_domains (
  domain text PRIMARY KEY CHECK (domain = lower(domain) AND domain <> '' AND domain NOT LIKE '%@%'),
  school text NOT NULL
);

INSERT INTO public.school_email_domains (domain, school) VALUES
  ('gatech.edu', 'Georgia Tech'),
  ('gsu.edu', 'Georgia State'),
  ('student.gsu.edu', 'Georgia State')
ON CONFLICT (domain) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_school_email()
RETURNS boolean SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.school_email_domains d ON d.domain = lower(split_part(u.email, '@', 2))
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND u.email ~ '^[^@[:space:]]+@[^@[:space:]]+$'
      AND lower(u.email) = lower(auth.jwt() ->> 'email')
  );
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
CREATE POLICY "School-email users can insert landlords" ON public.landlords
  FOR INSERT TO authenticated WITH CHECK (public.is_school_email());

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Signed-in users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "School-email users can insert their own reviews" ON public.reviews;
CREATE POLICY "School-email users can insert their own reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.is_school_email());
