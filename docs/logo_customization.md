# Customize your logos without an image editor

Both website logos are now drawn from **one settings file**, [`logoSettings.ts`](../logoSettings.ts). Change the words and colors there; you do not need to draw a logo or replace an image.

The original two layouts are provided: a small header logo with initials, a flag, and a name underneath; and a larger homepage logo with two lines of text beside a labeled flag. These are editable SVG graphics, meaning the browser draws their shapes and lettering instead of displaying a flattened picture.

## 1. Find the settings in your own GitHub copy

1. Open **your own repository** on GitHub. Check that its owner is your account or organization.
2. Select **Code**, then open `logoSettings.ts` in the main folder, alongside `package.json`.
3. Select the pencil button to edit the file. **TO CONFIRM:** GitHub may place this action under a menu in narrower windows.
4. You should see a `text` section followed by a `colors` section. Lines beginning with `//` are explanations, not settings.

These steps work in a web browser on both Windows and Mac. No terminal commands are needed.

## 2. Change the words

Change only the value **inside the double quotes** to the right of the setting name. Keep the setting names, quotes, commas, and braces.

| Setting | What you will see |
| --- | --- |
| `headerInitials` | Large initials in the small top-navigation logo, such as `RYL` |
| `headerSubtitle` | The name underneath those initials |
| `homepageLineOne` | The first line of the large homepage logo |
| `homepageLineTwo` | The second line of the large homepage logo |
| `pennantLabel` | The words inside the large homepage flag |

For example, these are valid replacement text settings:

```ts
  text: {
    headerInitials: "RYL",
    headerSubtitle: "Your University",
    homepageLineOne: "RATE YOUR",
    homepageLineTwo: "LANDLORD",
    pennantLabel: "YOUR UNIVERSITY",
  },
```

This is an example to read or copy into the matching section of the file, **not a terminal command**. Do not include the Markdown backticks around the example.

Use short labels, especially for the header initials and the flag. Longer wording is squeezed to fit rather than drawn over the neighboring artwork, but very long labels will become difficult to read. The accessible descriptions used by screen readers update automatically from your text.

For ordinary names, an apostrophe is fine: `"Students' Union"`. If you need a double quote inside a label, write it as `\"` so it does not end the value early.

## 3. Change the colors

Each color is a **hex color code**: a `#` followed by six letters or numbers, such as `"#2563EB"` for blue. Keep the code inside quotes.

| Setting | What changes |
| --- | --- |
| `headerText` | Header initials and the name underneath |
| `headerPennant` | The small header flag |
| `homepageText` | Both large homepage text lines |
| `homepagePennant` | The large homepage flag |
| `pennantStripe` | The narrow stripe along the left edge of **both** flags |
| `pennantText` | The lettering inside the homepage flag |

1. Find the color you want to change in the `colors` section.
2. Replace its quoted code with your own six-digit code.
3. Keep header lettering visible against the header's dark background. Keep homepage lettering visible against the homepage background and the flag's lettering visible against the flag itself.

**Expected result:** both logos keep their provided layouts, but display your wording and chosen colors. Their backgrounds remain transparent.

## 4. Save, review, and publish your change

1. Select **Commit changes** and describe your edit, for example, “Customize logo wording and colors.”
2. Choose to create a new branch and open a pull request. A branch keeps your proposed edit separate; a pull request lets you review it before adding it to your main website files.
3. Check **Files changed**. For a logo-settings-only edit, only `logoSettings.ts` should change.
4. Review your settings, then merge the pull request into your own website's publishing branch, usually `main`.
5. If Cloudflare Pages is connected to that branch with automatic deployments enabled, wait for its new deployment to finish successfully.
6. Open the published site. Check the small header logo and the large homepage logo on a computer and a phone. Confirm that all wording is readable and the colors have enough contrast.

**Expected result:** the rebuilt site displays the new text and colors in both places. Editing the settings does not alter an already-built site until another build and deployment runs.

If you already run the local demo, save `logoSettings.ts` in your local project and check the address printed by `npm run dev`; the preview normally updates automatically. Local edits are not uploaded to GitHub until you commit and push them.

## If something goes wrong

| What you see | What to check |
| --- | --- |
| The build fails after an edit | Check for a missing quote, comma, or brace. Compare against the original settings file. An ordinary sentence cannot be pasted outside quotes. |
| A color looks wrong | Use `#` plus exactly six hexadecimal characters (`0–9` or `A–F`) inside quotes. Check that you edited the intended color setting. |
| The letters are too small | Shorten the label. The small header logo is deliberately compact. |
| The site still shows the old logos | Confirm you edited your own repository, merged into the branch Pages publishes, and have a successful new deployment. Refresh the page afterward. |
| Replacing a PNG has no effect | `mini-logo.png` and `home-logo.png` are retained as originals, but are no longer used by the header or homepage. Edit `logoSettings.ts` instead. |

## What this does not change

This file controls **only the two logos**. It does not change site-wide theme colors, the browser tab title or icon in `index.html`, page text, contact information, legal pages, or student-email rules. Review those separately using the [setup guide](replication_guide.md).

The logos continue to use the site's existing font with browser fallbacks. This feature does not grant rights to bundled fonts, organization names, or branding; review those rights before publishing your own website.
