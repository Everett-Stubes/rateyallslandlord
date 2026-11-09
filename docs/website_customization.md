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
| Agnes Scott College | Agnes Scott | agnesscott.edu | #5B2D86 / #FFFFFF / #CDB8E8 (approximate) |
| Mercer University | Mercer | mercer.edu | #B84F00 / #FFFFFF / #FF9A4D (approximate: Mercer orange, darkened so white lettering is readable) |

All of this is set in `siteSettings.ts` (`schools`), including each campus's map location. "Approximate" colors came from team-color sites, not the school's brand guide; check them before launch.

**Posting needs a school email.** Anyone can read reviews, but adding a landlord or posting a review requires an account made with one of these email domains (subdomains count, so `student.gsu.edu` works). Sign-up rejects other emails, and the database refuses posts from accounts without a school email (admins excepted). The database also requires the email to be **confirmed**, and it never accepts alumni addresses: `alumni.emory.edu` and `alumnae.spelman.edu` are listed as blocked (`blockedEmailDomains` in `siteSettings.ts`).

**To add a school or domain:** add it in **both** places: `siteSettings.ts` and Supabase → Table Editor → `school_email_domains` → Insert row (new databases get the list from `init.sql`). `npm run check:schema` fails if the two lists differ. A database set up before this rule existed needs `migrations/2026-11-09-school-email-only-posting.sql` run once in the Supabase SQL Editor (safe to run again).

Domain notes: Georgia State students use `student.gsu.edu` and faculty/staff use `gsu.edu`, both covered by `gsu.edu`. Clark Atlanta students use `students.cau.edu`, covered by `cau.edu`. Mercer students use `live.mercer.edu`, covered by `mercer.edu`, and these domains are shared with Mercer's other campuses (such as Macon). `msm.edu` and the SCAD student domain (`student.scad.edu`) are not confirmed for students; check with a student at each school.

## Neighborhoods

Each neighborhood is listed once in `siteSettings.ts` (`neighborhoods`) and tagged with the schools whose students commonly live there, so shared areas like Midtown (GT, SCAD) or Castleberry Hill (GSU and the AUC) aren't duplicated. After a visitor picks a school, its neighborhoods show first, closest to campus first, and the rest sit behind a "+ N more" button. Without a pick, every neighborhood shows.

| Neighborhood | Schools | Why it's there |
| --- | --- | --- |
| Home Park | GT | Closest neighborhood north of campus; cheap, walkable, on the Stinger bus routes. |
| Midtown | GT, SCAD | Popular with Tech students; SCAD's student high-rises are here. |
| Atlantic Station | GT, SCAD | Apartments and townhomes a 20–25 minute walk from Tech; pricier than Home Park. |
| West Midtown | GT | West of campus around Howell Mill Rd. |
| Ansley Park | SCAD | Residential Midtown neighborhood next to SCAD. |
| Downtown | GSU | Around campus and the GSU dorms. |
| Old Fourth Ward | GSU | The most-named GSU off-campus area. |
| Inman Park / Cabbagetown | GSU | Quieter, historic houses and duplexes east of Downtown. |
| Grant Park | GSU | Quieter, residential, south-east of Downtown. |
| Castleberry Hill | GSU, AUC | Lofts between Downtown and the AUC. |
| AUC / Vine City | AUC | The streets around the four campuses and just north of them. |
| West End | AUC | South of the AUC. |
| Westview / Ashview Heights | AUC | West of the AUC; houses often shared by groups of AUC students. |
| Druid Hills / Emory | Emory | Emory's own neighborhood: apartment complexes and duplexes. |
| Virginia-Highland / Morningside | Emory | Large apartment complexes; popular with Emory grad students. |
| Decatur | Emory, Agnes Scott | 10–15 minutes from Emory; Agnes Scott is just south of downtown Decatur. Its own city, so it matches any address with ", Decatur" or the 30030 ZIP code. |
| Chamblee & Doraville | Mercer | Around Mercer's Atlanta campus (3001 Mercer University Dr, ZIP 30341). The address box sometimes writes these as "Atlanta", so ZIP codes 30340 and 30341 are matched too. |
| Other | — | Every landlord outside the named neighborhoods. Always last. |

"AUC" means Morehouse, Spelman, Clark Atlanta, and Morehouse School of Medicine. The list came from school housing guides, student newspapers, and rental sites, which are uneven sources. Ask students at each school whether it matches where they actually live, and edit the `schools` tags to match.

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
