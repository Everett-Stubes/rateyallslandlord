# Atlanta website building doc

This is the "Website Customization" form from More Perfect University's Rate Your Landlord Playbook, filled in for the Atlanta site. **Blank rows are for the team to decide.** The last column says where each answer lives in this repository, so a change here can be made on the site too.

## Domain

| Choice | Address | Status | Where it's set |
| --- | --- | --- | --- |
| Top choice | rateyallslandlord.com | Chosen; not yet registered | `siteSettings.ts` (`domain`), `index.html` (`og:url`) |
| Backup 1 | | | |
| Backup 2 | | | |

The playbook says More Perfect University will pay for a domain for at least two years. Ask them before buying one.

## Schools and focus areas

| School | Student email domains | Focus areas | Where it's set |
| --- | --- | --- | --- |
| Georgia Tech | gatech.edu | Home Park, Midtown, Other | `siteSettings.ts` (`schools`) |
| Georgia State | gsu.edu, student.gsu.edu | To be decided | `siteSettings.ts` (`schools`) |

Each focus area has a list of streets. The homepage button for that area shows landlords with a property on one of those streets, counting both the landlord's saved addresses and the addresses tenants give in reviews. Add streets to widen an area. An area with an empty street list (Georgia Tech's **Other**) shows every landlord outside the school's named areas.

Street matching is approximate: Peachtree Street, for example, runs through both Midtown and Downtown.

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

Drafted in `pages/AboutPage.tsx` from the playbook's messaging: why the site exists, where we're starting, how it works, and who's behind it. **Still needed:** the team's contact email (replace `[insert email here]`), and any local story or motivation you want to add.

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
