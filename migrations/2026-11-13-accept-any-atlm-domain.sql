-- Atlanta Metropolitan State College: accept any email domain that has the word 'atlm' in it
-- (atlm.edu, student.atlm.edu, atlm.org, ...), because the student email domain isn't confirmed.
-- Domains that only contain the letters inside another word (notatlm.edu) are still refused.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once.
-- New databases don't need this: init.sql already includes it.

ALTER TABLE public.school_email_domains ADD COLUMN IF NOT EXISTS match_word boolean NOT NULL DEFAULT false;

INSERT INTO public.school_email_domains (domain, school, blocked, match_word) VALUES
  ('atlm', 'Atlanta Metropolitan State College', false, true)
ON CONFLICT (domain) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_school_email()
RETURNS boolean SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT NOT d.blocked
    FROM auth.users u
    CROSS JOIN LATERAL (SELECT lower(split_part(u.email, '@', 2)) AS email_domain) e
    JOIN public.school_email_domains d
      ON e.email_domain = d.domain
      OR right(e.email_domain, length(d.domain) + 1) = '.' || d.domain
      OR (d.match_word AND position('.' || d.domain || '.' IN '.' || e.email_domain || '.') > 0)
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND u.email ~ '^[^@[:space:]]+@[^@[:space:]]+$'
      AND lower(u.email) = lower(auth.jwt() ->> 'email')
    ORDER BY length(d.domain) DESC
    LIMIT 1
  ), false);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.set_review_school()
RETURNS trigger SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.reviewer_school := (
    SELECT CASE WHEN d.blocked THEN NULL ELSE d.school END
    FROM auth.users u
    CROSS JOIN LATERAL (SELECT lower(split_part(u.email, '@', 2)) AS email_domain) e
    JOIN public.school_email_domains d
      ON e.email_domain = d.domain
      OR right(e.email_domain, length(d.domain) + 1) = '.' || d.domain
      OR (d.match_word AND position('.' || d.domain || '.' IN '.' || e.email_domain || '.') > 0)
    WHERE u.id = NEW.user_id
    ORDER BY length(d.domain) DESC
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
