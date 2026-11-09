-- Upgrade for a database that already ran an earlier init.sql.
-- Adds: (1) one review per person per landlord per semester, with the date, semester and
-- deleted flag locked against edits from the website, (2) up/down votes on reviews, and
-- (3) a neighborhoods list on each landlord, so a landlord shows up under the neighborhood
-- it was added to even when its street isn't one we recognise.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once.
-- New databases don't need this: init.sql already includes it.

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS semester text;
ALTER TABLE public.landlords ADD COLUMN IF NOT EXISTS neighborhoods text[] DEFAULT '{}'::text[];

-- 6b. One review per person, per landlord, per semester.
-- Semesters (Atlanta time): spring = Jan-Apr, summer = May-Jul, fall = Aug-Dec.
-- Keep this in step with utils/semester.ts.
CREATE OR REPLACE FUNCTION public.semester_of(ts timestamptz)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT to_char(ts AT TIME ZONE 'America/New_York', 'YYYY') || '-' ||
    CASE
      WHEN extract(month FROM ts AT TIME ZONE 'America/New_York') <= 4 THEN 'spring'
      WHEN extract(month FROM ts AT TIME ZONE 'America/New_York') <= 7 THEN 'summer'
      ELSE 'fall'
    END;
$$;

-- Give existing reviews a semester (from the date they were posted).
UPDATE public.reviews SET semester = public.semester_of(created_at) WHERE semester IS NULL;
ALTER TABLE public.reviews ALTER COLUMN semester SET NOT NULL;

CREATE OR REPLACE FUNCTION public.set_review_semester()
RETURNS trigger AS $$
BEGIN
  NEW.semester := public.semester_of(COALESCE(NEW.created_at, now()));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_reviews_set_semester
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_semester();

-- Deleted reviews don't count, so an admin removing one lets the author post again.
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_one_per_semester
  ON public.reviews (user_id, landlord_id, semester)
  WHERE NOT is_deleted AND user_id IS NOT NULL;

-- 6c. Keep moderation fields under admin control.
-- New reviews from non-admins always start as 'pending' and are dated now, and non-admins
-- cannot change a review's verification status, student flag, landlord, author, date,
-- semester, or deleted flag. (Locking the date, semester, and deleted flag is what makes
-- the one-review-per-semester rule hold.) Applies only to website requests (the anon and
-- authenticated roles); the SQL Editor and Table Editor run as the project owner and are
-- not restricted.
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
    NEW.is_deleted := OLD.is_deleted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_reviews_protect_moderation
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_review_moderation_fields();

-- 6d. Up and down votes on reviews. Votes are display-only: they never change a landlord's
-- grade. Each person has one vote per review (click again to remove it). Voter identities
-- are private: the website reads only totals (through get_review_vote_counts) plus the
-- signed-in person's own votes.
CREATE TABLE IF NOT EXISTS public.review_votes (
  review_id bigint NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value IN (1, -1)),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_votes_pkey PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

CREATE OR REPLACE FUNCTION public.get_review_vote_counts(p_landlord_id bigint)
RETURNS TABLE (review_id bigint, upvotes bigint, downvotes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.review_id,
         count(*) FILTER (WHERE v.value = 1),
         count(*) FILTER (WHERE v.value = -1)
  FROM public.review_votes v
  JOIN public.reviews r ON r.id = v.review_id
  WHERE r.landlord_id = p_landlord_id AND NOT r.is_deleted
  GROUP BY v.review_id;
$$;

ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Review votes Table Policies
-- Only confirmed school-email accounts can vote, never on their own review or a deleted one.
DROP POLICY IF EXISTS "Users can see their own votes" ON public.review_votes;
CREATE POLICY "Users can see their own votes" ON public.review_votes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Students can vote on other people's reviews" ON public.review_votes;
CREATE POLICY "Students can vote on other people's reviews" ON public.review_votes
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND public.is_school_email()
    AND EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_id AND NOT r.is_deleted AND r.user_id IS DISTINCT FROM auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can change their vote" ON public.review_votes;
CREATE POLICY "Students can change their vote" ON public.review_votes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.is_school_email());

DROP POLICY IF EXISTS "Users can remove their vote" ON public.review_votes;
CREATE POLICY "Users can remove their vote" ON public.review_votes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

