# Session: Repo Housekeeping Issues, Private-Repo Question, and the Design System

**Date:** 2026-10-07 (continues `2026-10-06-site-prototype-form-and-email-setup.md`)
**Type:** Planning / design system / assets

## Context
Picked up after the first session's build, Formspree and email work. Two threads: keeping internal docs off the public site, and turning the inline-coded graphics into reusable brand assets documented in a design system, modeled on Helper-ID's (`helper-id.com/design-system.html`).

## Issue #3: move the website into `site/`
- Found that DigitalOcean App Platform serves the **whole repo root**: `sdmediates.com/README.md` returns 200, so anything committed (including `sessions/`) ends up on the public site.
- Shelton decided to fix it later. Logged as **#3 "Move website files into site/ so repo docs aren't served"**:
  - move `index.html`, `css/` and `images/` into `site/`
  - set the DO component's Source Directory to `site`
  - ship both in one push, or the site 404s
- New since then: `design-system.html` (moves with the site) and `design/` (should stay at the repo root, outside `site/`).

## Should the repo be private?
Discussed, not acted on:
- **Making the repo private does not hide anything on the website.** DO still serves whatever it deploys. Only #3 keeps docs off the site.
- Private repos are free, and DO's free static tier doesn't care about repo visibility.
- **What could break:** it depends on how the DO app is connected.
  - Connected through the **GitHub app** (with access to this repo): keeps deploying.
  - Connected as a **"Public Git repository" URL**: new deploys fail, though the current version keeps serving.
- Couldn't verify which from here (no `doctl`, and the GitHub token can't list app installations). To check: DO app → Settings → component → Source, and github.com/settings/installations as TheEmpathyLab. Test with a small push after switching.

## Built: standalone brand assets (`images/brand/`)
Extracted the inline SVGs into reusable files with colors baked in (no CSS variables), so they work in slides, print and social:

| Folder | Files | Notes |
|---|---|---|
| `logo/` | `sdm-mark.svg`, `sdm-mark-reversed.svg`, `sdm-favicon.svg` | Reversed mark (mist + sage rings, for ink backgrounds) and favicon (mark on a mist rounded tile, heavier strokes for 16px) are **new** variants |
| `illustrations/` | `venn-common-ground.svg`, `venn-common-ground-labeled.svg` | Cropped to the circles. The labeled version uses **live text** (Bricolage): outline it before sharing outside the site |
| `icons/` | `icon-families.svg`, `icon-teams.svg`, `icon-partners.svg`, `icon-neighbors.svg` | Same shapes as the service cards |

- Added the SVG favicon to `index.html`. The site had no favicon before.
- **Two sources of truth, on purpose:** the site still draws these shapes inline so the hero can animate and follow CSS tokens. Change a shape in both places. This is noted on the design system page.

## Built: `design-system.html`
- Mirrors the Helper-ID structure:
  - **Brand:** asset tiles with Ready tags and downloads, a "To make" table, Voice & tone Do/Don't, Naming
  - **Tokens:** colors, typography, spacing & layout, effects & motion
  - **Components:** live examples with class names
  - Footer reads "Design System · Internal Reference"
- **Loads the live `css/styles.css`**, so the components shown can't drift from the site. Page-only styles live in its own `<style>` block.
- `noindex` meta so search engines skip it. Public at `/design-system.html` once deployed, same as Helper-ID's.
- Content documents real decisions, not invented ones:
  - Fluid spacing (`clamp()` values), not a fixed step scale, because that's what the site uses.
  - Breakpoints: 52rem, 48rem and 40rem.
  - Voice & tone: "us vs. the problem", design-sprint vocabulary; no sides, disputes or litigation.
  - Naming: SD Mediates, "Shelton Davis, MID", "intro call", the four service names and four step names, and the "an Empathy Lab, Inc. Company" legal line.

## Graphic assets still to make
These are listed on the design system page under **To make**. They need a design tool because of outlined type or required raster sizes:
1. Wordmark: horizontal, reversed and stacked (SVG, text outlined).
2. Logo PNGs at 1× and 2× (email signature, Workspace, Stripe, LinkedIn).
3. Favicon PNGs, 32 and 48 px.
4. Apple touch icon, 180×180, no transparency.
5. Social share image (`og-image.png`), 1200×630. Suggested: Venn + headline + wordmark on mist.
6. Social avatar, 400×400.
7. Email signature logo, about 300×80 at 2×.
8. *(Optional)* process step icons, for slides or handouts.

## Sketch source file
`design/261006-sdmediates.sketch` appeared in the repo. It's Shelton's working file, deliberately **left untracked**. He wants all project material in one place, so it will likely be committed eventually. Until #3 is done, committing it would also make it downloadable from the live site.

## Open items
- **Assets to make** (list above). Once the PNGs exist, wire in `apple-touch-icon`, PNG favicons and Open Graph / Twitter tags (`og:image`, title, description) in `index.html`.
- **#3 `site/` move.** Keep `design/`, `sessions/`, README and LICENSE outside `site/`.
- **Repo private?** Check the DO source connection first (see above).
- **Commit the Sketch file** when ready, ideally after #3.
- Carried over from 2026-10-06:
  - finish Gmail "Send mail as" for hello@
  - add DMARC
  - confirm DKIM "Start authentication"
  - optionally point Formspree notifications at hello@
  - #1 shelton@sdmediates.com
  - #2 Stripe payments
  - DO app name typo (`admediates`)
