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

const testSeed = readFileSync(new URL('./test-seed.sql', import.meta.url), 'utf8');

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
const NOT_GT = { id: '88888888-8888-8888-8888-888888888888', email: 'fake@notgatech.edu' };
const EMORY_ALUMNUS = { id: '99999999-9999-9999-9999-999999999999', email: 'grad@alumni.emory.edu' };
const SPELMAN_ALUMNA = { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'grad@alumnae.spelman.edu' };
const OGLETHORPE = { id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', email: 'petrel@oglethorpe.edu' };
const AMSC_STUDENT = { id: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', email: 'trojan@student.atlm.edu' };
const AGNES_SCOTT = { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'scottie@agnesscott.edu' };
const MERCER_STUDENT = { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', email: 'bear@live.mercer.edu' };
const SPELMAN = { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', email: 'jag@spelman.edu' };
const NEWCOMER = { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', email: 'newcomer@gatech.edu' };
const SECOND_GT = { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', email: 'second@gatech.edu' };
const PEER = { id: 'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd', email: 'peer@gatech.edu' };
const HOODIE = { id: 'abababab-abab-abab-abab-abababababab', email: 'hood@gatech.edu' };
const BACKDATER = { id: '12121212-1212-1212-1212-121212121212', email: 'old@gatech.edu' };
const ADMIN = { id: '33333333-3333-3333-3333-333333333333', email: 'mod@example.com' };
await db.exec(`
  INSERT INTO auth.users (id, email) VALUES ('${STUDENT.id}', '${STUDENT.email}'), ('${OTHER.id}', '${OTHER.email}'), ('${ADMIN.id}', '${ADMIN.email}'),
    ('${GSU_STUDENT.id}', '${GSU_STUDENT.email}'), ('${LOOKALIKE.id}', '${LOOKALIKE.email}'), ('${FAKE_PREFIX.id}', '${FAKE_PREFIX.email}'),
    ('${NOT_GT.id}', '${NOT_GT.email}'), ('${EMORY_ALUMNUS.id}', '${EMORY_ALUMNUS.email}'), ('${SPELMAN_ALUMNA.id}', '${SPELMAN_ALUMNA.email}'),
    ('${AGNES_SCOTT.id}', '${AGNES_SCOTT.email}'), ('${OGLETHORPE.id}', '${OGLETHORPE.email}'), ('${AMSC_STUDENT.id}', '${AMSC_STUDENT.email}'), ('${MERCER_STUDENT.id}', '${MERCER_STUDENT.email}'), ('${SPELMAN.id}', '${SPELMAN.email}'),
    ('${NEWCOMER.id}', '${NEWCOMER.email}'), ('${SECOND_GT.id}', '${SECOND_GT.email}'), ('${BACKDATER.id}', '${BACKDATER.email}'), ('${PEER.id}', '${PEER.email}'), ('${HOODIE.id}', '${HOODIE.email}');
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

const emptyCount = await db.query(`SELECT (SELECT count(*) FROM public.landlords)::int AS landlords, (SELECT count(*) FROM public.reviews)::int AS reviews`);
check('a new database starts with no landlords or reviews', emptyCount.rows[0].landlords === 0 && emptyCount.rows[0].reviews === 0);

// The tests below use fake data from scripts/test-seed.sql.
await db.exec(testSeed);
const seed = await db.query(`SELECT verification_status FROM public.reviews WHERE id = 2`);
check('test data keeps its verified review', seed.rows[0]?.verification_status === 'verified');

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

// The school tag comes from the reviewer's email, never from the website.
const taggedRow = (await db.query(`SELECT reviewer_school FROM public.reviews WHERE id = $1`, [reviewId])).rows[0];
check('a new review is tagged with the reviewer\'s school (gatech.edu -> Georgia Tech)', taggedRow?.reviewer_school === 'Georgia Tech', taggedRow?.reviewer_school);
const forgedSchool = await as(STUDENT, () => db.query(
  `UPDATE public.reviews SET reviewer_school = 'Emory' WHERE id = $1 RETURNING reviewer_school`, [reviewId]));
check('editing a review cannot change its school tag', forgedSchool.rows[0]?.reviewer_school === 'Georgia Tech', forgedSchool.rows[0]?.reviewer_school);

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
const strangerView = await as(OTHER, () => db.query(`SELECT id FROM public.reviews WHERE id = $1`, [reviewId]));
check('deleted review is hidden from other users too', strangerView.rows.length === 0);

await as(STUDENT, () => db.query(`UPDATE public.reviews SET is_deleted = false WHERE id = $1`, [reviewId]));
check('author cannot undelete a review an admin removed', (await db.query(`SELECT is_deleted FROM public.reviews WHERE id = $1`, [reviewId])).rows[0].is_deleted === true);

const restored = await as(ADMIN, () => db.query(
  `UPDATE public.reviews SET is_deleted = false WHERE id = $1 RETURNING id`, [reviewId]));
check('admin can restore a review', restored.rows.length === 1);

// Admins can edit anyone's review text; other users can't.
const adminEdit = await as(ADMIN, () => db.query(
  `UPDATE public.reviews SET comment = 'Edited by an admin' WHERE id = $1 RETURNING comment, user_id`, [reviewId]));
check('admin can edit another person\'s review', adminEdit.rows[0]?.comment === 'Edited by an admin' && adminEdit.rows[0]?.user_id === STUDENT.id);
const strangerEdit = await as(OTHER, () => db.query(
  `UPDATE public.reviews SET comment = 'Hijacked' WHERE id = $1 RETURNING id`, [reviewId]));
check('other users cannot edit someone else\'s review', strangerEdit.rows.length === 0);

// What AddLandlordPage does: new pending landlord, then an attached review.
const landlord = await as(NEWCOMER, () => db.query(
  `INSERT INTO public.landlords (name, addresses, city, status) VALUES ('Test Landlord', ARRAY['10 State St NW'], 'Atlanta', 'pending')
   RETURNING id, status`));
check('signed-in user can add a landlord', landlord.rows[0]?.status === 'pending');
const attached = await as(NEWCOMER, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment, bedrooms, verification_status, created_by_student)
   VALUES ($1, $2, 2, 2, 'Slow repairs.', 1, 'pending', true) RETURNING id`, [landlord.rows[0]?.id, NEWCOMER.id]));
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
// Each attempt uses a fresh landlord, so the one-review-per-semester rule never gets in the way.
const attempt = async (user, uid = user.id) => {
  const probe = await db.query(`INSERT INTO public.landlords (name, city, status) VALUES ('Probe landlord', 'Atlanta', 'approved') RETURNING id`);
  return as(user, () => db.query(
    `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment) VALUES ($1, $2, 3, 3, 'school check')`, [probe.rows[0].id, uid]));
};
const blocked = async (user) => { try { await attempt(user); return false; } catch { return true; } };
const landlordBlocked = async (user) => {
  try { await as(user, () => db.query(`INSERT INTO public.landlords (name, city) VALUES ('Probe', 'Atlanta')`)); return false; } catch { return true; }
};

check('a non-school email cannot post reviews', await blocked(OTHER));
check('a non-school email cannot add landlords', await landlordBlocked(OTHER));
check('a school email that is not confirmed cannot post', await blocked(UNCONFIRMED));
check('a lookalike domain (gatech.edu.evil.com) cannot post', await blocked(LOOKALIKE));
check('an address that merely starts with the domain cannot post', await blocked(FAKE_PREFIX));
check('a look-alike domain (notgatech.edu) cannot post', await blocked(NOT_GT));
check('Emory alumni addresses (alumni.emory.edu) cannot post', await blocked(EMORY_ALUMNUS));
check('Spelman alumnae addresses (alumnae.spelman.edu) cannot post', await blocked(SPELMAN_ALUMNA));
check('an Agnes Scott address can post', !(await blocked(AGNES_SCOTT)));
check('an Oglethorpe address can post', !(await blocked(OGLETHORPE)));
check('an Atlanta Metropolitan State College address (student.atlm.edu) can post', !(await blocked(AMSC_STUDENT)));
check('a Mercer student address (live.mercer.edu) can post', !(await blocked(MERCER_STUDENT)));
check('a Spelman address can post', !(await blocked(SPELMAN)));

check('admins without a school email cannot post reviews', await blocked(ADMIN));
const adminLandlord = await as(ADMIN, () => db.query(
  `INSERT INTO public.landlords (name, city, status) VALUES ('Launch Landlord', 'Atlanta', 'approved') RETURNING id`));
check('admins can add landlords without a school email', adminLandlord.rows.length === 1);
check('a subdomain address (student.gsu.edu, any capitalization) can post', !(await blocked(GSU_STUDENT)));
check('a confirmed Georgia Tech address works', !(await blocked(SECOND_GT)));

const flagged = await db.query(
  `SELECT created_by_student FROM public.reviews WHERE comment = 'school check' ORDER BY id DESC LIMIT 1`);
check('reviews from school accounts are flagged as student reviews', flagged.rows[0]?.created_by_student === true);

let domainEditBlocked = false;
try { await as(STUDENT, () => db.query(`INSERT INTO public.school_email_domains (domain, school) VALUES ('example.com', 'Fake')`)); }
catch { domainEditBlocked = true; }
const domainEdit = domainEditBlocked || (await db.query(`SELECT 1 FROM public.school_email_domains WHERE domain = 'example.com'`)).rows.length === 0;
check('website users cannot add school domains', domainEdit);

// The list of admin emails is not public.
const anonAdmins = await as(null, () => db.query(`SELECT email FROM public.admins`));
check('logged-out visitors cannot see the admin list', anonAdmins.rows.length === 0);
const strangerAdmins = await as(STUDENT, () => db.query(`SELECT email FROM public.admins`));
check('regular users cannot see the admin list', strangerAdmins.rows.length === 0);
const ownAdmin = await as(ADMIN, () => db.query(`SELECT email FROM public.admins`));
check('an admin can still see their own admin row', ownAdmin.rows.length === 1 && ownAdmin.rows[0].email === ADMIN.email);

// ---- Votes on reviews ----
const throws = async (fn) => { try { await fn(); return false; } catch { return true; } };
const castVote = (user, reviewId, value, asUserId = user?.id) => as(user, () => db.query(
  `INSERT INTO public.review_votes (review_id, user_id, value) VALUES ($1, $2, $3) RETURNING value`, [reviewId, asUserId, value]));
const countsFor = async (user, landlordId) => (await as(user, () => db.query(
  `SELECT review_id, upvotes::int AS up, downvotes::int AS down FROM public.get_review_vote_counts($1)`, [landlordId]))).rows;

check('a school-email user can upvote someone else\'s review', (await castVote(SPELMAN, reviewId, 1)).rows[0]?.value === 1);
check('the review author cannot vote on their own review', await throws(() => castVote(STUDENT, reviewId, 1)));
check('a non-school email cannot vote', await throws(() => castVote(OTHER, reviewId, 1)));
check('an unconfirmed school email cannot vote', await throws(() => castVote(UNCONFIRMED, reviewId, 1)));
check('logged-out visitors cannot vote', await throws(() => castVote(null, reviewId, 1, SPELMAN.id)));
check('users cannot vote as someone else', await throws(() => castVote(AGNES_SCOTT, reviewId, 1, OTHER.id)));
check('a vote must be up (1) or down (-1)', await throws(() => castVote(AGNES_SCOTT, reviewId, 5)));
check('one vote per person per review', await throws(() => castVote(SPELMAN, reviewId, -1)));
await castVote(AGNES_SCOTT, reviewId, -1);
const changed = await as(SPELMAN, () => db.query(`UPDATE public.review_votes SET value = -1 WHERE review_id = $1 AND user_id = $2 RETURNING value`, [reviewId, SPELMAN.id]));
check('a voter can change their vote', changed.rows[0]?.value === -1);
const stolen = await as(AGNES_SCOTT, () => db.query(`UPDATE public.review_votes SET value = 1 WHERE review_id = $1 AND user_id = $2 RETURNING value`, [reviewId, SPELMAN.id]));
check("a voter cannot change someone else's vote", stolen.rows.length === 0);
await castVote(MERCER_STUDENT, reviewId, 1);
const tally = (await countsFor(null, 1)).find((r) => r.review_id === reviewId);
check('vote totals are public and correct (1 up, 2 down)', tally?.up === 1 && tally?.down === 2, JSON.stringify(tally));
const ownVotes = await as(AGNES_SCOTT, () => db.query(`SELECT user_id FROM public.review_votes`));
check('a voter sees only their own votes, never who else voted', ownVotes.rows.length === 1 && ownVotes.rows[0].user_id === AGNES_SCOTT.id);
const anonVotes = await as(null, () => db.query(`SELECT user_id FROM public.review_votes`));
check('logged-out visitors cannot read individual votes', anonVotes.rows.length === 0);
const removed = await as(MERCER_STUDENT, () => db.query(`DELETE FROM public.review_votes WHERE review_id = $1 RETURNING user_id`, [reviewId]));
check('a voter can remove their own vote (and only theirs)', removed.rows.length === 1 && removed.rows[0].user_id === MERCER_STUDENT.id);
await db.exec(`UPDATE public.reviews SET is_deleted = true WHERE id = 3`);
check('nobody can vote on a deleted review', await throws(() => castVote(AGNES_SCOTT, 3, 1)));
await db.exec(`UPDATE public.reviews SET is_deleted = false WHERE id = 3`);

// ---- One review per person per semester (across all landlords) ----
const semesterOf = async (ts) => (await db.query(`SELECT public.semester_of($1::timestamptz) AS s`, [ts])).rows[0].s;
check('Jan-Apr is spring', (await semesterOf('2026-01-01 00:00:00-05')) === '2026-spring' && (await semesterOf('2026-04-30 12:00:00-04')) === '2026-spring');
check('May-Jul is summer', (await semesterOf('2026-05-01 12:00:00-04')) === '2026-summer' && (await semesterOf('2026-07-31 12:00:00-04')) === '2026-summer');
check('Aug-Dec is fall', (await semesterOf('2026-08-01 12:00:00-04')) === '2026-fall' && (await semesterOf('2026-12-31 12:00:00-05')) === '2026-fall');
check('semesters follow Atlanta time (10pm Apr 30 is still spring)', (await semesterOf('2026-05-01 02:00:00+00')) === '2026-spring');

const currentSemester = (await db.query(`SELECT public.semester_of(now()) AS s`)).rows[0].s;
const mine = (await db.query(`SELECT semester FROM public.reviews WHERE id = $1`, [reviewId])).rows[0];
check('a new review is stamped with the current semester', mine?.semester === currentSemester, mine?.semester);

const newReview = (user, landlordId, extra = '') => as(user, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment${extra ? ', created_at' : ''})
   VALUES ($1, $2, 3, 3, 'Another review'${extra ? `, '${extra}'` : ''}) RETURNING id, semester, created_at`, [landlordId, user.id]));
const dup = await (async () => { try { await newReview(STUDENT, 1); return null; } catch (e) { return e.message; } })();
check('a second review this semester is blocked', Boolean(dup) && dup.includes('idx_reviews_one_per_semester'), dup ?? 'was allowed');
const otherLandlordId = adminLandlord.rows[0].id;
check('the limit is per person, not per landlord: a different landlord is blocked too', await throws(() => newReview(STUDENT, otherLandlordId)));
check('a different person can still review the same landlord', (await newReview(PEER, 1)).rows.length === 1);

const backdated = await newReview(BACKDATER, 1, '2020-01-01 12:00:00+00');
check('a made-up past date is ignored (review is dated now)', backdated.rows[0]?.semester === currentSemester && new Date(backdated.rows[0].created_at).getFullYear() >= 2026, backdated.rows[0]?.semester);
check('backdating cannot dodge the limit', await throws(() => newReview(BACKDATER, otherLandlordId, '2020-01-01 12:00:00+00')));

const sneaky = await as(STUDENT, () => db.query(
  `UPDATE public.reviews SET semester = '2020-fall', created_at = '2020-01-01' WHERE id = $1 RETURNING semester, created_at`, [reviewId]));
check('editing cannot change the semester or date',
  sneaky.rows[0]?.semester === currentSemester && new Date(sneaky.rows[0].created_at).getFullYear() >= 2026);

// A reviewer can delete their own review (no RETURNING: they can't read it back once deleted)...
const peerReview = (await db.query(`SELECT id FROM public.reviews WHERE user_id = $1 AND NOT is_deleted`, [PEER.id])).rows[0].id;
await as(PEER, () => db.query(`UPDATE public.reviews SET is_deleted = true WHERE id = $1`, [peerReview]));
check('a reviewer can delete their own review', (await db.query(`SELECT is_deleted FROM public.reviews WHERE id = $1`, [peerReview])).rows[0].is_deleted === true);
check('after deleting their review, the reviewer can write a new one this semester', (await newReview(PEER, otherLandlordId)).rows.length === 1);
// ...but not someone else's, and not bring a deleted one back.
await as(PEER, () => db.query(`UPDATE public.reviews SET is_deleted = true WHERE id = $1`, [reviewId]));
check("a reviewer cannot delete someone else's review", (await db.query(`SELECT is_deleted FROM public.reviews WHERE id = $1`, [reviewId])).rows[0].is_deleted === false);
await as(PEER, () => db.query(`UPDATE public.reviews SET is_deleted = false WHERE id = $1`, [peerReview]));
check('a reviewer cannot bring back a deleted review', (await db.query(`SELECT is_deleted FROM public.reviews WHERE id = $1`, [peerReview])).rows[0].is_deleted === true);

await db.query(`INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment, created_at)
  VALUES (1, $1, 4, 4, 'A review from a past semester', '2025-01-10 12:00:00+00')`, [STUDENT.id]);
const priorSemester = (await db.query(`SELECT semester FROM public.reviews WHERE comment = 'A review from a past semester'`)).rows[0];
check('an earlier semester does not block a new review (2025-spring)', priorSemester?.semester === '2025-spring');

await as(ADMIN, () => db.query(`UPDATE public.reviews SET is_deleted = true WHERE id = $1`, [reviewId]));
check('after an admin removes a review, the author can post again that semester', (await newReview(STUDENT, otherLandlordId)).rows.length === 1);
check('an admin cannot restore a review that would break the one-per-semester rule', await throws(() => as(ADMIN, () => db.query(`UPDATE public.reviews SET is_deleted = false WHERE id = $1`, [reviewId]))));

// ---- Neighborhoods on reviews ----
const hoodReview = await as(HOODIE, () => db.query(
  `INSERT INTO public.reviews (landlord_id, user_id, landlord_rating, building_rating, comment, neighborhood)
   VALUES (1, $1, 4, 4, 'Great spot', 'Home Park') RETURNING id, neighborhood`, [HOODIE.id]));
check('a review keeps the neighborhood the reviewer picked', hoodReview.rows[0]?.neighborhood === 'Home Park');
const hoodEdit = await as(HOODIE, () => db.query(`UPDATE public.reviews SET neighborhood = 'Midtown' WHERE id = $1 RETURNING neighborhood`, [hoodReview.rows[0].id]));
check('the reviewer can change their review\'s neighborhood', hoodEdit.rows[0]?.neighborhood === 'Midtown');
check('an absurdly long neighborhood is rejected', await throws(() => as(HOODIE, () => db.query(`UPDATE public.reviews SET neighborhood = $1 WHERE id = $2`, ['x'.repeat(101), hoodReview.rows[0].id]))));

// ---- Deleting landlords (admin only) ----
const delTarget = await db.query(`INSERT INTO public.landlords (name, city, status) VALUES ('Delete me', 'Atlanta', 'approved') RETURNING id`);
// Same shape as SupabaseApiService.deleteLandlord: update, then read the row back.
const softDeleteLandlord = (user, id) => as(user, () => db.query(
  `UPDATE public.landlords SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id`, [id]));
check('a regular student cannot delete a landlord', await (async () => { try { return (await softDeleteLandlord(STUDENT, delTarget.rows[0].id)).rows.length === 0; } catch { return true; } })());
const adminDeleted = await (async () => { try { return (await softDeleteLandlord(ADMIN, delTarget.rows[0].id)).rows.length === 1; } catch (e) { return e.message; } })();
check('an admin can delete a landlord', adminDeleted === true, String(adminDeleted));
check('a deleted landlord is hidden from visitors', (await as(null, () => db.query(`SELECT id FROM public.landlords WHERE id = $1`, [delTarget.rows[0].id]))).rows.length === 0);

// ---- Neighborhoods on landlords ----
const tagged = await as(STUDENT, () => db.query(
  `INSERT INTO public.landlords (name, addresses, city, neighborhoods) VALUES ('Tagged Landlord', ARRAY['No Known Street'], 'Atlanta', ARRAY['Home Park']) RETURNING id, neighborhoods`));
check('a landlord keeps the neighborhoods it was added with', tagged.rows[0]?.neighborhoods?.[0] === 'Home Park');
const studentRetag = await as(STUDENT, () => db.query(`UPDATE public.landlords SET neighborhoods = ARRAY['Midtown'] WHERE id = $1 RETURNING id`, [tagged.rows[0].id]));
check('students cannot re-tag a landlord', studentRetag.rows.length === 0);
const adminRetag = await as(ADMIN, () => db.query(`UPDATE public.landlords SET neighborhoods = ARRAY['Midtown', 'Home Park'] WHERE id = $1 RETURNING neighborhoods`, [tagged.rows[0].id]));
check('admins can re-tag a landlord', adminRetag.rows[0]?.neighborhoods?.length === 2);

// The domain lists in init.sql must match siteSettings.ts, which the sign-up form uses.
const settings = readFileSync(new URL('../siteSettings.ts', import.meta.url), 'utf8');
const quoted = (text) => [...text.matchAll(/"([^"]+)"/g)].map((d) => d[1].toLowerCase());
const siteAllowed = [...settings.matchAll(/emailDomains:\s*\[([^\]]*)\]/g)].flatMap((m) => quoted(m[1])).sort();
const siteBlocked = quoted(settings.match(/blockedEmailDomains:\s*\[([^\]]*)\]/)?.[1] ?? '').sort();
const dbRows = (await db.query(`SELECT domain, blocked FROM public.school_email_domains ORDER BY domain`)).rows;
const dbAllowed = dbRows.filter((r) => !r.blocked).map((r) => r.domain);
const dbBlocked = dbRows.filter((r) => r.blocked).map((r) => r.domain);
check('accepted school domains in init.sql match siteSettings.ts', JSON.stringify(siteAllowed) === JSON.stringify(dbAllowed),
  `settings: ${siteAllowed.join(', ')} | database: ${dbAllowed.join(', ')}`);
check('blocked alumni domains in init.sql match siteSettings.ts', JSON.stringify(siteBlocked) === JSON.stringify(dbBlocked),
  `settings: ${siteBlocked.join(', ')} | database: ${dbBlocked.join(', ')}`);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
await db.close();
process.exitCode = failures === 0 ? 0 : 1;
