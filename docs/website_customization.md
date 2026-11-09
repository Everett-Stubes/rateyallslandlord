# Atlanta website building doc

This is the "Website Customization" form from More Perfect University's Rate Your Landlord Playbook, filled in for the Atlanta site. **Blank rows are for the team to decide.** The last column says where each answer lives in this repository, so a change here can be made on the site too.

## Domain

| Choice | Address | Status | Where it's set |
| --- | --- | --- | --- |
| Top choice | rateyallslandlord.com | Registered in Cloudflare (2026-11-09); paid by the team | `siteSettings.ts` (`domain`), `index.html` (`og:url`) |
| Backup 1 | | | |
| Backup 2 | | | |

The team is paying for the domain directly (the playbook mentions More Perfect University may cover it; we're not using that).

## Schools

| School | Student email domains | Where it's set |
| --- | --- | --- |
| Georgia Tech | gatech.edu | `siteSettings.ts` (`schools`) |
| Georgia State | gsu.edu (faculty/staff), student.gsu.edu (students) | `siteSettings.ts` (`schools`) |
| Agnes Scott | agnesscott.edu (everyone) | `siteSettings.ts` (`schools`) |
| Spelman | spelman.edu (students and staff) | `siteSettings.ts` (`schools`) |
| Mercer | live.mercer.edu (students), mercer.edu (faculty/staff). Shared with Mercer's Macon campus. | `siteSettings.ts` (`schools`) |

**Only people who sign up with one of these exact email domains (and confirm the email) can post reviews or add landlords.** Everyone else can read the site. This is enforced in two places that must stay the same:

1. `siteSettings.ts` (`schools` → `emailDomains`): the sign-up form and the messages on the site.
2. The `school_email_domains` table in Supabase (Table Editor): the real lock, which the database checks on every post. `init.sql` fills it in for new databases. `npm run check:schema` fails if the two lists differ.

**To add a school:** add its domain to both places (Supabase: Table Editor → `school_email_domains` → Insert row). Confirm the exact address format with that school first: Georgia State, for example, gives students `@student.gsu.edu` and staff `@gsu.edu`. An exact match is required; `mail.school.edu` is not the same as `school.edu`.

`gsu.edu` is on the list because the site started with it, but it is the faculty and staff domain at Georgia State. Remove it from both lists if you want students only.

## Neighborhoods

The homepage buttons, in order: **Home Park**, **Midtown**, **Downtown**, **Decatur**, **Chamblee & Doraville**, **Other**. They apply to every landlord on the site, not to one school. Set them in `siteSettings.ts` (`neighborhoods`). Decatur is where Agnes Scott is; Chamblee & Doraville is the area around Mercer's Atlanta campus (3001 Mercer University Dr, ZIP 30341).

Each neighborhood has a list of matches. Its button shows landlords with a property that matches one of them, counting both the landlord's saved addresses and the addresses tenants give in reviews. An entry can be a street (`E College Ave`), a city (`, Decatur,` with the commas), or a ZIP code (`30341`). Cities and ZIP codes are there because the address box sometimes writes Mercer-area addresses as "Atlanta". Add entries to widen a neighborhood. A neighborhood with an empty list (**Other**) shows every landlord outside the named ones.

Street matching is approximate. A landlord whose buildings are in two neighborhoods appears under both, and long streets cross neighborhood lines: Piedmont Ave is listed under Downtown for the Georgia State dorms, so Midtown addresses on Piedmont also show up there.

## Landlords with several properties

A landlord's page lists each building separately, with its own landlord grade, building grade, and review count; click a building to see only its reviews. Buildings come from the landlord's saved addresses plus every address tenants give in reviews, with unit numbers removed ("123 Hemphill Ave NW, Apt 2B" counts as "123 Hemphill Ave NW"). Admins can still add or remove saved addresses with **Manage Addresses**.

If tenants add the same company twice (for example, the owner and its management company), the two pages are separate. There is no merge tool yet.

## Landlords to list at launch

The playbook asks for the major landlords that should already be on the site. Visitors can still add landlords who aren't listed.

| Landlord or management company | Area | Added by |
| --- | --- | --- |
| | | |
| | | |
| | | |

Add these through the site's **Add a landlord** form, or in Supabase's `landlords` table, once the real database is connected. The demo landlords in `services/MockApiService.ts` are fake and only appear in demo mode.

## Color scheme

Taken from the More Perfect University logo.

| Order | Name | Hex code | Where it's set |
| --- | --- | --- | --- |
| Primary | MPU navy | `#101222` | `styles.css` (`--neutral-500`, `--primary-500`) |
| Secondary | MPU purple | `#50438F` | `styles.css` (`--primary-300`) |
| Accent | MPU lavender | `#C6B4DB` | `styles.css` (`--lavender`) |
| Other | Page background | `#F6F3FB` | `styles.css` (`--page`) |

Logo colors are separate. Change them in `logoSettings.ts`; see [logo_customization.md](logo_customization.md).

## About page

Drafted in `pages/AboutPage.tsx` from the playbook's messaging: why the site exists, where we're starting, how it works, and who's behind it. **Still needed:** any local story or motivation you want to add.

## FAQ page

Adapted from the playbook's FAQ in `pages/FaqPage.tsx` and shown at `/faq`. Review the answers about moderation ("What gets removed?") so they match how your team will actually moderate.

## Resources page

In `pages/ResourcesPage.tsx`. Links were checked in November 2026:

- Georgia Landlord-Tenant Handbook (Georgia Department of Community Affairs)
- Atlanta Volunteer Lawyers Foundation: landlord/tenant problems and evictions
- Atlanta Legal Aid Society
- Georgia Tech SGA legal advising
- ATL311 for housing code violations

**Still to add:** Georgia State student resources, the team's social media handles, media coverage, and ways to get involved. Recheck the links each semester.
