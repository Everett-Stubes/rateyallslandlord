-- Lets a reviewer delete their own review (so they can post a new one that semester).
-- Before this, only admins could delete reviews. Reviewers still cannot restore a deleted
-- review, change its date or semester, or verify it. Also includes the landlord-delete fix, so
-- running this one script is enough. Paste into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once. New databases don't need this: init.sql already includes it.

DROP POLICY IF EXISTS "Admins can view all landlords" ON public.landlords;
CREATE POLICY "Admins can view all landlords" ON public.landlords
  FOR SELECT TO public USING (public.is_admin());

-- A reviewer can always see their own reviews, deleted ones included. (Deleting a review marks
-- it deleted, and the database rejects that update unless the updated row stays visible to
-- the person doing it. The website still hides deleted reviews from everyone but admins.)
DROP POLICY IF EXISTS "Users can see their own reviews" ON public.reviews;
CREATE POLICY "Users can see their own reviews" ON public.reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

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
    NEW.created_by_student := true;
  ELSE
    NEW.verification_status := OLD.verification_status;
    NEW.created_by_student := OLD.created_by_student;
    NEW.landlord_id := OLD.landlord_id;
    NEW.user_id := OLD.user_id;
    NEW.created_at := OLD.created_at;
    NEW.semester := OLD.semester;
    NEW.is_deleted := OLD.is_deleted OR NEW.is_deleted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
