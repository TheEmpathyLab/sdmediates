# Session: `site/` Folder Move Shipped (#3)

**Date:** 2026-10-08 (checkpoint, continues `2026-10-07-design-system-and-brand-assets.md`)
**Type:** Infrastructure

## What changed
- Moved the website into `site/`:
  - `index.html`
  - `design-system.html`
  - `css/`
  - `images/`
- `.gitignore` now ignores `site/images/*-bw.jpg`. The full-size headshot original moved along with the folder and is still untracked.
- Repo root now holds only non-website material: `sessions/`, `design/` (Sketch, uncommitted), `README.md`, `LICENSE`.
- All page links are relative, so no HTML changes were needed. Verified every local `src`/`href` resolves.

## Deploy order (lesson learned)
Planned to change DigitalOcean's Source Directory first, expecting that deploy to fail while the old site kept serving. **DO won't save a Source Directory that doesn't exist in the repo yet**, so the order had to be:
1. Push the move to `main`. The site briefly 404s, because DO is still serving the repo root.
2. Set DO → app → Settings → static site component → **Source Directory: `site`**.
3. DO redeploys from `site/`.

For future moves: push first, then change DO immediately.

## Verified live
| URL | Status |
|---|---|
| `/`, `/design-system.html`, `/css/styles.css`, `/images/shelton-davis.jpg`, `/images/brand/logo/sdm-favicon.svg` | 200 |
| `/README.md`, `/sessions/…`, `/site/index.html` | 404 (as intended) |

Live page carries the latest content: fixed title, MID caption, Formspree form and favicon. #3 closed.

## Open items
- Send one real contact form test on the live site after the move.
- Committing the Sketch file in `design/` is now safe. It won't be served.
- Everything else carries over from `2026-10-07-design-system-and-brand-assets.md`:
  - assets to make
  - OG/meta tags
  - repo private?
  - email: Send mail as, DMARC, DKIM
  - #1 shelton@sdmediates.com
  - #2 Stripe payments
  - DO app name typo
