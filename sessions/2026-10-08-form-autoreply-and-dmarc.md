# Session: Contact Form Auto-Reply from hello@ and Email Authentication Finished

**Date:** 2026-10-08 (continues `2026-10-08-site-folder-move-checkpoint.md`)
**Type:** Automation / email infrastructure

## Context
After the `site/` move, a live form test showed that Formspree delivered the submission to Shelton, but **the visitor received nothing**. The expectation was a confirmation from hello@sdmediates.com in the submitter's inbox. Formspree's own autoresponder is a paid feature and sends from Formspree, not from our domain, so we built the auto-reply in Google Apps Script on the Workspace account instead.

## Built: `automation/formspree-autoreply/`
- **`Code.gs`:** runs every 5 minutes. It finds new Formspree notifications in Shelton's Gmail and sends each visitor a short confirmation **from hello@sdmediates.com**, with replies going to hello@.
- **`README.md`:** setup steps, everyday use, safeguards and troubleshooting.
- **How it works:**
  - Search: `from:noreply@formspree.io subject:("intro call request") newer_than:2d`. This depends on the form's `_subject` in `site/index.html`. Change both together.
  - **Visitor's email:** read from the notification's Reply-To, which Formspree sets to the visitor. Falls back to parsing the `email:` field in the body.
  - **Name:** parsed from the body. Only the first name is used, and its first letter is capitalized.
- **Safeguards:**
  - **Tracked per message ID, not by Gmail label.** Formspree notifications share a subject, so Gmail threads them together, and labels apply to the whole thread. Label-based tracking would skip the second submission. The label `SD Mediates/Auto-replied` is only a visual marker.
  - **Marked as handled before sending,** so an error can never cause repeat sends.
  - **At most one auto-reply per address per 24 hours,** and at most 20 per run.
  - **Never repeats the visitor's message.** If someone types another person's address, that person learns nothing about what was written.
  - **Checks that hello@ is a "Send mail as" alias** before sending, and stops with a clear error if not.
- **Functions to run by hand:**
  - `testSendToMe`
  - `markExistingAsHandled` (run once before going live)
  - `installTrigger` / `removeTrigger`

## Deployment
- Tried clasp from the CLI first. Workspace required re-authentication (`invalid_rapt`), so Shelton set it up **by hand** at script.google.com instead (project "SD Mediates — form auto-reply", on shelton@empathylab.io).
- Because it's hand-pasted, **edits to `Code.gs` in the repo must be pasted into the Apps Script editor again**. The repo copy is the source of truth. Switching to clasp later would make this a `clasp push`.
- **Verified end to end in Gmail:**
  - `testSendToMe` delivered from hello@sdmediates.com.
  - A live form submission from a personal Gmail got the auto-reply about 11 seconds after the Formspree notification arrived.
  - Replying to it landed back at hello@.

## Email authentication: DMARC added
- DMARC was the last missing record. First attempt had a typo (`rua=mailto:hello@sdmediates.com. p=none`). The "fix" was then saved as a **second** TXT record.
  - **Two DMARC records make DMARC invalid.** Receivers ignore it entirely. Always edit the existing `_dmarc` record; don't add a new one.
- Final, verified on Namecheap's nameservers: `v=DMARC1; p=none; rua=mailto:hello@sdmediates.com`. Public resolver caches clear within the 30-minute TTL.

| Record | Status |
|---|---|
| MX → `smtp.google.com` | ✅ |
| SPF `v=spf1 include:_spf.google.com ~all` | ✅ |
| DKIM `google._domainkey` | ✅ signing on |
| DMARC `_dmarc` | ✅ single record, `p=none` |
| hello@: receive, Send mail as, auto-reply | ✅ |

- Daily DMARC aggregate reports (zipped XML) will now arrive at hello@. A Gmail filter can keep them out of the inbox.

## Open items
- **Paste the updated `Code.gs`** (first-name capitalization) into the Apps Script editor.
- **After a few clean weeks of DMARC reports,** consider moving `p=none` to `p=quarantine`.
- Optional: point Formspree notifications at hello@ so all practice mail runs through one address. If you do, the script still works, because hello@ is an alias on the same mailbox.
- Optional: set up clasp (`npx @google/clasp login`, then link the project) so script changes deploy from the repo.
- Carried over:
  - assets to make
  - OG/meta tags
  - repo private?
  - commit the Sketch file
  - #1 shelton@sdmediates.com
  - #2 Stripe payments
  - DO app name typo
