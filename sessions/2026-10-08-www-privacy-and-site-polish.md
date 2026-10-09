# Session: www Domain, Privacy and 404 Pages, Link Previews, and Site Polish

**Date:** 2026-10-08 (continues `2026-10-08-form-autoreply-and-dmarc.md`)
**Type:** Infrastructure / build / content

## Context
With email and the auto-reply finished, we audited the live site for holes. Found:
- `www` didn't resolve at all
- no link previews
- no privacy note, even though the form collects personal situations
- DO's default 404 page
- no robots or sitemap

Content gaps went on the open items list for Shelton to answer.

## Phone number and hours
- Shelton changed the number on the site to **(678) 310-8503** and the hours to **Mon–Fri 9am–6pm ET**.
- Also updated the number in the auto-reply signature (`Code.gs`) and its README.
- The Atlanta area code now matches the ET hours. The old 714 number had made the time zone confusing.

## www.sdmediates.com
1. Shelton first added `www` A records pointing at the root domain's IPs. DNS resolved, but HTTPS failed with a handshake error. Those IPs are DO/Cloudflare edge servers, and they only serve hostnames that an app has claimed.
2. Added `www.sdmediates.com` under DO → app → Settings → **Domains** ("You manage your domain").
3. Swapped the A records for DO's recommended **CNAME `www` → `admediates-r475k.ondigitalocean.app.`** (Namecheap won't allow a CNAME alongside A records on the same name).
4. DO issued a Google Trust Services certificate for www about 2 minutes later. Verified 200 with the full site.

www serves the same site rather than redirecting, so a **canonical tag** points search engines to `https://sdmediates.com/`.

## Built
| File | What |
|---|---|
| `site/privacy.html` | Plain-language privacy page covering: what's collected (form fields only; no cookies, analytics or trackers), where it goes (Formspree, Google Workspace, Google Fonts), the auto-reply, retention, and how to ask for access or deletion. Linked under the form ("Only I read what you send. How I handle your information") and in the footer. |
| `site/404.html` | Branded "We haven't found common ground here." page, with the two circles drawn **apart**. Uses absolute paths because DO serves it at any missing URL. DO uses `404.html` automatically; no setting was needed. |
| `site/robots.txt` | Allows everything except `/design-system.html`, and points to the sitemap. |
| `site/sitemap.xml` | `/` and `/privacy.html`. |
| `index.html` head | Canonical URL, Open Graph and Twitter tags (absolute image URL, 1200×630, alt text), `apple-touch-icon`. |
| `images/brand/og-image.png` | **Stand-in** preview image: wordmark, two-line headline, and the labeled Venn on mist, rendered with headless Chrome. |
| `images/brand/logo/apple-touch-icon.png` | **Stand-in**, 180×180, rendered from the favicon on solid mist. |

- `styles.css` gained `.form-note`, a footer link style and a small "Simple pages" block (`.page`, `.page-body`, `.page-meta`, `.page-404`).
- The design system's **To make** table marks both stand-ins "Stand-in live". To replace them, export over the same file names and sizes.

Shelton also added to the Contact copy himself: "All emails and their content will be held confidentially."

## Lesson: don't poll a new URL before the deploy lands
- After pushing, I polled `/privacy.html` to detect the deploy. The early requests got a 404, and **DO's CDN cached that 404 for up to 24 hours** (`cache-control: s-maxage=86400`, `cf-cache-status: HIT`).
- Other new files were fine. A cache-busting query (`?v=1`) proved the page was deployed.
- **Next time:** poll a file that already exists and whose content changes, or use a query string, never a brand-new path. Recovery is a redeploy in DO, or waiting for the cache to expire. It was serving 200 by the next check.

## Git refresher (for Shelton's own commits)
- Basic loop: `git status` → `git diff` → `git add <file>` → `git commit -m "Message"` → `git push`. DO redeploys automatically after the push.
- Add files by name, not `git add .`, so the untracked `design/` folder stays out.
- `git commit` without `-m` opens vim. Press `Esc` then type `:wq` to save, or `:q!` to cancel. Alternatively, run `git config --global core.editor nano`.
- One commit went out with the accidental message " am st" while stuck in vim. It's harmless and already pushed, so it was left as is rather than rewriting history.

## Open items
- **Content, which needs Shelton's input:**
  - where in-person sessions happen
  - pricing after the free intro call (this also unblocks #2 Stripe)
  - mediation training and credentials
  - whether to add an FAQ
- **Review the privacy page's promises**, which are placeholders until confirmed:
  - delete within a year if we don't work together
  - handle requests within a week
  - an agreement to mediate covers confidentiality

  Worth a quick lawyer look.
- **Paste the updated `Code.gs`** into Apps Script. It has the new phone number and the name capitalization fix. Until then, auto-replies show the old 714 number.
- **Design assets:** replace the stand-in `og-image.png` and `apple-touch-icon.png`, then work through the rest of the To make list.
- If privacy.html gets a new path or pages are added, update `sitemap.xml`.
- Carried over:
  - #1 shelton@sdmediates.com
  - #2 Stripe
  - commit the Sketch file
  - repo private?
  - DO app name typo
  - DMARC: consider `p=quarantine` after a few clean weeks
