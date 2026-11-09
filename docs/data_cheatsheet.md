# Working with the real data

How to run the site's data from Supabase, with copy-paste steps. Open Supabase → your project → **SQL Editor → New query**, paste, and click **Run**. These run as the project owner, so they work on everything; double-check before running anything that deletes.

**The database starts empty.** `init.sql` adds no sample landlords or reviews. The fake landlords you may see on a local copy appear only in demo mode (when the Supabase settings are missing), never from the real database.

## 1. Make yourself an admin

Admins approve landlords and reviews at `/admin`. An admin has to sign up on the site first, with a school email, because the sign-up form only accepts school emails.

1. On the live site, sign up with your school email and click the confirmation link in the email.
2. In the SQL Editor, run (use the exact email you signed up with):

   ```sql
   insert into public.admins (email) values ('you@gatech.edu');
   ```

3. On the site, log out and log back in, then open `/admin`.

To see or remove admins:

```sql
select * from public.admins;
delete from public.admins where email = 'old.admin@gatech.edu';
```

Admins can add landlords with any email, but only school-email accounts can post reviews.

## 2. Add the landlords to list at launch

Easiest: log in as an admin, use **Add a landlord** on the site, then approve each one at `/admin`.

Faster for a long list: run this, with one row per landlord (the addresses are the buildings, without unit numbers):

```sql
insert into public.landlords (name, addresses, city, status) values
  ('Example Property Management', array['123 Example St NW', '456 Sample Ave NE'], 'Atlanta', 'approved'),
  ('Another Landlord LLC', array['789 Placeholder Rd SE'], 'Atlanta', 'approved');
```

Each landlord also has a **neighborhoods** list, which is how it shows up when someone clicks a neighborhood on the home page. The site also guesses from the street addresses, but the list is what you set. In the SQL above, add it as a column (names must match the ones in `siteSettings.ts` exactly, such as `Home Park`):

```sql
insert into public.landlords (name, addresses, city, status, neighborhoods) values
  ('Example Property Management', array['123 Hemphill Ave NW'], 'Atlanta', 'approved', array['Home Park']);
```

To fix an existing landlord that doesn't show up under its neighborhood (or use **Edit neighborhoods** on its page when logged in as an admin):

```sql
update public.landlords set neighborhoods = array['Home Park'] where name = 'Example Property Management';
```

## 3. See what is in the database

```sql
select
  (select count(*) from public.landlords where not is_deleted) as landlords,
  (select count(*) from public.reviews where not is_deleted) as reviews,
  (select count(*) from public.reviews where verification_status = 'pending') as reviews_waiting_for_approval,
  (select count(*) from auth.users) as accounts;
```

## 4. Clean up after testing

Before launch, test with your own account, then remove the test data. Look first, then delete only the rows you recognize.

```sql
-- 1. Look at what is there.
select id, landlord_id, comment, created_at from public.reviews order by id;
select id, name from public.landlords order by id;

-- 2. Delete the test rows by id (replace the numbers).
delete from public.reviews where id in (1, 2);
delete from public.landlords where id in (1);
```

Test accounts are removed in the dashboard under **Authentication → Users** (click the three dots next to the user → **Delete user**). Don't delete your own admin account.

## 5. Back up the data

The free Supabase plan makes no automatic backups. Every few months, and before any big change, open **Table Editor**, pick `landlords`, then `reviews`, and use **Export → Download as CSV** on each. Keep the files somewhere private: reviews are tied to anonymous account IDs but still belong to your users.

## 6. Reviews: one per semester, and votes

- Each person gets **one review per landlord per semester** (spring = Jan-Apr, summer = May-Jul, fall = Aug-Dec, Atlanta time). The database enforces it, and the site explains why when someone tries a second one. A person can edit their review any time.
- If an admin removes a review at `/admin`, that person can post again that semester. Restoring the removed review is then refused while the newer one exists.
- Up/down votes never change a landlord's grade. Only confirmed school-email accounts can vote, never on their own review. To see raw totals:

  ```sql
  select review_id, sum((value = 1)::int) as up, sum((value = -1)::int) as down
  from public.review_votes group by review_id order by review_id;
  ```

## 7. If a review or landlord needs removing

Admins can delete and restore reviews and landlords at `/admin`. Deleted items are hidden from visitors but kept in the database (they're marked `is_deleted`). To remove something permanently, use the SQL above.
