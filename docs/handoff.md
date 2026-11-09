# Handoff one-pager: how Rate Y'all's Landlord runs

**Last updated:** 2026-11-09. Update the TBD rows as each service is set up.
**Passwords are not in this file.** Every login lives in the team password manager (see "Where the logins live"). This repository is on GitHub; never put passwords, app passwords, or secret keys in it.

## What it is

A free review site for Atlanta renters (Georgia Tech, Georgia State). Visitors browse landlords; students sign up with a school email, confirm it, then post reviews. An admin approves reviews before they show as verified. The only recurring cost is the domain (about $10–11 a year).

## How the pieces fit

```
Student's browser ──> Cloudflare Pages (the website, built from GitHub)
                         │
                         ├─> Supabase (database + accounts + sign-up emails)
                         │       └─> Gmail (sends the confirmation / reset emails)
                         ├─> Cloudflare Turnstile (bot check on forms; Supabase verifies it)
                         └─> Mapbox (address suggestions on forms)
Domain: bought and managed in Cloudflare Registrar
```

When someone edits the code on GitHub's `main` branch, Cloudflare Pages rebuilds and republishes the site by itself.

## Accounts

| Service | What it does | Login method | Cost | Status / key facts |
| --- | --- | --- | --- | --- |
| GitHub | Holds the code; Supabase login also uses it | Everett's GitHub, 2-step on | Free | Repo: `Everett-Stubes/rateyallslandlord` |
| Cloudflare | Domain, hosting (Pages), bot check (Turnstile), DNS | Email + 2-step (authenticator app) | Domain only | Domain: rateyallslandlord.com, registered 2026-11-09. Renews: **TBD (check Cloudflare → Domain Registration)**. Pages address: **TBD** |
| Supabase | Database, user accounts, sign-up emails | "Continue with GitHub" | Free | Project ref `ywgbwddksbvsaoxycwmv`, region East US. URL `https://ywgbwddksbvsaoxycwmv.supabase.co` |
| Gmail (team address) | Sends confirmation and password-reset emails; contact address | Email + password + 2-step | Free | Address: **TBD**. Uses an *app password* (see below) |
| Mapbox | Address suggestions | **TBD** | Free tier | Public token starts `pk.`; limited to the site's web addresses |
| Turnstile | Bot check | Part of Cloudflare | Free | Sitekey: `0x4AAAAAAF6fq7QhK5vwxdeG` (public). Secret key is stored in Supabase only |

Public values (safe to see; they ship inside the website): the Supabase URL above, the Supabase publishable key `sb_publishable_l2BqAp-7bi-rzNeLlp1ULA_6FGFMTy0`, the Turnstile sitekey, and the Mapbox `pk.` token. These are set as build variables in Cloudflare Pages (see `docs/replication_guide.md`, part 8).

## Where the logins live

Keep one shared vault in a password manager that supports sharing (Bitwarden's free plan allows a two-person shared vault). Store in it:

- Cloudflare login **and** its backup codes
- GitHub login and backup codes
- Gmail login, its 2-step phone/backup codes, and the **app password** (Google shows it only once; if lost, make a new one and update Supabase's SMTP settings)
- Supabase database password (not used by the website; needed only for direct database access)
- Mapbox login
- The virtual card details

Two-step codes are tied to a phone. Before handing off, move each authenticator entry to the new person's phone or give them the backup codes, and change the phone number on the Gmail account.

## Credentials sheet (fill in on a PRIVATE copy)

> **Do not type real passwords into this file and commit it.** This repository is on GitHub, and anything committed stays in its history even if you delete it later. Fill this sheet in on a printed copy, in a private note, or on the password manager's secure-note page, and keep the blanks here empty. Print this section and write on it, or paste it into a private document that only you and the next owner can open.

For every row: the **where** column says where to find or create it. Write the value in the blank.

| Item | Where it comes from | Value |
| --- | --- | --- |
| Password manager master password | Chosen when the vault is created | ______________________ |
| Password manager recovery / emergency kit | Downloaded when the vault is created | ______________________ |
| **Cloudflare** login email | Account sign-up | ______________________ |
| Cloudflare password | Account sign-up | ______________________ |
| Cloudflare 2-step backup codes | Shown once when 2-step was turned on | ______________________ |
| Cloudflare 2-step authenticator app (which phone/app) | Profile → Authentication | ______________________ |
| Cloudflare passkey / security key (if any) | Profile → Authentication | ______________________ |
| Domain transfer (auth) code, only if ever moving the domain | Cloudflare → domain → Transfer | ______________________ |
| **GitHub** username and password | Account sign-up | ______________________ |
| GitHub 2-step recovery codes | Settings → Password and authentication | ______________________ |
| GitHub passkey / security key (if any) | Same page | ______________________ |
| **Supabase** login | "Continue with GitHub" (no separate password) | uses GitHub login |
| Supabase database password | Chosen when the project was created | ______________________ |
| Supabase personal access token (only if made; delete when done) | Account → Access Tokens | ______________________ |
| **Gmail** address | Account sign-up | ______________________ |
| Gmail password | Account sign-up | ______________________ |
| Gmail 2-step phone number / backup codes | myaccount.google.com/security | ______________________ |
| Gmail **app password** (16 characters, shown once) | myaccount.google.com/apppasswords | ______________________ |
| **Turnstile** secret key | Cloudflare → Turnstile → widget | ______________________ |
| **Mapbox** login and password | Account sign-up | ______________________ |
| Mapbox public token (`pk.`) | account.mapbox.com → Access tokens | ______________________ |
| **Privacy.com** login and password | Account sign-up | ______________________ |
| Privacy.com 2-step method / backup codes | Account settings | ______________________ |
| Virtual card: last 4 digits, expiry, spending limit | Privacy.com card page (full number stays in Privacy.com) | ______________________ |

## Things that need doing

**Every semester:** check the links on the Resources page; skim pending reviews and landlords at `/admin`.
**Before the domain renews:** make sure the card has money, or the domain can lapse. Set a calendar reminder a month ahead.
**Every few months:** in Supabase, export the data (Table Editor → Export). The free plan has no automatic backups, and it pauses a project that has had no visits for about a week.
**After any change to the web address:** add it in Supabase (Authentication → URL Configuration), Turnstile (hostnames), and Mapbox (token URLs).

## Handoff checklist

- [ ] New owner added as **Owner** in Cloudflare (Manage Account → Members), then check the domain's contact email.
- [ ] New owner invited to the Supabase organization as **Owner** (they need a Supabase account; GitHub login is fine).
- [ ] GitHub repository transferred, or the new owner added as admin; Cloudflare Pages still connected to it.
- [ ] Gmail: password, phone number, and recovery email changed; app password regenerated and re-entered in Supabase (Authentication → Emails → SMTP).
- [ ] New owner's email added to the `admins` table in Supabase so they can approve reviews; old admin email removed.
- [ ] Shared vault ownership transferred; old logins rotated.
- [ ] New owner has done one full test: sign up, confirm email, log in, post a review, approve it (`docs/replication_guide.md`, part 11).

## More detail

[Launch checklist](launch_checklist.md) · [Setup guide](replication_guide.md) · [Site customization](website_customization.md) · [Architecture](architecture.md)
