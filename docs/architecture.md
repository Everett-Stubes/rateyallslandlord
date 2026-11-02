# Repository reference and documentation verification

This reference supports the [plain-English setup guide](replication_guide.md). It describes the checked repository rather than an imagined finished application.

## How the site works

1. **React and TypeScript** provide the pages and form behavior. React Router selects pages such as `/login`, `/landlord/:id`, `/verify-email`, and `/reset-password`.
2. **Vite** runs the local site and creates the `dist` build folder. `vite.config.ts` requests port 5000. A built-site preview normally uses Vite's default preview port, 4173.
3. `services/supabase.ts` chooses demo mode when either Supabase connection setting is missing. When both exist, the app creates a real Supabase client; it does not validate the setup first or automatically fall back on database errors.
4. `context/ServicesContext.tsx` supplies the mock or real services. `MockApiService` holds demonstration records in memory. `MockAuthService` does not provide real registration, login, or password reset.
5. `SupabaseApiService` reads and writes landlord/review records directly through Supabase. `SupabaseAuthService` uses email/password authentication. Database permissions are enforced by Supabase, not by whether the browser shows an admin button.
6. Pages hosts the built browser files. `public/_redirects` contains `/* /index.html 200` for client-side routing.
7. `functions/api/hello.js` is a sample Cloudflare Pages Function. It is not used to verify challenges, send auth email, or store documents.

## Files checked for the setup guide

| File or area | What it establishes |
| --- | --- |
| `package.json` | Only `dev`, `build`, and `preview` scripts exist. No test script is configured. |
| `package-lock.json` | The checked base records private Replit tarball URLs. Outside-Replit installation requires the reviewed public-registry correction. |
| `vite.config.ts` | Server port 5000; Vite build; environment loading from the repository root. |
| `.gitignore` | `node_modules`, `dist`, `.env`, and `*.local` files are ignored. |
| `services/supabase.ts` | Exact Supabase setting names and demo-mode condition. |
| `services/MockApiService.ts`, `services/MockAuthService.ts` | In-memory sample records and deliberately unavailable demo authentication. |
| `services/SupabaseApiService.ts`, `services/SupabaseAuthService.ts` | Real database calls, admin lookup, auth options, and absence of a real upload method. |
| `context/AuthContext.tsx` | Confirmation redirect `/verify-email?verification=1`; reset redirect `/reset-password`; session admin-status caching. |
| `pages/RegisterPage.tsx`, `pages/LoginPage.tsx` | Challenge behavior for registration/reset; ordinary login uses email/password. |
| `pages/AddLandlordPage.tsx`, `pages/AddReviewPage.tsx` | Browser challenge checks and the fields submitted to the database. |
| `components/TurnstileWidget.tsx` | Public `VITE_TURNSTILE_SITE_KEY`; error when missing. |
| Address components in forms and landlord page | `VITE_MAPBOX_TOKEN`; US/English address-autofill options. |
| `App.tsx`, relevant page files | Demo banner, route names, and separate account/legal/contact pages. |
| `pages/ContactPage.tsx` | Email is a `mailto` link, not a server-backed contact form. |
| `init.sql` | Trial database setup reference and table/rating-model comparison. No SQL changes were made for this documentation work. |
| `functions/api/hello.js`, `public/_redirects` | Sample Function and Pages route fallback. |
| `.github/workflows/test.yml`, `tests/` | Test files exist, but the checked base workflow calls a missing script. Workflow correction is separate from documentation. |

There is no `.env.local.example` in the checked repository. The guide creates `.env.local` in the editor rather than asking Windows users to run `cp`.

## Browser settings

| Setting | Consumer | Intended value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `services/supabase.ts` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `services/supabase.ts` | Browser-safe publishable key, or legacy anon key; keep this exact variable name |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile widget | Public sitekey |
| `VITE_MAPBOX_TOKEN` | Address-autofill components | Public Mapbox token |

Vite exposes `VITE_` settings to visitors at build time. No elevated Supabase key, SMTP password, or Turnstile secret belongs here. These four settings are the relevant browser settings found in the checked application. The `GEMINI_API_KEY` definitions in the Vite configuration do not establish a required AI feature for this setup guide.

Cloudflare's `NODE_VERSION` is a build-tool setting, not a browser setting. The guide selects Node.js 22 for the reader's machine and Pages and explicitly marks cross-platform verification as outstanding. The workspace build was exercised with Node.js 20.20.0; the guide does not claim an actual Windows/Mac installation was tested.

## Setup checks and limitations

- **Dependency downloads:** inspect the forked lockfile itself before `npm ci`. Setting the npm registry does not rewrite private URLs already recorded in `resolved` fields. The lockfile correction must preserve versions and integrity values and remain separate from documentation changes.
- **Build versus tests:** `npm run build` creates the Vite output; it is not a configured test suite, full type check, security audit, or end-to-end sign-in test. Do not document `npm test` or `npm run test:run` as working commands in the current package configuration.
- **Review model:** `types.ts`, the submission pages, the demo data, and the `reviews` table in `init.sql` all use `landlord_rating`, `building_rating`, `bedrooms`, and `tags`. A database trigger keeps new website reviews `pending` and stops non-admins from changing a review's verification status, student flag, landlord, or author; admins have an update policy for verifying, deleting, and restoring reviews. `npm run check:schema` runs `init.sql` in PGlite (Postgres in WebAssembly) with stand-ins for Supabase's `auth` functions and checks these rules. The `created_by_student` flag is still set by the browser, so treat it as a hint, not proof.
- **Turnstile:** browser forms require a nonempty challenge token. That token is not sent to a server-side Siteverify endpoint or forwarded to Supabase as `captchaToken`. Supabase Auth CAPTCHA cannot simply be enabled without the missing integration.
- **Uploads:** a mock upload method exists, but the real Supabase data service does not implement verification-file upload. Do not promise a document-verification feature or recommend making storage public. Cloudflare R2 is not integrated.
- **Email:** auth confirmation and reset depend on Supabase and its SMTP configuration. Pages hosting and DNS do not automatically provide account-email delivery.
- **Personalization:** names, location references, legal text, contact links, student-email rules, and asset permissions need owner review. There is no single site-settings form that changes every local assumption.
- **Permissions:** the UI and a completed build cannot establish who can read, write, or moderate database records. Live access checks remain part of the owner's pre-sharing review.

These are boundaries for the instructions, not fixes. No application, database, deployment configuration, dependency versions, or license were changed by this documentation work.

## Verification sources

Provider documentation was fetched and checked on **October 27, 2026**. Dashboard labels, plan limits, account permissions, and available settings may change. The setup guide marks those details **TO CONFIRM**, and marks account-level actions not exercised in this review separately.

| Instruction | Official source checked |
| --- | --- |
| Personal GitHub copy | [Fork a repository](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo) |
| ZIP download | [Downloading source-code archives](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) |
| GitHub web editing and review | [Editing files](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files), [creating a PR](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request), [merging a PR](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request) |
| Node installers and release choice | [Node.js downloads](https://nodejs.org/en/download) |
| Windows editor installation | [VS Code on Windows](https://code.visualstudio.com/docs/setup/windows) |
| Mac editor installation | [VS Code on macOS](https://code.visualstudio.com/docs/setup/mac) |
| Terminal and shell choice | [VS Code terminal](https://code.visualstudio.com/docs/terminal/getting-started) |
| Local settings and build-time exposure | [Vite environment variables](https://vite.dev/guide/env-and-mode) |
| Supabase project, Connect panel, SQL Editor, Data API | [React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) — its example app and port are not this repository's setup |
| Supabase table dashboard | [Tables and data](https://supabase.com/docs/guides/database/tables) |
| Public versus elevated keys | [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) |
| Email provider and confirmation settings | [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords) |
| Site URL and redirect allowlist | [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) |
| Email delivery and default-sender restrictions | [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) |
| Auth CAPTCHA token requirement | [Supabase CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha) |
| Private storage meaning | [Supabase storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) |
| Turnstile dashboard and hostname configuration | [Create/manage widgets](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/) |
| Public sitekey/private secret distinction | [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/) |
| Mandatory server verification | [Turnstile Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) |
| Mapbox public tokens, restrictions, account limits | [Access tokens](https://docs.mapbox.com/accounts/guides/tokens/) |
| Pages dashboard/GitHub connection | [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) |
| Vite build command and output folder | [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) |
| Node version override | [Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/) |
| Route fallback | [Serving Pages / single-page applications](https://developers.cloudflare.com/pages/configuration/serving-pages/) |
| Domain association, root domains, subdomain CNAME | [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) |
| DNS migration and existing records | [Cloudflare full DNS setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) |

## What was not verified live

No new provider accounts, Supabase projects, email providers, Turnstile widgets, Mapbox tokens, Pages deployments, or DNS zones were created by this documentation work. No private environment-file contents were read. Existing implementation gaps were not silently fixed.

The reader must verify account-specific screens, selected Node release behavior, database initialization, real registration/email/reset flows, data submissions, moderation, and private-data access in their own trial environment. Passing those checks is necessary before sharing; this reference is not a production-readiness certification.
