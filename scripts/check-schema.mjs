// Runs init.sql in real Postgres (PGlite) with Supabase-style auth stubs, then
// exercises the review flows the website uses. Run with: npm run check:schema
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../init.sql', import.meta.url), 'utf8');
const db = new PGlite();

// Minimal versions of what Supabase provides: roles, auth.users, auth.uid/jwt/role.
await db.exec(`
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz DEFAULT now());
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
    $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (auth.jwt() ->> 'sub')::uuid $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT auth.jwt() ->> 'role' $$;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated;
  GRANT USAGE ON SCHEMA public TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
`);

try {
  await db.exec(sql);
  console.log('PASS init.sql runs');
} catch (e) {
  console.log('FAIL init.sql:', e.message);
  process.exit(1);
}

const STUDENT = { id: '11111111-1111-1111-1111-111111111111', email: 'student@gatech.edu' };
const OTHER = { id: '22222222-2222-2222-2222-222222222222', email: 'other@example.com' };
const GSU_STUDENT = { id: '44444444-4444-4444-4444-444444444444', email: 'Someone@Student.GSU.edu' };
const UNCONFIRMED = { id: '55555555-5555-5555-5555-555555555555', email: 'new@gatech.edu' };
const LOOKALIKE = { id: '66666666-6666-6666-6666-666666666666', email: 'x@gatech.edu.evil.com' };
const FAKE_PREFIX = { id: '77777777-7777-7777-7777-777777777777', email: 'gatech.edu@gmail.com' };
const ADMIN = { id: '33333333-3333-3333-3333-333333333333', email: 'mod@example.com' };
await db.exec(`
  INSERT INTO auth.users (id, email) VALUES ('${STUDENT.id}', '${STUDENT.email}'), ('${OTHER.id}', '${OTHER.email}'), ('${ADMIN.id}', '${ADMIN.email}'),
    ('${GSU_STUDENT.id}', '${GSU_STUDENT.email}'), ('${LOOKALIKE.id}', '${LOOKALIKE.email}'), ('${FAKE_PREFIX.id}', '${FAKE_PREFIX.email}');
  INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ('${UNCONFIRMED.id}', '${UNCONFIRMED.email}', NULL);
  INSERT INTO public.admins (email) VALUES ('${ADMIN.email}');
`);

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
};

// Run queries as a website visitor: role switch plus JWT claims, like PostgREST does.
async function as(user, fn) {
  const claims = user ? { sub: user.id, email: user.email, role: 'authenticated' } : { role: 'anon' };
  await db.exec(`SET ROLE ${user ? 'authenticated' : 'anon'}`);
  await db.query(`SELECT set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims)]);
  try { return await fn(); } finally { await db.exec('RESET ROLE'); }
}

const seed = await db.query(`SELECT verification_status FROM public.reviews WHERE id = 2`);
check('seed data keeps its verified review', seed.rows[0]?.verification_status === 'verified');

// What AddReviewPage sends, including a forged 'verified' status.
const inserted = await as(STUDENT, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment, would_rent_again,
     rent_amount, bedrooms, property_address, verification_status, created_by_student, tags)
   VALUES (1, $1, 4, 3, 'Fixed the AC within a day.', true, 1250, 2, '123 Hemphill Ave NW', 'verified', true, ARRAY['Communicative'])
   RETURNING id, bedrooms, verification_status, created_by_student`, [STUDENT.id]));
const reviewId = inserted.rows[0]?.id;
check('student can submit a review with bedrooms', inserted.rows[0]?.bedrooms === 2);
check('new review starts as pending even if client says verified', inserted.rows[0]?.verification_status === 'pending');
check('student flag is saved', inserted.rows[0]?.created_by_student === true);

// What EditReviewPage sends, plus an attempt to self-verify.
const edited = await as(STUDENT, () => db.query(
  `UPDATE public.reviews SET comment = 'Edited comment', bedrooms = 3, verification_status = 'verified'
   WHERE id = $1 RETURNING comment, bedrooms, verification_status`, [reviewId]));
check('author can edit their review', edited.rows[0]?.comment === 'Edited comment' && edited.rows[0]?.bedrooms === 3);
check('author cannot verify their own review', edited.rows[0]?.verification_status === 'pending');

const hijack = await as(OTHER, () => db.query(
  `UPDATE public.reviews SET comment = 'hijacked' WHERE id = $1 RETURNING id`, [reviewId]));
check("another user cannot edit someone else's review", hijack.rows.length === 0);

// Admin page actions: verify, soft delete, restore.
const verified = await as(ADMIN, () => db.query(
  `UPDATE public.reviews SET verification_status = 'verified' WHERE id = $1 RETURNING verification_status`, [reviewId]));
check('admin can verify a review', verified.rows[0]?.verification_status === 'verified');

const deleted = await as(ADMIN, () => db.query(
  `UPDATE public.reviews SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id`, [reviewId]));
check('admin can delete a review', deleted.rows.length === 1);

const publicView = await as(null, () => db.query(`SELECT id FROM public.reviews WHERE id = $1`, [reviewId]));
check('deleted review is hidden from visitors', publicView.rows.length === 0);

const authorRestore = await as(STUDENT, () => db.query(
  `UPDATE public.reviews SET is_deleted = false WHERE id = $1 RETURNING id`, [reviewId]));
check('author cannot undelete a review an admin removed', authorRestore.rows.length === 0);

const restored = await as(ADMIN, () => db.query(
  `UPDATE public.reviews SET is_deleted = false WHERE id = $1 RETURNING id`, [reviewId]));
check('admin can restore a review', restored.rows.length === 1);

// What AddLandlordPage does: new pending landlord, then an attached review.
const landlord = await as(STUDENT, () => db.query(
  `INSERT INTO public.landlords (name, addresses, city, status) VALUES ('Test Landlord', ARRAY['10 State St NW'], 'Atlanta', 'pending')
   RETURNING id, status`));
check('signed-in user can add a landlord', landlord.rows[0]?.status === 'pending');
const attached = await as(STUDENT, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment, bedrooms, verification_status, created_by_student)
   VALUES ($1, $2, 2, 2, 'Slow repairs.', 1, 'pending', true) RETURNING id`, [landlord.rows[0]?.id, STUDENT.id]));
check('review attached to a new landlord saves', attached.rows.length === 1);

let anonLandlordBlocked = false;
try {
  await as(null, () => db.query(`INSERT INTO public.landlords (name, city) VALUES ('Anon', 'Atlanta')`));
} catch { anonLandlordBlocked = true; }
check('logged-out visitors cannot add landlords', anonLandlordBlocked);

let anonReviewBlocked = false;
try {
  await as(null, () => db.query(
    `INSERT INTO public.reviews (landlord_id, landlord_rating, building_rating, comment) VALUES (1, 1, 1, 'spam')`));
} catch { anonReviewBlocked = true; }
check('logged-out visitors cannot post reviews', anonReviewBlocked);

let impersonationBlocked = false;
try {
  await as(OTHER, () => db.query(
    `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment) VALUES (1, '${STUDENT.id}', 1, 1, 'fake')`));
} catch { impersonationBlocked = true; }
check('users cannot post reviews under someone else\'s account', impersonationBlocked);

// Only confirmed school-email accounts can post.
const attempt = (user, uid = user.id) => as(user, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment) VALUES (1, $1, 3, 3, 'school check')`, [uid]));
const blocked = async (user) => { try { await attempt(user); return false; } catch { return true; } };
const landlordBlocked = async (user) => {
  try { await as(user, () => db.query(`INSERT INTO public.landlords (name, city) VALUES ('Probe', 'Atlanta')`)); return false; } catch { return true; }
};

check('a non-school email cannot post reviews', await blocked(OTHER));
check('a non-school email cannot add landlords', await landlordBlocked(OTHER));
check('a school email that is not confirmed cannot post', await blocked(UNCONFIRMED));
check('a lookalike domain (gatech.edu.evil.com) cannot post', await blocked(LOOKALIKE));
check('an address that merely starts with the domain cannot post', await blocked(FAKE_PREFIX));
check('a Georgia State student address works (any capitalization)', !(await blocked(GSU_STUDENT)));
check('a confirmed Georgia Tech address works', !(await blocked(STUDENT)));

const flagged = await db.query(
  `SELECT created_by_student FROM public.reviews WHERE comment = 'school check' ORDER BY id DESC LIMIT 1`);
check('reviews from school accounts are flagged as student reviews', flagged.rows[0]?.created_by_student === true);

let domainEditBlocked = false;
try { await as(STUDENT, () => db.query(`INSERT INTO public.school_email_domains (domain, school) VALUES ('example.com', 'Fake')`)); }
catch { domainEditBlocked = true; }
const domainEdit = domainEditBlocked || (await db.query(`SELECT 1 FROM public.school_email_domains WHERE domain = 'example.com'`)).rows.length === 0;
check('website users cannot add school domains', domainEdit);

// The domain list in init.sql must match siteSettings.ts, which the registration form uses.
const settings = readFileSync(new URL('../siteSettings.ts', import.meta.url), 'utf8');
const siteDomains = [...settings.matchAll(/emailDomains:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((d) => d[1].toLowerCase())).sort();
const dbDomains = (await db.query(`SELECT domain FROM public.school_email_domains ORDER BY domain`)).rows.map((r) => r.domain);
check('school domains in init.sql match siteSettings.ts', JSON.stringify(siteDomains) === JSON.stringify(dbDomains),
  `settings: ${siteDomains.join(', ')} | database: ${dbDomains.join(', ')}`);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
await db.close();
process.exitCode = failures === 0 ? 0 : 1;
