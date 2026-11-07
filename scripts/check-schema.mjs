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
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
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
const ADMIN = { id: '33333333-3333-3333-3333-333333333333', email: 'mod@example.com' };
await db.exec(`
  INSERT INTO auth.users VALUES ('${STUDENT.id}', '${STUDENT.email}'), ('${OTHER.id}', '${OTHER.email}'), ('${ADMIN.id}', '${ADMIN.email}');
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

// Posting needs a school email (or an admin account).
const blocked = async (name, user, sql, params = []) => {
  let wasBlocked = false;
  try { await as(user, () => db.query(sql, params)); } catch { wasBlocked = true; }
  check(name, wasBlocked);
};
const reviewInsert = `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment)
  VALUES (1, $1, 3, 3, 'Okay place.')`;
await blocked('logged-out visitors cannot post reviews', null,
  `INSERT INTO public.reviews (landlord_id, landlord_rating, building_rating, comment) VALUES (1, 3, 3, 'Anon review.')`);
await blocked('non-school emails cannot post reviews', OTHER, reviewInsert, [OTHER.id]);
await blocked('non-school emails cannot add landlords', OTHER,
  `INSERT INTO public.landlords (name, city) VALUES ('Other Landlord', 'Atlanta')`);
await blocked('students cannot post a review as someone else', STUDENT, reviewInsert, [OTHER.id]);

const SUBDOMAIN = { id: '44444444-4444-4444-4444-444444444444', email: 'panther@student.gsu.edu' };
const LOOKALIKE = { id: '55555555-5555-5555-5555-555555555555', email: 'fake@notgatech.edu' };
await db.exec(`INSERT INTO auth.users VALUES ('${SUBDOMAIN.id}', '${SUBDOMAIN.email}'), ('${LOOKALIKE.id}', '${LOOKALIKE.email}')`);
const subdomainPost = await as(SUBDOMAIN, () => db.query(`${reviewInsert} RETURNING id`, [SUBDOMAIN.id]));
check('school subdomain emails (student.gsu.edu) can post', subdomainPost.rows.length === 1);
await blocked('look-alike domains (notgatech.edu) cannot post', LOOKALIKE, reviewInsert, [LOOKALIKE.id]);

const adminPost = await as(ADMIN, () => db.query(`${reviewInsert} RETURNING id`, [ADMIN.id]));
check('admins can post without a school email', adminPost.rows.length === 1);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
await db.close();
process.exitCode = failures === 0 ? 0 : 1;
