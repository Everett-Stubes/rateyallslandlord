# Launch checklist: real data on rateyallslandlord.com

Everything here uses free plans except the domain. **You** = steps that need the site owner (account sign-ups, payment, pasting secret keys). **Code** = changes made in this repository.

## 1. Domain (the only cost)

- [ ] **You:** Ask More Perfect University first. The playbook says they will pay for a domain for at least two years.
- [ ] **You:** Check that `rateyallslandlord.com` is available. Pick one or two backups and add them to [website_customization.md](website_customization.md).
- [ ] **You:** Buy it through **Cloudflare Registrar** (sold at cost, about $10–11 a year for a .com; check at checkout). It then uses the same Cloudflare account as the hosting.
- [ ] **You:** Pay with the virtual card. Load about $15 for one year or $25 for two, and lock the card to Cloudflare if your bank allows it.
- [ ] **You:** Cloudflare auto-renews. Put a calendar reminder one month before the renewal date to make sure the card has money, or the domain can lapse.
- [ ] **You:** Turn on two-step login (2FA) for Cloudflare, Supabase, and GitHub.

Your name and address on the domain registration are hidden from the public lookup by Cloudflare by default.

## 2. Database: Supabase (free)

- [ ] **You:** Create a Supabase account and project ([guide, part 4](replication_guide.md#4-create-a-supabase-project)).
- [ ] **You:** Paste `init.sql` into the SQL Editor and run it.
- [ ] **You:** Delete the fake landlord and reviews (they're labelled "fake") before launch.
- [ ] **You:** Register on the site, then add your email to the `admins` table so you can approve reviews at `/admin`.
- [ ] **You:** Download a backup of the data now and then. The free plan has no automatic backups, and it pauses a project after about a week with no visitors.

## 3. Email

- [ ] **You:** Set up a free email-sending service (for example Resend or Brevo), verify the domain with it, and enter its SMTP settings in Supabase ([guide, part 5](replication_guide.md#configure-confirmation-and-password-reset-email)). Supabase's built-in sender can't email the public. Needs the domain first.
- [ ] **You:** Turn on Cloudflare **Email Routing** so an address like `hello@rateyallslandlord.com` forwards to your inbox.
- [ ] **Code:** Put that contact address on the About page (it still says `[insert email here]`).
- [ ] **Decide:** Do you want a "get updates" mailing-list form for people who don't create an account? Accounts' emails are already stored by Supabase.

## 4. Hosting: Cloudflare Pages (free)

- [ ] **You:** Create a Turnstile widget and copy its sitekey and secret key ([guide, part 6](replication_guide.md#6-set-up-cloudflare-turnstile)).
- [ ] **You:** In Supabase, turn on CAPTCHA protection with the Turnstile **secret** key ([guide](replication_guide.md#turn-on-server-side-checking-in-supabase)).
- [ ] **You:** Create a Mapbox account and copy a public `pk.` token ([guide, part 7](replication_guide.md#7-set-up-mapbox-address-suggestions)).
- [ ] **You:** Connect this GitHub repository to Cloudflare Pages with the five settings in [guide, part 8](replication_guide.md#8-publish-a-trial-site-with-cloudflare-pages).
- [ ] **You:** Attach the domain, then add it to Supabase redirect URLs, Turnstile, and Mapbox ([parts 9–10](replication_guide.md#9-connect-your-domain)).

## 5. Before inviting real users

- [x] **Code:** Login, sign-up, resend-confirmation, and password-reset requests send the Turnstile token to Supabase for server-side checking.
- [x] **Code:** Database rules allow only signed-in accounts to post reviews, as themselves.
- [ ] **Code + you:** Review the Privacy Policy and Terms. They came from the template.
- [ ] **You:** Fill in the landlords to list at launch in [website_customization.md](website_customization.md).
- [ ] **You:** Run the checks in [guide, part 11](replication_guide.md#11-test-before-sharing): sign up, confirm email, log in, reset password, post a review, approve it.
