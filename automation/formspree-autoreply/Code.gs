/**
 * SD Mediates — contact form auto-reply
 *
 * Formspree emails each contact-form submission to shelton@empathylab.io.
 * This script runs every few minutes, finds new submissions, and sends the
 * visitor a short confirmation FROM hello@sdmediates.com.
 *
 * Setup and testing: see README.md in this folder.
 */

const CONFIG = {
  FROM: 'hello@sdmediates.com',
  FROM_NAME: 'Shelton Davis · SD Mediates',
  // Matches the form's _subject ("New intro call request — SD Mediates").
  QUERY: 'from:noreply@formspree.io subject:("intro call request") newer_than:2d',
  LABEL: 'SD Mediates/Auto-replied', // visual marker only; tracking is per message (see below)
  MAX_PER_RUN: 20,
  ONE_REPLY_PER_ADDRESS_HOURS: 24, // limits misuse: an address gets at most one auto-reply a day
  KEEP_HISTORY_DAYS: 7,
};

/**
 * Main job. The time trigger calls this.
 *
 * Gmail groups submissions with the same subject into one conversation, and labels apply
 * to whole conversations. So "already replied" is tracked per message ID in script
 * properties, not with a label. Otherwise the second submission in a conversation would be skipped.
 */
function processNewSubmissions() {
  assertCanSendFromAlias_();

  const props = PropertiesService.getScriptProperties();
  const state = loadState_(props);
  const label = GmailApp.getUserLabelByName(CONFIG.LABEL) || GmailApp.createLabel(CONFIG.LABEL);
  let sent = 0;

  const threads = GmailApp.search(CONFIG.QUERY, 0, 50);
  for (const thread of threads) {
    for (const message of thread.getMessages()) {
      if (sent >= CONFIG.MAX_PER_RUN) break;
      const id = message.getId();
      if (state.messages[id]) continue;

      const submission = parseSubmission_(message);
      state.messages[id] = Date.now(); // mark first, so a failure never causes repeat sends

      if (!submission.email) {
        console.warn(`No visitor email found in message ${id}; skipped.`);
        continue;
      }
      const lastSent = state.addresses[submission.email];
      if (lastSent && Date.now() - lastSent < CONFIG.ONE_REPLY_PER_ADDRESS_HOURS * 3600e3) {
        console.log(`Already replied to ${submission.email} recently; skipped.`);
        continue;
      }

      sendConfirmation_(submission);
      state.addresses[submission.email] = Date.now();
      sent++;
      console.log(`Auto-replied to ${submission.email}.`);
    }
    thread.addLabel(label);
  }

  saveState_(props, state);
}

/** Sends the sample confirmation to you only. Use it to check wording and the From address. */
function testSendToMe() {
  assertCanSendFromAlias_();
  sendConfirmation_({ name: 'Shelton Davis', email: Session.getActiveUser().getEmail() });
  console.log('Test confirmation sent to ' + Session.getActiveUser().getEmail());
}

/** Run once to start the 5-minute schedule. Safe to run again; it won't create duplicates. */
function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'processNewSubmissions')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('processNewSubmissions').timeBased().everyMinutes(5).create();
  console.log('Trigger installed: processNewSubmissions every 5 minutes.');
}

/** Run to stop the auto-replies entirely. */
function removeTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'processNewSubmissions')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  console.log('Trigger removed. No more auto-replies will be sent.');
}

/**
 * Marks every existing submission as already handled without emailing anyone.
 * Run once before installTrigger() so past test submissions don't get replies.
 */
function markExistingAsHandled() {
  const props = PropertiesService.getScriptProperties();
  const state = loadState_(props);
  let count = 0;
  for (const thread of GmailApp.search(CONFIG.QUERY, 0, 100)) {
    for (const message of thread.getMessages()) {
      if (!state.messages[message.getId()]) {
        state.messages[message.getId()] = Date.now();
        count++;
      }
    }
  }
  saveState_(props, state);
  console.log(`Marked ${count} existing submission(s) as handled.`);
}

// ---------- Email content ----------

function sendConfirmation_(submission) {
  const firstName = (submission.name || '').trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  // Deliberately does NOT repeat what the visitor wrote: if someone typed another
  // person's address into the form, their message shouldn't be forwarded to that person.
  const text = [
    greeting,
    '',
    "Thanks for reaching out. I've got your note and will reply within one business day to set up your free 20-minute intro call.",
    '',
    "Nothing you've shared commits you to anything. If you'd like to add more before we talk, just reply to this email.",
    '',
    'Shelton Davis, MID',
    'SD Mediates',
    'hello@sdmediates.com · (714) 420-2715',
    'https://sdmediates.com',
  ].join('\n');

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1e2b2f;max-width:560px">
      <p>${escapeHtml_(greeting)}</p>
      <p>Thanks for reaching out. I've got your note and will reply within one business day to set up your free 20-minute intro call.</p>
      <p>Nothing you've shared commits you to anything. If you'd like to add more before we talk, just reply to this email.</p>
      <p style="margin-top:28px;font-family:'Avenir Next','Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.5;color:#51646a">
        <strong style="color:#13343b">Shelton Davis, MID</strong><br>
        SD Mediates<br>
        <a href="mailto:hello@sdmediates.com" style="color:#3e7c82">hello@sdmediates.com</a> · (714) 420-2715<br>
        <a href="https://sdmediates.com" style="color:#3e7c82">sdmediates.com</a>
      </p>
    </div>`;

  GmailApp.sendEmail(submission.email, 'Thanks for reaching out — SD Mediates', text, {
    from: CONFIG.FROM,
    name: CONFIG.FROM_NAME,
    replyTo: CONFIG.FROM,
    htmlBody: html,
  });
}

// ---------- Parsing ----------

/** Reads the visitor's name and email from a Formspree notification. */
function parseSubmission_(message) {
  const body = decodeEntities_(message.getPlainBody() || '');
  const field = (key) => {
    // Formspree's plain-text format: "name:\nJamie\n\nemail:\njamie@example.com"
    const match = body.match(new RegExp('^' + key + ':\\s*\\n([^\\n]+)', 'mi'));
    return match ? match[1].trim() : '';
  };

  // Formspree sets Reply-To to the visitor's "email" field; fall back to the body.
  const replyTo = extractEmail_(message.getReplyTo());
  const email = replyTo && !/formspree\.io$/i.test(replyTo) ? replyTo : extractEmail_(field('email'));

  return { name: field('name'), email: email };
}

function extractEmail_(value) {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}

function decodeEntities_(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- State & checks ----------

function assertCanSendFromAlias_() {
  const aliases = GmailApp.getAliases().map((a) => a.toLowerCase());
  if (aliases.indexOf(CONFIG.FROM) === -1) {
    throw new Error(
      `${CONFIG.FROM} isn't set up as a "Send mail as" address on this account yet. ` +
        'Add it in Gmail → Settings → Accounts → Send mail as, then run this again.'
    );
  }
}

function loadState_(props) {
  const raw = props.getProperty('state');
  const state = raw ? JSON.parse(raw) : { messages: {}, addresses: {} };
  const cutoff = Date.now() - CONFIG.KEEP_HISTORY_DAYS * 86400e3;
  for (const bucket of [state.messages, state.addresses]) {
    for (const key of Object.keys(bucket)) if (bucket[key] < cutoff) delete bucket[key];
  }
  return state;
}

function saveState_(props, state) {
  props.setProperty('state', JSON.stringify(state));
}
