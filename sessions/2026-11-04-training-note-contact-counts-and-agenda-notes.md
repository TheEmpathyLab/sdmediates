# Session: Domestic Mediation Training Note, Contact Counting and Agenda Notes

**Date:** 2026-11-04, started 2026-11-03 (continues `2026-10-08-www-privacy-and-site-polish.md`)
**Type:** Content / automation / workflow

## Context
The morning `/agenda` for SDM came back stale: the newest note was 26 days old, so there was no current Next. Two commits had gone out since that note without a session note:
- `9dd3ddf` (2026-10-12): reorganized the Services ("areas of expertise") cards in `site/index.html`
- `2b10c39` (2026-10-20): the privacy page now discloses Cloudflare's `__cf_bm` cookie instead of saying the site sets no cookies

Shelton then wanted three things: a place for SDM agenda items that carry over day to day, a note on the site that domestic mediation training is still in progress, and some way to measure the site.

## Decisions
- **The site says "Domestic mediation in training".** Shelton can't offer domestic mediation yet and expects to finish training in early 2027. The note goes on the Families in transition card, the only service covering separating, divorce and co-parenting. The card's own copy wasn't changed, so it still lists those situations, with the note qualifying them.
- **No analytics on the site. Count human contact only.** Shelton wants to count only "human to human interactions," not site traffic. Cloudflare Web Analytics, Plausible, GoatCounter and Google Analytics were considered and all rejected: any of them would have meant rewriting the privacy page's "doesn't use analytics, ad trackers, or tracking cookies," and the site's visitors are often people in a family or legal conflict. Contacts are counted from Gmail instead, after they arrive.
- **`agenda-notes.md` is gitignored.** It's Shelton's own list and the repo may be public.

## Site: domestic mediation training note
- `site/index.html`: added `<p class="service-note">Domestic mediation in training · Completing early 2027</p>` under the Families in transition description, with an HTML comment saying to remove it once training is complete.
- `site/css/styles.css`: added `.service .service-note`, small text in the site's teal (`--tide`) and heading font (`--font-display`), so it reads as a status label.
- Verified live at https://sdmediates.com after the DigitalOcean deploy, using a cache-busting query on `/` (see the 2026-10-08 lesson about polling new paths).

## Counting contacts: `countContacts`
Added to `automation/formspree-autoreply/Code.gs` and documented under "Counting who reached out" in that folder's `README.md`.
- It runs only when started by hand from the function dropdown in Apps Script. The 5-minute trigger still runs only `processNewSubmissions`.
- It logs one line per month for the last 6 months: `people`, `form` (Formspree notifications), `email` (sent directly to hello@sdmediates.com, not from Shelton or Formspree). `people` counts distinct addresses across both.
- It reads Gmail only. It sends nothing, saves nothing, and logs no names or addresses.
- Phone calls aren't counted. They're in Shelton's phone's call log.
- Shelton pasted the updated `Code.gs` into Apps Script, which also put the October phone-number and name-capitalisation fixes live. Running it didn't ask for new approval.

First run, 2026-11-04:

```
2026-06 … 2026-09  all 0 (before the site launched)
2026-10  people: 1  form: 0  email: 1
2026-11  people: 0  form: 0  email: 0
```

`form: 0` looked suspicious, because the October notes mention test submissions. A Gmail search for `from:noreply@formspree.io subject:("intro call request")` returned nothing, so the tests had been deleted and the zero is correct. The one October email could be a test from Shelton's own address, since the count doesn't exclude any senders.

## Agenda notes
- `agenda-notes.md` at the repo root is Shelton's hand-written list for `/agenda`. Only Shelton edits it. It has two sections:
  - `## Humaning`: calls, emails, follow-ups. Add `(by YYYY-MM-DD)` to an item and it's flagged as due from that date.
  - `## Waiting on me`: decisions. These count as current even when session notes are stale, and checking one off removes the matching session-note decision from the agenda.
- `~/.claude/commands/agenda.md` (Project mode, step 5, and the format example) was updated to read both sections. A file with no headings is still read as all Humaning.
- Software tasks go in session notes, not in `agenda-notes.md`. `/agenda` takes Next from this note's "Next session entry point."
- The "Update site to say something about domestic training" item has been checked off.

## Built
| File | What |
|---|---|
| `.gitignore` | Ignores `agenda-notes.md`. |
| `site/index.html` | Training note on the Families in transition card. |
| `site/css/styles.css` | `.service .service-note` style. |
| `automation/formspree-autoreply/Code.gs` | `countContacts()`, plus helpers `searchMessages_()` and `gmailDate_()`. |
| `automation/formspree-autoreply/README.md` | "Counting who reached out" section. |
| `~/.claude/commands/agenda.md` | Outside this repo: reads `## Humaning` and `## Waiting on me` from `agenda-notes.md`. |

Commits: `f7620c9` Ignore agenda-notes.md, `b688977` Note domestic mediation training; count contacts from Gmail.

## Open items
- **Next session entry point:** replace the stand-in `site/images/brand/og-image.png` (1200×630) and `apple-touch-icon.png` (180×180) with real exports, using the same file names and sizes. This needs Shelton's design export first.
- **Needs Shelton's input** (also in `agenda-notes.md` → Waiting on me, where marked):
  - pricing after the free intro call (in agenda-notes; also unblocks #2 Stripe)
  - where in-person sessions happen (in agenda-notes)
  - mediation training and credentials copy, now partly covered by the training note
  - whether to add an FAQ
  - confirm the privacy page's placeholder promises (delete within a year, handle requests within a week, agreement to mediate covers confidentiality). Worth a quick lawyer look.
  - whether the Families in transition card should keep listing separating/divorcing and co-parenting before training is done, or be reworded until 2027
- **To do:**
  - When training is complete (expected early 2027), remove the `service-note` paragraph and its comment from `site/index.html`, and update the credentials copy.
  - Work through the rest of the design system's To make list.
  - If pages are added or `privacy.html` moves, update `site/sitemap.xml`.
- **Optional, later:**
  - Let `countContacts` ignore a list of Shelton's own addresses, so tests aren't counted.
  - In the dashboard repo, check that `tools/agenda_view.py` still checks off items now that `agenda-notes.md` has `##` headings. It wasn't read from here.
- Carried over:
  - #1 shelton@sdmediates.com
  - #2 Stripe
  - commit the Sketch file
  - repo private?
  - DO app name typo (`admediates`)
  - DMARC: consider `p=quarantine` after a few clean weeks. It's been about four weeks, so this may be ready.
