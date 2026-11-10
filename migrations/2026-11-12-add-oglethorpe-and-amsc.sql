-- Adds two schools: Oglethorpe University and Atlanta Metropolitan State College.
-- Only accounts with a confirmed email at these domains (or their subdomains) can post.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Safe to run more than once.
-- New databases don't need this: init.sql already includes it.

INSERT INTO public.school_email_domains (domain, school, blocked) VALUES
  ('oglethorpe.edu', 'Oglethorpe University', false),
  ('atlm.edu', 'Atlanta Metropolitan State College', false)
ON CONFLICT (domain) DO NOTHING;
