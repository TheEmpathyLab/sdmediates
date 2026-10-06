# Session: Site Prototype, Collaborative Copy Reframe, Formspree, and hello@ Email Setup

**Date:** 2026-10-06 (first session for this project)
**Type:** Design / build / infrastructure

## Context
Started from an empty repo and a stacked wireframe idea: a single-page, tab-anchored, static, mostly HTML/CSS site for the mediation practice, with Hero → About → Services → Process → Contact sections, responsive and mobile-friendly. Goal for the session was a working prototype with images and starter copy.

## Built: the single-page site
- **Files:** `index.html`, `css/styles.css`, `images/`. No framework, no build step. Open `index.html` directly or serve the folder.
- **Navigation:** sticky top tab bar with anchor links. On narrow screens the wordmark sits on its own row and the tabs become a horizontally swipeable strip. A few lines of JS highlight the active tab with an IntersectionObserver. Everything still works without JS.
- **Visual system:**
  - *Palette:* ink teal `#13343b`, tide `#3e7c82`, sage `#a9c2b4`, mist `#eef2f0`, plus a single warm accent, marigold `#e9a93a`, used only for "common ground" moments.
  - *Type:* Bricolage Grotesque for display, Newsreader for body (Google Fonts).
  - Deliberately avoided the cream + serif + terracotta look common to AI-generated sites.
- **Signature element:** hero Venn diagram (inline SVG). Two circles slide together on load and the overlap lights up marigold. Respects `prefers-reduced-motion`.
- **Process section:** the only place with numbered markers, because it's a real sequence. Horizontal timeline on desktop, vertical on mobile, last step filled marigold.
- Checked visually in headless Chrome at 1440px and in a 390px iframe. Headless Chrome on macOS won't render narrower than about 500px, so the iframe trick is how to check true phone width.

## Copy reframe: from courtroom to design sprint
The first draft leaned on legal language ("Settle it at a table, not in a courtroom", disputes, attorneys, litigation). Shelton wanted to lower the temperature and reflect his background in industrial and UX design, empathy trainings and community building, so the copy was reframed around collaboration:
- Hero headline: **"Less me vs. you. More us vs. the problem."** (two deliberate lines, second in teal).
- Venn labels: "Your view" / "Their view" / **"What's possible"**.
- About: "A designer's approach to hard conversations." Principles became Curious / Confidential / Voluntary.
- Services became Families in transition, Teams & workplaces, Partners & co-founders, Neighbors & communities.
- Process: **"It works like a design sprint"**. Intro call → Planned listening session (group, then 1:1 caucuses) → Map & explore → Shape & try (the plan is a roadmap you can adjust together).
- Portrait caption: **"Shelton Davis, MID · Mediator"**, to show the graduate degree.
- Shelton then edited the copy himself (phone number, ET hours, caucus explanation, Empathy Lab, Inc. footer). A follow-up commit fixed typos.
- Kept the footer line "Mediation is not a substitute for legal advice." It's the one legal-ish line left, kept on purpose.

## Repo and hosting
- GitHub CLI was active on the wrong account. Switched to **TheEmpathyLab** and connected to the existing `TheEmpathyLab/sdmediates` repo (public; had only a README and LICENSE).
- **Hosting is DigitalOcean App Platform**, not GitHub Pages. The root domain points at a DO app with a mistyped name (`admediates-…`). The typo seems baked in and may need DO support to rename. It's cosmetic and doesn't affect the site or email.

## Headshot
- Shelton added a full-size B&W headshot (2448×3264, 1.9 MB). Checked it for GPS data (none), then made a web copy: cropped to the 6:7 portrait frame (trimmed sky, kept face and "empathy" shirt), 960×1120, metadata stripped, about 196 KB → `images/shelton-davis.jpg`.
- The original stays local only. `.gitignore` excludes `images/*-bw.jpg` and `.DS_Store`.

## Contact form: Formspree
- Shelton had used Formspree before (Magic Number Calculator / RetireReady). Found by searching the inbox for form-service mail.
- Form posts to `https://formspree.io/f/xoejjevp` with:
  - a custom subject ("New intro call request — SD Mediates")
  - a `_gotcha` honeypot field to catch bots
  - an in-page confirmation and error message via `fetch`, falling back to a normal POST without JS
- Formspree uses the `email` field as reply-to, so pressing Reply goes to the visitor.
- **Tested live and confirmed working.**
- Gotcha: Formspree may refuse submissions from a page opened as a local file. Test from the hosted site or a local server.

## Email: hello@sdmediates.com via Google Workspace
- `sdmediates.com` registered on Namecheap today. It started on Namecheap email forwarding, which can receive but not send.
- The existing domain was already on Google Workspace, so sdmediates.com was added as a domain there rather than buying separate mail.
- **The verification loop:** Gmail's "Send mail as" emails a verification code to the address, but hello@ didn't exist yet, so the code bounced (`550 5.1.1 account does not exist`). The fix is to work in the Admin console first, not Gmail:
  1. Admin → Account → Domains → add and verify `sdmediates.com` (DNS TXT record).
  2. Admin → Directory → Users → Shelton → add the alias `hello@sdmediates.com`.
  3. Test from a personal account.
  4. *Then* add it under Gmail → Settings → Accounts → Send mail as.
- **Receiving confirmed working** (test from a personal email arrived).
- DNS status at end of session:

| Record | Status |
|---|---|
| Google site verification (TXT) | ✅ live |
| MX → `smtp.google.com` | ✅ live |
| SPF `v=spf1 include:_spf.google.com ~all` | ✅ live (public resolvers already see it, despite Google's "up to 72 hours" message) |
| DKIM `google._domainkey` | ✅ published; confirm "Start authentication" was clicked in Admin |
| DMARC `_dmarc` | ❌ not yet added |

## Open items
- **Finish Gmail "Send mail as"** for hello@ and set "Reply from the same address the message was sent to". Send a test reply to a personal account and check it doesn't land in spam.
- **Add DMARC:** TXT record at `_dmarc` with `v=DMARC1; p=none; rua=mailto:hello@sdmediates.com`.
- **Confirm DKIM signing is turned on** in Admin → Apps → Gmail → Authenticate email.
- Optional: point Formspree notifications at hello@sdmediates.com so all practice mail runs through one address.
- **#1 Set up shelton@sdmediates.com.** Decide alias vs. separate mailbox first.
- **#2 Take payments through Stripe.** Recommended Stripe Payment Links (no server needed). Pricing model and where the link lives are still to be decided.
- DigitalOcean app name typo (`admediates`): cosmetic, may need DO support.
- Nice-to-haves not yet done: social sharing image and Open Graph tags, favicon, and a custom thank-you page if the in-page form message isn't enough.
