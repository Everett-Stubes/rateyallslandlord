-- Upgrade for a database that already ran an earlier init.sql.
-- Adds: a school tag on each review (which school the reviewer goes to). The database works it
-- out from the reviewer's confirmed school email, so it can't be faked, and nobody can see
-- the email address itself. Existing reviews are filled in too.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once.
-- New databases don't need this: init.sql already includes it.

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_school text;

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
    WHERE u.id = NEW.user_id
    ORDER BY length(d.domain) DESC
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_reviews_set_school
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_school();

-- Fill in the school for reviews that already exist.
UPDATE public.reviews r
SET reviewer_school = (
  SELECT CASE WHEN d.blocked THEN NULL ELSE d.school END
  FROM auth.users u
  CROSS JOIN LATERAL (SELECT lower(split_part(u.email, '@', 2)) AS email_domain) e
  JOIN public.school_email_domains d
    ON e.email_domain = d.domain
    OR right(e.email_domain, length(d.domain) + 1) = '.' || d.domain
  WHERE u.id = r.user_id
  ORDER BY length(d.domain) DESC
  LIMIT 1
)
WHERE r.user_id IS NOT NULL AND r.reviewer_school IS NULL;

-- Keep the school locked against edits from the website.
CREATE OR REPLACE FUNCTION public.protect_review_moderation_fields()
RETURNS trigger AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.verification_status := 'pending';
    NEW.is_deleted := false;
    NEW.created_at := now();
    NEW.updated_at := now();
    -- Only school-email accounts can post, so every review is a student review.
    NEW.created_by_student := true;
  ELSE
    NEW.verification_status := OLD.verification_status;
    NEW.created_by_student := OLD.created_by_student;
    NEW.landlord_id := OLD.landlord_id;
    NEW.user_id := OLD.user_id;
    NEW.created_at := OLD.created_at;
    NEW.semester := OLD.semester;
    NEW.reviewer_school := OLD.reviewer_school;
    NEW.is_deleted := OLD.is_deleted OR NEW.is_deleted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
