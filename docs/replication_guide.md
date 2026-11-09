# Set up your own Rate Your Landlord website

This guide is for someone who has not built a website before. Work through it in order. You can stop after the local demonstration without buying a domain or connecting a database.

**This is a setup and trial-deployment guide, not a claim that the website is ready for unrestricted public use.** Use fictional information while testing. Some features need additional implementation or review; those stopping points are called out below.

Provider documentation was checked on **October 27, 2026**. Links to the official sources and the code used for these instructions are in [the verification reference](architecture.md#verification-sources). **TO CONFIRM** means that an account-specific screen, changing interface label, or untested live behavior must be checked before proceeding. It is not an instruction to guess.

## Contents

1. [Make your personal GitHub copy](#1-make-your-personal-github-copy)
2. [Install the tools and download your files](#2-install-the-tools-and-download-your-files)
3. [Run the local demonstration](#3-run-the-local-demonstration)
4. [Create a Supabase project](#4-create-a-supabase-project)
5. [Connect local settings and email](#5-connect-local-settings-and-email)
6. [Set up Turnstile](#6-set-up-cloudflare-turnstile)
7. [Set up address suggestions](#7-set-up-mapbox-address-suggestions)
8. [Publish a trial site with Cloudflare Pages](#8-publish-a-trial-site-with-cloudflare-pages)
9. [Connect your domain](#9-connect-your-domain)
10. [Finish sign-in redirects](#10-finish-sign-in-and-password-reset-redirects)
11. [Test before sharing](#11-test-before-sharing)
12. [Review and update your copy](#12-review-and-update-your-copy)
13. [If something goes wrong](#13-if-something-goes-wrong)

## Before you begin

You will use several separate accounts. **GitHub** stores website files. **Supabase** stores data and handles accounts. **Cloudflare** hosts the website and can manage its domain's address records. **Mapbox** provides address suggestions. An **email delivery provider** sends account-confirmation and password-reset messages through SMTP, the standard connection used to send email.

1. Use accounts you control, with strong passwords and two-factor authentication where available.
2. Check each service's current pricing, usage limits, and billing requirements. **TO CONFIRM:** those depend on the provider and your account.
3. Keep account passwords and private keys in a password manager, not in the website's files, screenshots, or GitHub.
4. Start with fictional landlords, reviews, and test accounts. Do not upload leases, identity documents, or other tenant records.
5. Read the stopping points in this guide. Hosting a page successfully is different from running a safe review service.

## 1. Make your personal GitHub copy

A **repository** is a folder of website files and their change history on GitHub. A **fork** is your own GitHub copy, connected to the original but controlled separately.

1. Sign in at [GitHub](https://github.com/).
2. Open [the original repository](https://github.com/moreperfectuniversity/rateyourlandlord-template).
3. Click **Fork** near the upper-right corner.
4. Under **Owner**, choose your account. Give the copy a name you will recognize, such as `my-landlord-site`. Keep **Copy the main branch only** selected if offered.
5. Click **Create fork**. **TO CONFIRM:** button positions and whether forking is allowed depend on your account and the repository's access settings. If Fork is unavailable, ask the repository owner for access or an approved way to make a copy.
6. Look at the address bar. It should now name **your account** and your chosen repository, not only `moreperfectuniversity`.
7. Open `package-lock.json` in your copy. Use the browser's Find command: **Ctrl+F** on Windows or **Command+F** on Mac. Search for `package-firewall.replit.internal`.
8. **If matches appear, stop before installing outside Replit.** The checked base repository has 182 private Replit package-download prefixes. Ask the maintainer to provide or merge the reviewed correction that changes those prefixes to `https://registry.npmjs.org/` while retaining all package versions and integrity hashes. Do not delete the lockfile, update dependencies, or assume a registry setting alone rewrites its download addresses.
9. If the correction was accepted in the original repository after you forked it, open your fork's main page and use **Sync fork → Update branch**, if available. **TO CONFIRM:** fork synchronization labels and conflict handling vary. If GitHub reports a conflict, get help rather than replacing your files blindly.
10. Reopen the lockfile and repeat the search. **You should see no matches in `package-lock.json`** before continuing with an outside-Replit installation.

This guide does not choose a license. Before reusing or publishing the project, confirm your permission to use the code, names, bundled fonts, images, and other content with the owner.

## 2. Install the tools and download your files

**Node.js** runs the tools that build the site. **npm**, included with Node.js, downloads the software packages listed in the repository. **Visual Studio Code (VS Code)** is a text editor with a built-in terminal. A **terminal** is a panel where you type a command and press Enter.

### Install Node.js

1. Open [the official Node.js download page](https://nodejs.org/en/download).
2. Select your operating system. For this guide, choose the supported **Node.js 22 LTS** release line. LTS means a release supported for longer-term use. **TO CONFIRM:** the version selector and installer labels change; use the official release selector if the page initially offers another version.
3. **Windows:** download the Windows Installer (`.msi`), open it, and follow the installer. Keep npm included.
4. **Mac:** choose the macOS Installer (`.pkg`), open it, and follow the installer. Use the installer appropriate to your Mac if it asks about Apple silicon or Intel.
5. Close and reopen VS Code or any terminal that was already open after installing Node.js.

The repository build was checked in this workspace with Node.js 20.20.0. **TO CONFIRM:** the Node.js 22 setup on your own Windows or Mac computer must pass the install and build checks below; no Windows or Mac installation was performed as part of this documentation review.

### Install VS Code and open the folder

1. Download [VS Code](https://code.visualstudio.com/).
2. **Windows:** run the User Installer and follow its prompts. **Mac:** open the downloaded archive and drag Visual Studio Code into Applications.
3. In your GitHub copy, click the green **Code** button, then **Download ZIP**. This downloads files; it does not install the website.
4. **Windows:** right-click the ZIP in Downloads and choose **Extract All**, then **Extract**. **Mac:** double-click the ZIP to extract it.
5. Open VS Code. Click **File → Open Folder**, select the extracted repository folder, and click **Select Folder** or **Open**. If there is a second folder inside the extracted folder, choose the one containing `package.json`.
6. Check VS Code's left file list. **You should see `package.json`, `package-lock.json`, `App.tsx`, and `pages`.** If you only see another folder, open that inner folder instead.
7. Click **Terminal → New Terminal** in VS Code's top menu. It opens a panel at the bottom, normally already in the folder you opened.
8. **Windows:** to avoid PowerShell's script-policy restrictions, use the terminal's dropdown arrow beside the plus button, choose **Select Default Profile → Command Prompt**, and open a new terminal. **TO CONFIRM:** profile-menu wording varies by VS Code version. **Mac:** the default shell, usually zsh, is suitable.
9. Type `node --version` and press Enter. Then type `npm --version` and press Enter. **You should see version numbers**, not “command not found” or “not recognized.”

**For every terminal step in this guide, type only the command itself. Do not type Markdown fences, backticks, labels such as `bash`, a `$` prompt, or the surrounding explanation.** Run one command at a time and wait for it to finish.

You do not need Git command-line tools, Docker, or a Cloudflare command-line tool for this ZIP-and-dashboard path. Do not run a command to create a new Vite application: this repository already is the application.

## 3. Run the local demonstration

The website uses **Vite**, a tool that runs a local development website and builds the files for hosting. Local means visible on your own computer; it is not your public website.

1. Finish the lockfile check in part 1 before installing packages.
2. For the first demonstration, do **not** add Supabase settings. A fresh GitHub ZIP should not include your private local settings file. If reusing an existing working folder, first make sure you understand its settings; do not delete someone else's files.
3. In VS Code's terminal, type `npm ci --registry=https://registry.npmjs.org/` and press Enter. This installs the versions recorded in the lockfile. **You should see installation finish without an `npm error`.** Warnings or security-audit notices are different from a failed install, but should still be reviewed before public use.
4. Type `npm run dev` and press Enter.
5. Look for Vite's **Local** address. This repository requests port **5000**, so the usual address is `http://localhost:5000/`, not 3000 or 5173. If the port is busy, Vite may print a different port; use the printed address for browsing.
6. Open that address in your browser. **You should see the landlord page and a “Demo mode — showing fake data” banner.**
7. Search for a landlord and open a landlord card. The names and reviews are fictional demonstration data.
8. Do not expect registration, sign-in, or password reset to work in the demo. `MockAuthService` deliberately returns “not available in demo mode.” Some submission forms also need a configured security challenge.
9. Changes made to the demonstration data are held in memory. They are not shared with other computers and are reset when the application reloads.
10. To stop the local server, click inside the terminal and press **Ctrl+C** on either Windows or Mac. **The terminal prompt should return.**

### Check the build

1. With the development server stopped, type `npm run build` and press Enter.
2. **You should see Vite finish building and a `dist` folder appear.** The folder contains the files a host serves to visitors. A build can pass while sign-in or database features are still incomplete.
3. Type `npm run preview` to view that built version locally. Open the address it prints, normally `http://localhost:4173/`.
4. Stop this preview with **Ctrl+C** when finished. This preview command is for checking the build, not hosting a public website or running Cloudflare's server functions.

## 4. Create a Supabase project

Supabase supplies a database and **Auth**, its account and sign-in service. Use a new project containing no sensitive information for the first setup.

1. Sign in to [Supabase](https://supabase.com/dashboard).
2. Choose an organization, or create one if prompted, then click **New project**.
3. Enter a recognizable project name, create a strong database password, and select a suitable region. Save the password privately; it is **not** one of the website settings below.
4. Confirm the plan and any charges, then click **Create new project**. **TO CONFIRM:** the exact form labels and billing choices depend on your account.
5. Wait until the project's dashboard is available. **You should see navigation for the database, Authentication, and Storage.**

### Load the repository's database setup

SQL is the language used to set up database tables, which are lists of records such as landlords and reviews.

1. In VS Code, open `init.sql`. Select all its text and copy it. Do not copy GitHub page buttons, line numbers, or Markdown formatting.
2. In your **new trial project**, open Supabase's **SQL Editor**, create a new query, paste the text, and click **Run**.
3. Inspect the result. **TO CONFIRM:** the script's successful execution and compatibility must be checked against your actual project. This documentation review did not execute it in a new Supabase account. If it reports an error, stop and ask the maintainer to review it; do not improvise a replacement schema or disable security.
4. Open **Table Editor** and select the `public` schema if asked. Look for `landlords`, `reviews`, and `admins`.
5. Inspect the sample data. It is not your community's real review history. Keep the project clearly marked as a trial until you have planned which sample records to remove.
6. Confirm the project's **Data API** is enabled for the intended public tables. Supabase's current documentation places those settings under **Integrations → Data API**. **TO CONFIRM:** this location and defaults can vary with project creation settings. Ask for help if the expected tables are unavailable; do not expose additional tables indiscriminately.

**Review fields:** the review form and this `init.sql` use the same fields (`landlord_rating`, `building_rating`, `bedrooms`, `tags`). New reviews start as **pending** until an admin verifies them. If you ran an older copy of `init.sql` that created a `beds` column, ask a maintainer to rename it to `bedrooms` before testing submissions.

### Get the public connection values

1. Open the project's **Connect** panel and look for its project URL and browser/publishable key. Supabase also documents an **API Keys** settings page. **TO CONFIRM:** the panel tabs and location vary as its key system changes.
2. Copy the **Project URL** into a temporary private note.
3. Copy the **publishable** key, normally beginning `sb_publishable_`. This is the key intended to be used by a browser. A legacy project may instead offer the browser-safe **anon** key.
4. Never use a database password, `service_role` key, `sb_secret_` key, or personal access token in this website's browser settings. These have elevated access and must remain private.

### Storage and administrator access

1. Supabase **Storage** is a file-storage service; a **bucket** is a named collection of files. You do not need Cloudflare R2, another file-storage service, for the current application's browsing and review text.
2. If your trial Supabase project has a `verification-files` bucket, open it in **Storage** and inspect its settings. It should be **private**. Do not make documents public to work around an access error.
3. The current real data service has no verification-file upload implementation. A bucket alone does not enable uploads. **Do not collect real verification documents.** A developer must implement and test private upload and administrator-only access before offering that feature.
4. To set up a trial administrator, first register and verify the intended account after completing parts 5–7. Then, as project owner in Supabase **Table Editor → admins**, choose **Insert row**, enter that account's email, leave generated fields at their defaults, and save. **TO CONFIRM:** the insert-button label may differ.
5. Sign out and sign back in to the website, then visit `/admin`. **You should see the administration page for that account, not for an unrelated account.** Account roles are cached during a session, so signing back in matters. Treat this as a test to perform, not an access-control guarantee from the guide.

## 5. Connect local settings and email

An **environment variable** is a named setting supplied separately from the code. This application reads settings from a file named `.env.local` on your computer. There is no supplied `.env.local.example` file to copy.

### Create `.env.local` without terminal copy commands

1. In VS Code's left file list, click the **New File** icon at the top of the open project.
2. Name the file exactly `.env.local`, including the starting dot. It belongs beside `package.json`, not inside `pages` or `docs`. Do not name it `.env.local.txt`.
3. Add the following two lines to the file. This is **file content, not a terminal command**. Replace the descriptions after `=` with your project's real public values, without square brackets:

   ```text
   VITE_SUPABASE_URL=[your Supabase project URL]
   VITE_SUPABASE_ANON_KEY=[your Supabase browser-safe publishable or anon key]
   ```

4. Keep the name `VITE_SUPABASE_ANON_KEY` even when using a modern publishable key. The application expects that exact setting name; the name is historical.
5. Save with **Ctrl+S** on Windows or **Command+S** on Mac.
6. Stop the development server with **Ctrl+C**, then type `npm run dev` again. Settings are read when Vite starts.
7. Refresh the website. **The demo banner should disappear.** This only means both settings are present; it does not prove that the credentials, tables, or permissions are correct.
8. Open the homepage and check for real trial data from your Supabase project. Wrong keys or connection errors do not automatically return the application to demo mode.

All settings starting with `VITE_` are included in the website delivered to browsers. Treat them as publicly visible even if a hosting dashboard masks their values. Do not put private keys or passwords there. The repository ignores `.env.local`; do not upload it manually to GitHub.

### Configure confirmation and password-reset email

1. In Supabase, open **Authentication**, then its **Email** provider settings. Enable email/password accounts and email confirmation for this setup. **TO CONFIRM:** provider menus may appear under **Sign In / Providers** or a similarly named section.
2. Open [Auth URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration) for your project. For local testing, set **Site URL** to `http://localhost:5000`.
3. Add these allowed **Redirect URLs**, one entry at a time, and save:
   - `http://localhost:5000/verify-email?verification=1`
   - `http://localhost:5000/reset-password`
4. If Vite printed a different local port, use that same port in these entries. The preview server's port 4173 is a different address and needs its own entries if you test email links there.
5. Choose an email delivery provider that supports **SMTP**. Follow that provider's instructions to verify your sending domain and obtain the SMTP host, port, username, password, and sender address. **TO CONFIRM:** these values, verification records, prices, and provider screens are account-specific.
6. In Supabase, open [Authentication's SMTP settings](https://supabase.com/dashboard/project/_/auth/smtp). Enable custom SMTP and enter those exact values. Keep the SMTP password only in this server-side service configuration, never in `.env.local` or Cloudflare browser variables.
7. Save the settings. Send a confirmation and password-reset email during the later test steps. **You should receive real messages at a test mailbox you control.**

Supabase's built-in email sender is restricted to authorized project-team addresses and has a low, changeable rate limit. Do not expect it to send account emails to the public. Connecting a domain to Cloudflare Pages does not by itself configure this email service.

Leave the default Supabase email templates unchanged for the first test. If changing them later, check Supabase's redirect documentation: templates may need to use `RedirectTo` rather than always linking to the Site URL. This app supplies an email-confirmation address and a password-reset address; it does not implement Google or GitHub social sign-in.

## 6. Set up Cloudflare Turnstile

Turnstile is Cloudflare's security-challenge widget. The application displays it for login, registration, resending the confirmation email, password-reset requests, adding a landlord, and adding a review. A **sitekey** is public; a **secret key** is private.

1. Sign in to [Cloudflare](https://dash.cloudflare.com/).
2. Open **Turnstile → Add widget**.
3. Give the widget a recognizable name. Under **Hostname management**, add `localhost` for your local trial. A hostname has no `https://`, port, or path.
4. Choose **Managed** mode and click **Create**. **TO CONFIRM:** labels may change; the official dashboard guide is linked in the verification reference.
5. Copy the public **sitekey**. Keep the secret key private; do not put it in any `VITE_` setting.
6. Add `VITE_TURNSTILE_SITE_KEY=[your public sitekey]` as a new line in `.env.local`, replacing the bracketed text.
7. Save and restart `npm run dev`, then open `/register`. **You should see a challenge instead of “Security verification is not configured.”** Allow the challenge to complete before submitting.
8. Once Pages gives you a hostname, return to this widget's **Settings** and add that exact `pages.dev` hostname. Add your custom hostname later too, and click **Save**. Do not add broad unrelated hostnames.

### Turn on server-side checking in Supabase

The website sends each Turnstile token to Supabase with login, registration, resend-confirmation, and password-reset requests. Supabase checks the token with Cloudflare on its server, but only after you turn this on:

1. In Supabase, open **Authentication → Attack Protection** (**TO CONFIRM:** the page may be labelled differently in your dashboard).
2. Turn on **Enable Captcha protection**, choose **Turnstile by Cloudflare**, and paste the Turnstile **secret key** from step 5. The secret key goes only here, never in `.env.local` or Cloudflare Pages settings.
3. Save, then test: register, log in, and request a password reset. Each should work after completing the challenge.

Once this is on, every login and sign-up must include a fresh challenge, so the site's Turnstile sitekey must work on the hostname you are testing. If login fails with a captcha error, check the widget's hostname list first.

**What this covers:** accounts can't be created, logged into, or sent emails without passing the challenge. Adding landlords and posting reviews requires a signed-in account (the database rules in `init.sql` enforce this), so those are covered too. The challenge shown on the add-landlord and add-review forms is an extra step in the browser only; Supabase does not check those two tokens.

## 7. Set up Mapbox address suggestions

Mapbox offers address suggestions while people fill out forms. The application uses its address-autofill component; it is not a configured Cloudflare mapping service.

1. Create or sign in to a [Mapbox account](https://account.mapbox.com/). Review its current access and billing requirements.
2. Open the account's **Access Tokens** page and copy a browser-safe **public** token, beginning `pk`. Do not use a secret `sk` token.
3. For a local trial, the account's default public token can be used. For a deployed site, use a project-specific public token with suitable website URL restrictions when your account supports creating one.
4. **TO CONFIRM:** current trial-account limits may prevent creating additional tokens until billing is configured. Follow Mapbox's own token instructions for the account you have; do not assume a button or scope is available.
5. Add `VITE_MAPBOX_TOKEN=[your public Mapbox token]` to `.env.local`, replacing the bracketed text. Save and restart the local server.
6. Sign in and open the add-landlord form. Type a fictional street address. **You should see address suggestions.** Test again on the Pages hostname and custom domain after publishing.
7. If you restrict a project token to website URLs, include the exact local and hosted URLs you intend to test, following Mapbox's allowed-URL format. A token allowed only on your final domain can fail on the local or Pages trial site.

The current address components request United States addresses in English. Changing countries is not a dashboard setting in this repository; it requires application changes outside this guide.

## 8. Publish a trial site with Cloudflare Pages

**Pages** hosts the built website. Choose **Pages with Git integration**, not an unrelated Workers deployment tutorial. Git integration means Cloudflare rebuilds after accepted changes reach the connected GitHub branch.

### Prepare your GitHub copy

1. Confirm your GitHub copy contains the public-registry lockfile correction from part 1. Local ZIP edits are not sent to GitHub automatically.
2. Confirm which branch contains the version you tested. Normally use your copy's `main` branch.
3. Do not upload `node_modules`, `dist`, `.env.local`, backup lockfiles, or service credentials to GitHub. Pages installs packages and creates its own build output.
4. Check public-facing names, contact details, and legal pages before sharing. The source still includes local branding and placeholders; see part 11.

### Create the Pages project

1. In Cloudflare, go to **Workers & Pages**.
2. Select **Create application → Pages → Connect to Git**. **TO CONFIRM:** Cloudflare changes its project-creation navigation; use the Pages Git-integration documentation if your screen presents a different route. Do not select a Worker deployment just because it is the first option.
3. Choose **GitHub** and authorize Cloudflare's GitHub connection. Select only your personal repository when possible.
4. Return to Cloudflare, select your copied repository, and continue to its setup screen. If the repository is not listed, check the GitHub app's allowed repositories.
5. Enter a project name you control. Cloudflare will use it when assigning the Pages hostname.
6. Set the build fields as follows:

   | Field | Value for this repository |
   | --- | --- |
   | Production branch | The branch you tested, usually `main` |
   | Framework preset | React (Vite), if offered; otherwise enter the fields manually |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | Leave blank/use the repository root |

   These are dashboard field values, not commands to run in your local terminal. Do not enter `npm run dev`, `npm run preview`, or `npm run test:run` as the Pages build command.

7. In the build environment-variable section, add the public settings below using your own values. Add `NODE_VERSION` with value `22` to match the Node.js version selected earlier.

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your browser-safe Supabase publishable or anon key |
   | `VITE_TURNSTILE_SITE_KEY` | Your public Turnstile sitekey |
   | `VITE_MAPBOX_TOKEN` | Your public Mapbox token |
   | `NODE_VERSION` | `22` |

8. **TO CONFIRM:** environment settings may be labeled **Environment variables** or **Variables and Secrets**. Ensure they are available to the **build**, not only as server-function runtime bindings. Add them for **Production**. If using **Preview** deployments, configure those separately and use a separate trial Supabase project for changes you do not want to affect real data.
9. Click **Save and Deploy**. **You should see logs for package installation, the Vite build, and deployment.** If the build fails, use the first meaningful error rather than repeatedly clicking retry.
10. When successful, open the assigned `https://your-project.pages.dev` address. Copy the actual address from Cloudflare; do not assume a project name was available.
11. **You should see the website without a demo banner** when real Supabase settings were supplied. If intentionally publishing only a demo, omit the Supabase settings and keep it clearly labeled as a fake-data demonstration instead.
12. Add the exact Pages hostname to Turnstile and Mapbox's applicable restrictions, then complete the sign-in redirects in part 10.

### What not to add

This repository has no D1 database, KV store, or R2 integration. Those Cloudflare storage products are not substitutes you can enable to make Supabase calls work. There is no Wrangler deployment command required for this Git-integrated Pages path.

The root `functions/api/hello.js` is a sample Pages Function returning “Hello World!” It is not an email, CAPTCHA-verification, or review-upload backend. Vite's local dev and preview servers do not run Pages Functions. Do not mistake a working `/api/hello` on Pages for proof of working form protection.

`public/_redirects` already contains `/* /index.html 200`, which supports opening React routes directly on Pages. Leave that file in place. Refresh `/login` on the deployed site as a routing check.

Changes to `VITE_` values require a **new build/deployment**. Changing only dashboard values does not rewrite files already sent to visitors. In the project's Deployments view, use the redeploy/retry option to start a new build after saving updated settings. **TO CONFIRM:** the action's exact label may differ.

## 9. Connect your domain

A **domain** is a name you own, such as `example.com`. A **registrar** is the company where you register it. **DNS records** tell browsers where that name leads. Changing **nameservers** changes which provider controls those records.

You can keep the assigned Pages address for a trial and skip this section. For a custom domain, first choose whether you want the root domain (`example.com`) or a subdomain (`reviews.example.com`).

### Root domain: use Cloudflare nameservers

1. Register a domain with a registrar you choose, or use one you already own. Confirm costs and renewal settings.
2. Before changing nameservers, save a copy of existing DNS records, especially email records. Moving DNS without copying them can interrupt an existing website or mailbox.
3. In Cloudflare, open **Domains → Onboard a domain**, enter the root name, and follow the plan-selection and DNS-import steps. **TO CONFIRM:** this may appear as **Add a domain** or **Add a site** in your account.
4. Compare the imported DNS records with your registrar/current DNS provider. Copy any missing records using that provider's exact values. Ask your domain or email provider for help if unsure.
5. Cloudflare displays two assigned nameservers. At your registrar, open the domain's nameserver settings, replace the old nameservers with those exact two, and save. **TO CONFIRM:** this screen is specific to your registrar. If DNSSEC is enabled, follow Cloudflare's current migration instructions before changing nameservers.
6. Wait until Cloudflare reports the domain as active. Do not repeatedly change nameservers while waiting. If the domain was bought through Cloudflare Registrar, it already uses Cloudflare DNS.
7. Go to **Workers & Pages → your Pages project → Custom domains → Set up a domain**.
8. Enter your root domain and follow the DNS confirmation steps. Cloudflare can create the required Pages record when the domain is in the same account.
9. Wait until the custom domain is active and HTTPS works. **You should see the trial website at your own address without a certificate warning.**

### Subdomain: keep another DNS provider if desired

1. In your Pages project, open **Custom domains → Set up a domain** and enter the full subdomain, such as `reviews.example.com`.
2. Complete the Pages association first. Creating a DNS record without associating the hostname with the Pages project can fail.
3. At the DNS provider for that domain, create the requested **CNAME** record. A CNAME points one name to another:
   - Name/host: the subdomain label, for example `reviews` (some providers require the full hostname).
   - Target/value: the exact `your-project.pages.dev` hostname from Cloudflare, without `https://` or a path.
4. **TO CONFIRM:** DNS-provider form labels and verification instructions vary. Follow any domain-ownership verification shown by Pages. Do not delete unrelated records.
5. Wait for Pages to report the hostname active and check the HTTPS address in a browser.

If you want both the root name and `www`, add each as a custom domain and decide which is the main address. Redirect rules are a separate configuration; they are not automatically supplied by this application. After any hostname change, repeat the Turnstile, Mapbox, and Supabase checks below.

## 10. Finish sign-in and password-reset redirects

A **redirect** sends a visitor from an email-confirmation or password-reset link back to your website. Ordinary email/password login stays on the website; this repository does not require setting up social-login providers.

1. Copy your actual Pages URL or final custom-domain URL from the browser. Use `https://` for a hosted site.
2. In Supabase, open **Authentication → URL Configuration**.
3. Set **Site URL** to the main website address, for example `https://reviews.example.com`, replacing the example with your own domain.
4. Under **Redirect URLs**, add each callback used by this application for the hostname you are testing:
   - `https://reviews.example.com/verify-email?verification=1`
   - `https://reviews.example.com/reset-password`
5. If you will test the Pages hostname too, add its own two equivalent addresses, using its actual name. Keep the local entries from part 5 while developing.
6. Save. The code supplies these destinations using the address the visitor is currently on. An entry for the custom domain does not automatically allow the different Pages hostname.
7. For branch-preview addresses, use a separate trial database and explicitly approved callback URLs. Do not allow all websites or paste a broad wildcard simply to get past an error. **TO CONFIRM:** preview hostnames vary by deployment; copy the actual one.
8. Open your final domain and register a new test account. Complete the challenge and open the confirmation email in the same browser used for registration.
9. **You should return to `/verify-email` on the intended hostname**, then be able to log in. If the browser returns to localhost or another domain, recheck the Site URL, redirect entries, and any edited email templates.
10. From `/login`, request a password reset, complete the challenge, open the newest reset email, and set a new test password. **You should reach `/reset-password` on the intended hostname and be able to sign in with the new password.**
11. Add the same final hostname to Turnstile and applicable Mapbox restrictions. Retest after saving.

Email links can expire or be usable only once. Request a new link rather than repeatedly opening a stale one. If you test with the local server, that server must still be running when you click the email.

## 11. Test before sharing

Use fictional data, a test mailbox you control, and a normal browser plus a private/incognito window. Keep a note of the result of each check. **A failed or unimplemented check is a reason to pause the related public feature**, not to disable access controls.

1. **Build:** run `npm run build` in the local project. Confirm it completes. Check the Cloudflare build logs too.
2. **Correct site:** open the assigned Pages address and final domain. Confirm you are seeing your version and not the old website or an unintended demo.
3. **Navigation:** search and open a landlord. Refresh the page, then open `/login` directly. Both should load instead of a host-level “not found” page.
4. **Account creation:** register, receive the confirmation email, verify it, and log in. Sign out and repeat login. Demo-mode accounts cannot pass this check.
5. **Password reset:** use a new reset link and sign in with the new password.
6. **Address suggestions and security widget:** check them on each hostname you plan to use. Record the unresolved server-verification limitation; a widget alone does not pass an anti-abuse review.
7. **Real data:** submit a clearly labeled test landlord and review. Check the result in Supabase and again after a browser refresh. The real-data service must retain it; the demo does not.
8. **Moderation:** with the trial admin account, test approval, editing, deletion/rejection, and any restore action you intend to use. Verify the visible result and stored record, not just a success message.
9. **Access:** sign out and use the private window as an ordinary visitor. Confirm `/admin` does not show the admin tools. Have a qualified reviewer check database access rules as well; hiding a button is not sufficient protection.
10. **Documents:** do not invite document uploads until a developer implements and tests private storage access in the real service. The current application does not pass this feature check.
11. **Personalization:** review the home page, header/footer, About, Resources, Contact, and both legal pages. Replace old local references and all placeholders with your own reviewed information. Customize both logos' wording and colors in `logoSettings.ts` using the [logo customization guide](logo_customization.md); no image editor is needed. Check `index.html` for the browser title/description. Other city-specific text and site-wide theme colors are not controlled by the logo settings.
12. **Local assumptions:** ask a maintainer to review `utils/studentVerification.ts`, the US-only address options, and community-specific wording before serving a different area. Check rights to bundled fonts and images. This guide does not select a license or supply legal advice.
13. **Contact:** click the email link on the Contact page. It is a `mailto` link that opens a visitor's email application, not a built-in contact-message delivery service.
14. **Privacy and operations:** decide who moderates reports, how people request corrections/removal, what data you retain, and who responds to email. Arrange an appropriate privacy/security review before collecting public submissions.

**TO CONFIRM — not performed by this documentation review:** real Supabase setup, SMTP delivery, Windows/Mac installs, authenticated form submissions, administrator permissions, Cloudflare account setup, DNS propagation, and custom-domain callbacks. These need to be tested in your own accounts. The guide does not remove the current implementation stopping points.

## 12. Review and update your copy

A **branch** is a separate set of proposed changes. A **pull request (PR)** shows a branch's differences so they can be checked before **merging**, which accepts those changes into the chosen destination branch.

### Make a small text change using GitHub's website

1. Open **your own repository**, not the original owner's repository.
2. Open the file, then click its **pencil/Edit** button. **TO CONFIRM:** GitHub may place Edit in a menu, and you need permission to edit the chosen repository.
3. Change only the intended text. Do not put passwords or keys into the file.
4. Click **Commit changes**. Choose **Create a new branch** for the change and give it a recognizable name.
5. Continue to **Propose changes** or **Create pull request** as shown. Confirm both the destination repository and destination branch. For your website, the destination should normally be **your copy's `main`**, not the original owner's repository.
6. In **Files changed**, check every file. For documentation-only work, there should be only the intended Markdown files. Exclude `.env.local`, backup files, build outputs, dependency changes, and unrelated workflows.
7. Read the rendered Markdown using the file's preview option or the branch's file view. Click its relative links.
8. Ask someone else to follow the instructions from a fresh download, noting their operating system and provider screens. Resolve any **TO CONFIRM** item relevant to your launch.
9. Review checks and comments before using **Merge pull request**. Only a person with permission should merge after accepting the changes; opening a PR does not merge it.
10. If Cloudflare Pages watches that main branch, merging triggers a build. Wait for its deployment to succeed and check the public site.

Downloading a ZIP does not connect your local folder back to GitHub. After accepted GitHub changes, download and extract a fresh ZIP into a **new folder** to test it. Your old local edits and `.env.local` do not update automatically; recreate your public local settings in the new folder without overwriting someone else's work.

If contributing back to the original repository, explicitly choose its repository and the requested base branch when opening the PR. Do not assume your fork's PR defaults are correct. Existing lockfile and workflow fixes should remain separate from a documentation-only PR.

## 13. If something goes wrong

Use the table to find the next safe check. Record the exact error text, which step failed, your operating system, and the page address. Remove keys, passwords, email addresses, and personal data before sharing screenshots or logs.

| What you see | What to do |
| --- | --- |
| `node` or `npm` is not recognized / command not found | Finish the Node installer, close and reopen VS Code, then try the two version commands again. Use the official installer for your operating system. |
| PowerShell says `npm.ps1` cannot run | Use VS Code's Command Prompt terminal on Windows as described in part 2. Do not disable your computer's security policy for this guide. |
| An error mentions `package-firewall.replit.internal` | Stop and check the actual `package-lock.json` in your downloaded copy. Get the reviewed public-registry URL correction, then download the corrected branch again. A registry command alone does not fix private URLs already recorded in the lockfile. |
| `npm ci` says the package file and lockfile disagree | Confirm both files came from the same branch/download. Ask a maintainer to repair them together; do not delete the lockfile or run random dependency upgrades. |
| A command includes `^[[200~`, backticks, `bash`, or copied explanatory text | Press Ctrl+C to clear the unfinished command and type only the command itself at a new prompt. Those characters/labels are not part of the command. |
| `package.json` cannot be found | Use File → Open Folder and choose the folder that actually contains `package.json`; open a new terminal there. |
| The local page does not open | Keep `npm run dev` running and use its printed Local URL. Check whether another program is using port 5000. Match any different port in your auth redirect entries too. |
| The demo banner remains after adding Supabase values | Check the exact setting names, `.env.local` spelling/location, and restart the server. On Pages, check Production build variables and rebuild. |
| The banner disappeared but data is empty or errors appear | Both values being present only turns off demo mode. Check the project URL/key pair, project status, tables, Data API settings, and access permissions. Do not substitute an elevated secret key. |
| Supabase SQL Editor reports an error | Stop, save the error text privately, and ask the maintainer to inspect your trial setup. Do not disable security rules to make an error disappear. |
| Reviews fail to save or ratings look wrong | Confirm the project's `reviews` table was created from this repository's `init.sql` (it has a `bedrooms` column, not `beds`). Read the exact error in the browser's developer console. `npm run check:schema` checks `init.sql` itself, not your Supabase project's settings. |
| “Security verification is not configured” / form button stays disabled | Add the public Turnstile sitekey, restart/rebuild, and check that the current hostname is allowed. Also check for browser extensions blocking the challenge. This does not address the server-verification implementation gap. |
| Auth fails after enabling Supabase CAPTCHA | The current auth service does not send `captchaToken`. Return the trial setting to its previous state and arrange the required implementation before relying on CAPTCHA protection. |
| Address suggestions are missing or Mapbox returns an authorization error | Check `VITE_MAPBOX_TOKEN`, account access, billing restrictions, and permitted website URLs. Restart/rebuild after changing the public token. |
| Confirmation/reset email is missing | Check junk mail, the SMTP provider's delivery logs, sender-domain verification, and Supabase auth logs. The default sender does not deliver to arbitrary public addresses and is rate-limited. |
| The email opens the wrong website | Check Supabase Site URL, exact Redirect URLs including the confirmation query string, current hostname, and any customized email template. Request a fresh email after saving changes. |
| A confirmation or reset link is invalid/expired | Use the newest email once, preferably in the browser that requested it. Ensure the local server is still running for localhost links. |
| Pages cannot see your repository | Check the Cloudflare GitHub app's access to that specific personal repository and the correct GitHub account. |
| Pages build fails | Read its install/build logs. Confirm the public-registry lockfile, `npm run build`, `dist`, repository-root setting, Node version, and build variables. Do not use the development server as a Pages build command. |
| The GitHub Actions **Build** check fails | Open the failed run and read the first error. The check runs `npm ci` and then `npm run build` on Node.js 22, the same steps Cloudflare Pages uses, so fix the error locally with those two commands before pushing again. It does not run the files in `tests/`; their test packages are not installed. |
| Refreshing `/login` gives a host-level 404 | Check that the built site includes `_redirects` from `public/_redirects` and that Pages, not another hosting mode, serves `dist`. |
| Custom domain is pending or HTTPS fails | Check Pages' Custom domains status, nameserver/domain activation or CNAME target, and any requested domain verification. Add the domain through Pages, not only DNS. Avoid deleting email records. |
| Your account cannot see admin controls | Confirm the email registered/verified in this project is the one entered in `admins`, then sign out and sign in. Do not publish credentials or disable permissions. |
| A document upload is unavailable | There is no real-service upload implementation. A storage bucket or R2 account alone does not add one. |
| A security-audit warning appears during install | Record it for maintainer review. Do not run `npm audit fix --force` or accept automatic dependency changes as part of this setup. |

If the problem remains, stop at that step. Ask for help with the exact sanitized error and the check that failed. Do not share access keys or copy private records into an issue.
