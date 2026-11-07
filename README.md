# Rate Y'all's Landlord — Atlanta

Landlord reviews for Atlanta college students: Georgia Tech, Georgia State, Emory, the four AUC schools (Morehouse, Spelman, Clark Atlanta, Morehouse School of Medicine), and SCAD Atlanta. The planned address is [rateyallslandlord.com](https://rateyallslandlord.com). On first visit a pop-up asks for the visitor's school, recolors the site in that school's colors, and sorts the neighborhood buttons closest-to-campus first. Anyone can read; posting needs an account made with a school email. Landlords with several properties are supported: each building gets its own grades on the landlord's page.

This repository started from More Perfect University's [Rate Your Landlord template](https://github.com/moreperfectuniversity/rateyourlandlord-template), including the editable-logo work from its pull request #4.

## Run it on your computer (about 10 minutes)

You don't need any accounts or keys for this. The site runs with fake demo landlords so you can click around.

**1. Install Node.js.** Download the **22 LTS** installer from [nodejs.org](https://nodejs.org/en/download) and run it with the default options. Close and reopen any terminal windows afterward.

**2. Get the code.** Pick one:

- **No Git:** on this page, click the green **Code** button → **Download ZIP**, then unzip it (Windows: right-click → **Extract All**; Mac: double-click).
- **With Git:**

  ```bash
  git clone https://github.com/Everett-Stubes/rateyallslandlord.git
  ```

**3. Open a terminal in that folder.** The right folder is the one that contains `package.json`.

- **Easiest:** open the folder in [VS Code](https://code.visualstudio.com/) (**File → Open Folder**), then **Terminal → New Terminal**.
- **Windows:** in File Explorer, open the folder, click the address bar, type `cmd`, and press Enter.
- **Mac:** right-click the folder in Finder → **New Terminal at Folder**.

**4. Install the website's packages** (first time only, takes a minute):

```bash
npm ci
```

**5. Start the website:**

```bash
npm run dev
```

**6. Open [http://localhost:5000](http://localhost:5000)** in your browser. You should see the homepage with a yellow "Demo mode — showing fake data" banner. Changes you save to the code show up in the browser right away.

**7. To stop it,** click in the terminal and press **Ctrl+C**. Next time, skip step 4 and just run `npm run dev`.

| If you see… | Do this |
| --- | --- |
| `node` or `npm` is "not recognized" / "command not found" | Finish the Node.js install, then close and reopen the terminal. |
| PowerShell says `npm.ps1` cannot be loaded | Use Command Prompt (`cmd`) instead of PowerShell, as in step 3. |
| `npm ci` says it needs a `package-lock.json`, or `npm run dev` says `Could not read package.json` | Your terminal is in the wrong folder. Open the folder that contains `package.json` (after unzipping, it may be one folder deeper). |
| The page won't load at port 5000 | Another program is using that port. Use the `Local:` address that `npm run dev` prints instead. |

Sign-up, login, and posting reviews don't work in demo mode. To connect a real database, follow [the setup guide from part 4](docs/replication_guide.md#4-create-a-supabase-project).

**Change the city, schools, and neighborhoods** in [`siteSettings.ts`](siteSettings.ts): the slogan, the schools in the pop-up (colors, campus location, and the email domains allowed to post), the address example on the forms, and the neighborhood buttons on the homepage all come from that file. If you change email domains, also update `is_school_email` in [`init.sql`](init.sql). **Change the logo wording and colors** in [`logoSettings.ts`](logoSettings.ts); the [logo customization guide](docs/logo_customization.md) explains how.

The [Atlanta website building doc](docs/website_customization.md) tracks the playbook's customization choices (domain, neighborhoods, colors, landlord list, About/FAQ/Resources) and what the team still needs to fill in.

A personal copy does not automatically become a working public service. Legal pages, the contact email, and some local assumptions still need review before launch.

**Start here: [the step-by-step setup guide](docs/replication_guide.md).** It covers Windows and Mac, a local demonstration, Supabase, Cloudflare Pages, a domain name, email sign-in links, and checks before sharing.

## What you will use

| Tool or service | What it does |
| --- | --- |
| GitHub | Keeps your personal copy of the website's files online. |
| Node.js and npm | Run the website on your computer and install its required software packages. npm comes with Node.js. |
| Visual Studio Code | A text editor used to open the downloaded folder, create a settings file, and run a few commands. |
| Supabase | Holds real landlord and review data and manages email/password accounts. |
| Cloudflare Pages | Builds the website from your GitHub copy and puts it online. |
| Cloudflare Turnstile | Shows the security challenge on certain forms. Its current limitations are explained in the guide. |
| Cloudflare DNS | Connects a domain name to the website, if you choose to use your own domain. |
| Mapbox | Supplies address suggestions in the forms. |

Check each provider's current pricing, limits, and account requirements before enabling a service. This guide does not promise that running a public website is free.

## Choose your next step

1. **Just looking?** Follow [parts 1–3](docs/replication_guide.md#1-make-your-personal-github-copy) of the guide. Without Supabase settings, the website displays fake data. Registration and sign-in do not work in this demonstration.
2. **Connecting real data?** Continue with [Supabase setup](docs/replication_guide.md#4-create-a-supabase-project). Stop at any failed check; do not enter real tenant information to troubleshoot.
3. **Putting a trial site online?** Follow [Cloudflare Pages setup](docs/replication_guide.md#8-publish-a-trial-site-with-cloudflare-pages), then the domain and sign-in sections.
4. **Before inviting anyone?** Complete [the sharing checklist](docs/replication_guide.md#11-test-before-sharing). A successful build alone is not a security review or evidence that every feature works.

## Important limits in the checked repository

- In this copy, `package-lock.json` already uses the public npm registry (the template's private Replit download addresses were replaced; versions and integrity hashes are unchanged).
- `package.json` has `dev`, `build`, `preview`, and `check:schema` commands. The files in `tests/` are not runnable yet: their test packages are not installed.
- The demonstration stores changes in memory, not in a real database.
- Turnstile completion is checked in the browser, but its token is not sent for server verification. Do not treat the displayed challenge as complete spam protection.
- The real data service does not implement verification-document uploads. Do not collect real verification documents.
- The review form and `init.sql` now use the same review fields, and `npm run check:schema` runs `init.sql` in a real Postgres to check review submission, editing, and moderation. It does not replace a test against your own Supabase project.
- Posting needs a school email: the sign-up form rejects other emails, and `init.sql` makes the database refuse landlords and reviews from accounts without one (admins excepted). Supabase itself can still create an account for any email through its API; that account just can't post. An existing database needs [`migrations/2026-11-07-school-email-posting.sql`](migrations/2026-11-07-school-email-posting.sql) run once to get this rule.
- Existing branding, legal placeholders, contact information, and local assumptions need review for your own site.

This documentation does **not** certify the project as production-ready, select a license, or grant rights to reuse branding, fonts, or other assets.

## Commands you will actually use

Only type the command itself into the terminal. Do **not** type Markdown fences, backticks, a language label such as `bash`, a `$` prompt, or explanatory text.

| When | Command | What you should see |
| --- | --- | --- |
| Install packages (first time, or after `package.json` changes) | `npm ci` | Installation finishes without an `npm error`. |
| Start the local website | `npm run dev` | Vite prints a local URL, normally `http://localhost:5000/`. |
| Check that the website can be built | `npm run build` | A successful Vite build and a `dist` folder. |
| Look at the built website locally | `npm run preview` | A local preview URL, normally port 4173. |
| Check the database setup file after editing `init.sql` | `npm run check:schema` | `ALL CHECKS PASSED`. |

The full guide explains how to open the correct folder and terminal first. Do not use commands from an unrelated Vite or Supabase tutorial in place of this repository's commands.

## More information

- [Setup guide and “If something goes wrong”](docs/replication_guide.md)
- [How the repository works, known limits, and verification sources](docs/architecture.md)
- [Database setup file](init.sql)
- [Package commands](package.json)

## Reviewing documentation changes

Read the Markdown files on GitHub, where headings, links, and tables are rendered. Use a pull request (a request to review changes before accepting them) for updates to your copy. The [review instructions](docs/replication_guide.md#12-review-and-update-your-copy) explain how to check the changed files and choose the correct destination repository. A local downloaded ZIP is separate from your GitHub copy: editing one does not update the other.
