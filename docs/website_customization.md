# Atlanta website building doc

This is the "Website Customization" form from More Perfect University's Rate Your Landlord Playbook, filled in for the Atlanta site. **Blank rows are for the team to decide.** The last column says where each answer lives in this repository, so a change here can be made on the site too.

## Domain

| Choice | Address | Status | Where it's set |
| --- | --- | --- | --- |
| Top choice | rateyallslandlord.com | Chosen; not yet registered | `siteSettings.ts` (`domain`), `index.html` (`og:url`) |
| Backup 1 | | | |
| Backup 2 | | | |

The playbook says More Perfect University will pay for a domain for at least two years. Ask them before buying one.

## Schools

When someone first opens the site, a pop-up asks which school they go to. Each button uses the school's colors, and picking one recolors the whole site (header, footer, buttons, links, logo flag) and sorts the neighborhood buttons closest-to-campus first. The choice is saved in that browser; the school button at the top of the page changes it. "I'm not a student" keeps the default colors.

| School | Header label | Email domains | Colors (background / text / accent) |
| --- | --- | --- | --- |
| Georgia Tech | GT | gatech.edu | #003057 / #B3A369 / #B3A369 |
| Georgia State | GSU | gsu.edu | #0039A6 / #FFFFFF / #8FB3F0 |
| Emory | Emory | emory.edu | #012169 / #F2A900 / #F2A900 |
| Morehouse College | Morehouse | morehouse.edu | #8B2433 / #FFFFFF / #E3AEB6 (approximate) |
| Spelman College | Spelman | spelman.edu | #114488 / #FFFFFF / #55BBEE (approximate) |
| Clark Atlanta University | CAU | cau.edu | #C8102E / #FFFFFF / #BABABC (approximate) |
| Morehouse School of Medicine | MSM | msm.edu | #003A70 / #F5F0E1 / #D8CFAF (approximate) |
| SCAD Atlanta | SCAD | scad.edu | #000000 / #FFFFFF / #F9C80E (approximate) |

All of this is set in `siteSettings.ts` (`schools`), including each campus's map location. "Approximate" colors came from team-color sites, not the school's brand guide; check them before launch.

**Posting needs a school email.** Anyone can read reviews, but adding a landlord or posting a review requires an account made with one of these email domains (subdomains count, so `student.gsu.edu` works). Sign-up rejects other emails, and the database refuses posts from accounts without a school email (admins excepted). When you add or remove a school, change the domain list in **both** `siteSettings.ts` and the `is_school_email` function in `init.sql`. A database set up before this rule existed needs `migrations/2026-11-07-school-email-posting.sql` run once in the Supabase SQL Editor.

## Neighborhoods

The homepage buttons: **Home Park**, **Midtown**, **Downtown**, **AUC / Vine City**, **West End**, **Druid Hills / Emory**, and **Other**. They apply to every landlord on the site. Set them in `siteSettings.ts` (`neighborhoods`). After a visitor picks a school, the buttons are sorted by distance from that campus (for Georgia Tech: Home Park, then Midtown); **Other** always stays last. Each neighborhood's `center` sets where it is for that sorting.

Each neighborhood has a list of streets. Its button shows landlords with a property on one of those streets, counting both the landlord's saved addresses and the addresses tenants give in reviews. Add streets to widen a neighborhood. A neighborhood with an empty street list (**Other**) shows every landlord outside the named ones.

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
