# Contact form auto-reply (Google Apps Script)

When someone submits the contact form on sdmediates.com, Formspree emails the submission to shelton@empathylab.io. This script checks for new submissions every 5 minutes and sends the visitor a short confirmation **from hello@sdmediates.com**.

It runs inside your own Google account. It's free (Workspace allows about 1,500 sends a day) and doesn't touch the website.

## What the visitor receives
> **Subject:** Thanks for reaching out — SD Mediates
>
> Hi Jamie,
>
> Thanks for reaching out. I've got your note and will reply within one business day to set up your free 20-minute intro call.
>
> Nothing you've shared commits you to anything. If you'd like to add more before we talk, just reply to this email.
>
> Shelton Davis, MID · SD Mediates · hello@sdmediates.com · (678) 310-8503

To change the wording, edit `sendConfirmation_()` in `Code.gs`. There's a plain-text and an HTML version; keep them matching.

## Before you start
**hello@sdmediates.com must be a "Send mail as" address** in Gmail (Settings → Accounts → Send mail as). The script checks this and stops with a clear message if it isn't.

## Setup (about 5 minutes)
1. Go to **script.google.com**, signed in as **shelton@empathylab.io**. Click **New project**.
2. Rename it to `SD Mediates — form auto-reply`.
3. Replace everything in `Code.gs` with the contents of `Code.gs` from this folder, then save (⌘S).
4. In the function dropdown at the top, run **`testSendToMe`**.
   - Google asks you to authorize the script (Gmail access). Approve it.
   - You should receive the confirmation in your inbox, sent from hello@sdmediates.com. Check the wording, and check it didn't land in spam.
5. Run **`markExistingAsHandled`** once, so your earlier test submissions don't get replies.
6. Run **`installTrigger`**. From now on it checks every 5 minutes.
7. Submit the form on sdmediates.com using a personal email address. Within about 5 minutes that address should receive the confirmation.

## Everyday use
- Nothing to do. It runs on its own.
- Handled submissions get the Gmail label **SD Mediates/Auto-replied** so you can see at a glance which ones went out.
- **To pause it:** run `removeTrigger`. **To restart it:** run `installTrigger`.
- **To see what happened:** in script.google.com, open the project and go to **Executions**. Each run logs who was replied to or skipped.

## Safeguards
- **Each submission is replied to once.** It's tracked by message ID, not by Gmail label. Gmail groups submissions with the same subject into one conversation, and labels apply to whole conversations, so label-based tracking would skip later submissions.
- **At most one auto-reply per email address per 24 hours.** This limits misuse if someone repeatedly submits the form with another person's address.
- **The visitor's message is never repeated back.** If someone typed another person's address, that person learns nothing about what was written.
- **At most 20 replies per run.** Submissions are only checked from the last 2 days.

## If something goes wrong
| Symptom | Likely cause |
|---|---|
| Error: "isn't set up as a Send mail as address" | Add hello@ under Gmail → Settings → Accounts → Send mail as. |
| Visitor got nothing | Check **Executions** for errors. Make sure the Formspree subject still contains "intro call request" (set by `_subject` in `site/index.html`). |
| Reply landed in spam | Check SPF, DKIM and DMARC for sdmediates.com (see the session notes). |
| You change the form's subject line | Update `QUERY` in `CONFIG` to match. |
