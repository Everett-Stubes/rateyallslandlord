# Make your own Rate Your Landlord website

**Want to personalize the logos?** Edit the wording and colors in [`logoSettings.ts`](logoSettings.ts). The [logo customization guide](docs/logo_customization.md) explains how; no image editor is needed.

This repository contains a website for finding landlords, reading reviews, and submitting ratings. It currently includes Pittsburgh-specific examples, branding, and text. A personal copy does not automatically become a working public service.

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

- The checked base version of `package-lock.json` contains private Replit download addresses. A personal copy needs the public-registry correction before installation outside Replit. The guide explains how to check this without editing dependency versions.
- `package.json` has `dev`, `build`, and `preview` commands. It does **not** have `test` or `test:run` commands. Test files are present, but there is no runnable test command configured.
- The demonstration stores changes in memory, not in a real database.
- Turnstile completion is checked in the browser, but its token is not sent for server verification. Do not treat the displayed challenge as complete spam protection.
- The real data service does not implement verification-document uploads. Do not collect real verification documents.
- The review form and database setup use different rating fields. See the [setup checks and limitations](docs/architecture.md#setup-checks-and-limitations) before trying real submissions.
- Existing branding, legal placeholders, contact information, and local assumptions need review for your own site.

This documentation does **not** certify the project as production-ready, select a license, or grant rights to reuse branding, fonts, or other assets.

## Commands you will actually use

Only type the command itself into the terminal. Do **not** type Markdown fences, backticks, a language label such as `bash`, a `$` prompt, or explanatory text.

| When | Command | What you should see |
| --- | --- | --- |
| Install packages, after the lockfile check | `npm ci --registry=https://registry.npmjs.org/` | Installation finishes without an `npm error`. |
| Start the local website | `npm run dev` | Vite prints a local URL, normally `http://localhost:5000/`. |
| Check that the website can be built | `npm run build` | A successful Vite build and a `dist` folder. |
| Look at the built website locally | `npm run preview` | A local preview URL, normally port 4173. |

The full guide explains how to open the correct folder and terminal first. Do not use commands from an unrelated Vite or Supabase tutorial in place of this repository's commands.

## More information

- [Setup guide and “If something goes wrong”](docs/replication_guide.md)
- [How the repository works, known limits, and verification sources](docs/architecture.md)
- [Database setup file](init.sql)
- [Package commands](package.json)

## Reviewing documentation changes

Read the Markdown files on GitHub, where headings, links, and tables are rendered. Use a pull request (a request to review changes before accepting them) for updates to your copy. The [review instructions](docs/replication_guide.md#12-review-and-update-your-copy) explain how to check the changed files and choose the correct destination repository. A local downloaded ZIP is separate from your GitHub copy: editing one does not update the other.
