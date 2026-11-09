# Launch checklist: real data on rateyallslandlord.com

Keep [handoff.md](handoff.md) up to date as each service is set up; it is the one-pager for whoever takes over. Everything uses free plans except the domain. **You** = steps that need the site owner (account sign-ups, payment, pasting secret keys). **Code** = changes made in this repository. Day-to-day data tasks (making an admin, adding landlords, cleaning up test data, backups) are in [data_cheatsheet.md](data_cheatsheet.md).

## Done

- [x] Domain bought (Cloudflare), paid with a limited virtual card.
- [x] Supabase project created, with the database set up and **empty** (no sample data). The upgrade script `migrations/2026-11-09-school-email-only-posting.sql` has been run.
- [x] Turnstile widget created and CAPTCHA protection turned on in Supabase; login, sign-up, resend-confirmation, and password-reset requests send the token for server-side checking.
- [x] Mapbox token created.
- [x] Site code merged to `main` and deployed by Cloudflare (a Worker named `rateyallslandlord`).
- [x] School picker with ten schools: Georgia Tech, Georgia State, Emory, Morehouse, Spelman, Clark Atlanta, Morehouse School of Medicine, SCAD, Agnes Scott, Mercer.
- [x] Only confirmed school-email accounts can post reviews or add landlords (subdomains count, alumni addresses are blocked); admins can add landlords but not post reviews, so every review is from a verified school email. The site says so on landlord pages, the FAQ, and the About page.
- [x] Reviewer privacy: unit numbers are removed before a review is saved and never shown, and the list of admin emails is not public.
- [x] Sign-up bot-check fix, Gmail sending, and the live address `rateyallslandlord.com` work (the confirmation email can land in spam at some schools).
- [x] Contact address (rateyallslandlord@gmail.com) is on the About and Contact pages and in the legal pages.

## To do before inviting real users

**Run this first (new features need it)**

- [ ] **You:** Run `migrations/2026-11-10-semester-votes-neighborhoods.sql` in Supabase (SQL Editor -> New query -> paste -> Run) **before** the new site version goes live. It adds: one review per person per semester, up/down votes on reviews, and a neighborhood on every review and on each landlord (so a landlord shows up under the neighborhoods it was added to or reviewed in). Safe to run more than once. Landlords you already added need their neighborhood set once: use **Edit neighborhoods** on the landlord's page as an admin, or the SQL in [data_cheatsheet.md](data_cheatsheet.md) section 2.

**Email and addresses**

- [x] **You:** Set up Gmail sending in Supabase (Authentication → Emails → SMTP Settings: host `smtp.gmail.com`, port `587`, the Gmail address as username and sender, and a Google *app password*). Without it nobody receives confirmation emails. [Guide, part 5](replication_guide.md#configure-confirmation-and-password-reset-email).
- [ ] **You:** Set Supabase's **Site URL** and **Redirect URLs** to the live address (Authentication → URL Configuration): `https://ADDRESS/verify-email?verification=1` and `https://ADDRESS/reset-password`. They still point at `localhost`.
- [ ] **You:** Add the live address to the Turnstile widget's hostnames.
- [x] **Decision:** the Mapbox token is **not** URL-restricted, on purpose. Mapbox only lets you create a restricted token after adding a payment card, and with no card on file Mapbox cannot bill anyone. The cost of leaving it is that someone could use up the free monthly allowance, which would pause address suggestions until the next month (people can still type addresses by hand). Don't add a card to Mapbox.
- [ ] **You:** Attach `rateyallslandlord.com` to the Cloudflare Worker (Settings → Domains & Routes → Add → Custom domain), then repeat the three steps above with the custom domain.
- [ ] **You:** Delete the duplicate Cloudflare project `rateyallslandlordmain` (it only shows failed builds).
- [ ] **You:** In Cloudflare, check the build variables (Settings → Build → Variables and secrets) are the five from [guide, part 8](replication_guide.md#8-publish-a-trial-site-with-cloudflare-pages). With them missing, the site shows "Demo mode" with fake landlords.

**Legal pages** (the Terms and Privacy Policy came from a template)

- [x] **Code:** Website name, contact email, and website address are filled in.
- [ ] **You:** Decide and fill in what is still blank: the **operator's name** (about 95 places), a **governing law** (for example "the State of Georgia"), the **court venue**, a **mailing address** for legal notices, and the **translation service** named in the Terms. Ask More Perfect University or a lawyer whether the template's arbitration and class-action sections suit a student project.

**Real data**

- [ ] **You:** Sign up on the live site with your school email, then make yourself an admin ([data_cheatsheet.md](data_cheatsheet.md), section 1).
- [ ] **You:** Add the landlords to list at launch (section 2 of the cheat-sheet), then approve them at `/admin`.
- [ ] **You:** Run the end-to-end test from [guide, part 11](replication_guide.md#11-test-before-sharing): sign up, confirm email, log in, reset password, post a review, approve it. Then delete the test review and test accounts (cheat-sheet section 4).
- [ ] **You:** Export a backup of the tables (cheat-sheet section 5) and put a reminder in your calendar to repeat it. Also a reminder a month before the domain renews.

## Open decisions

- `gsu.edu` also covers Georgia State faculty and staff, and `mercer.edu` also covers Mercer's other campuses (such as Macon), so those users can post too.
- The SCAD and Morehouse School of Medicine student email domains are listed but not confirmed; check with a student at each school.
- Each review carries a random reviewer ID, visible only through the public database address. It doesn't name anyone, but it lets someone link one person's reviews together. Hiding it needs a bigger database change.
