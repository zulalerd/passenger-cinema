/**
 * PASSENGER CINEMA: send website signups to MailerLite
 *
 * Every ten minutes this looks at the Newsletter tab of this Sheet, adds any
 * new addresses to your MailerLite group, and writes the date into an
 * "In MailerLite" column so nobody is sent twice. The Sheet stays the record
 * of who signed up and when, which is your proof of consent.
 *
 * Nothing on the website changes, and the form keeps working exactly as it
 * does now. If MailerLite is ever down or the key is wrong, signups still land
 * in the Sheet and get picked up on a later run.
 *
 * ---------------------------------------------------------------------------
 * SETTING IT UP (about five minutes)
 *
 *  1. MAILERLITE: make a group and a key.
 *     - Subscribers, Groups, Create group. Call it "Website signups".
 *       Open it and copy the long number at the end of the address bar. That
 *       is the group ID.
 *     - Integrations, API, Generate new token. Copy it.
 *
 *  2. GOOGLE: in this Sheet, Extensions, Apps Script.
 *     - Next to "Files" click +, choose Script, name it mailerlite-sync.
 *     - Paste this whole file in and save.
 *     - Project Settings (the cog), Script Properties, add two:
 *         MAILERLITE_KEY    the token from step 1
 *         MAILERLITE_GROUP  the group ID from step 1
 *
 *  3. Back in the editor choose "setup" from the function menu and Run.
 *     Google will ask you to authorise it. Setup checks the key, checks the
 *     group exists, adds everyone already on the Newsletter tab, and switches
 *     on the ten-minute check.
 *
 *  To pause it, run "stop". To see what it did, View, Logs.
 * ---------------------------------------------------------------------------
 */

var ML = {
  sheetName: "Newsletter",     // the tab the website form writes to
  emailHeader: "Your email",   // the column holding the address
  doneHeader: "In MailerLite", // added by this script
  api: "https://connect.mailerlite.com/api"
};


/* ------------------------------------------------------------ run these -- */

function setup() {
  var group = mlGroup_();
  Logger.log("Key works. Sending signups to group: " + group.name + " (" + group.id + ").");
  syncNewSubscribers();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncNewSubscribers") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("syncNewSubscribers").timeBased().everyMinutes(10).create();
  Logger.log("Done. New signups will now reach MailerLite within ten minutes.");
}

function stop() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncNewSubscribers") ScriptApp.deleteTrigger(t);
  });
  Logger.log("Paused. Signups still land in the Sheet, they just are not sent on.");
}


/* ---------------------------------------------------------- the ten-minute check -- */

function syncNewSubscribers() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ML.sheetName);
    if (!sheet) { Logger.log("No '" + ML.sheetName + "' tab yet. Nothing to do."); return; }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var emailCol = header.indexOf(ML.emailHeader) + 1;
    if (!emailCol) {
      /* the column is named after the form field, so fall back to anything
         that looks like an email column rather than failing outright */
      for (var h = 0; h < header.length; h++) {
        if (String(header[h]).toLowerCase().indexOf("email") > -1) { emailCol = h + 1; break; }
      }
    }
    if (!emailCol) { Logger.log("Could not find an email column on the " + ML.sheetName + " tab."); return; }

    var doneCol = header.indexOf(ML.doneHeader) + 1;
    if (!doneCol) {
      doneCol = header.length + 1;
      sheet.getRange(1, doneCol).setValue(ML.doneHeader).setFontWeight("bold");
    }

    var receivedCol = header.indexOf("Received") + 1;
    var rows = lastRow - 1;
    var emails = sheet.getRange(2, emailCol, rows, 1).getValues();
    var done = sheet.getRange(2, doneCol, rows, 1).getValues();
    var received = receivedCol ? sheet.getRange(2, receivedCol, rows, 1).getValues() : null;
    var group = PropertiesService.getScriptProperties().getProperty("MAILERLITE_GROUP");
    var added = 0;

    for (var i = 0; i < rows; i++) {
      var email = String(emails[i][0] || "").trim();
      if (!email || done[i][0]) continue;
      if (email.indexOf("@") < 1) { sheet.getRange(2 + i, doneCol).setValue("not an email"); continue; }

      var body = { email: email, status: "active" };
      if (group) body.groups = [String(group)];
      /* pass on when they actually signed up, so MailerLite records the real
         consent date rather than today */
      if (received && received[i][0] instanceof Date) {
        body.subscribed_at = Utilities.formatDate(received[i][0], "UTC", "yyyy-MM-dd HH:mm:ss");
      }

      var res = ml_("POST", "/subscribers", body);
      if (res.ok) {
        sheet.getRange(2 + i, doneCol).setValue(new Date());
        added++;
      } else {
        Logger.log("MailerLite refused " + email + ": " + res.message);
        /* stop on the first failure: if the key or group is wrong every row
           would fail the same way, and there is no point hammering the API */
        break;
      }
    }
    if (added) Logger.log("Added " + added + " subscriber(s) to MailerLite.");
  } finally {
    lock.releaseLock();
  }
}


/* --------------------------------------------------------------- helpers -- */

function mlKey_() {
  var key = PropertiesService.getScriptProperties().getProperty("MAILERLITE_KEY");
  if (!key) throw new Error("Add MAILERLITE_KEY first: Project Settings, Script Properties.");
  return key.trim();
}

function ml_(method, path, body) {
  var opts = {
    method: method,
    headers: { Authorization: "Bearer " + mlKey_(), Accept: "application/json" },
    contentType: "application/json",
    muteHttpExceptions: true
  };
  if (body) opts.payload = JSON.stringify(body);
  var res = UrlFetchApp.fetch(ML.api + path, opts);
  var code = res.getResponseCode();
  var text = res.getContentText();
  var parsed = {};
  try { parsed = JSON.parse(text); } catch (e) { parsed = {}; }
  return {
    ok: code < 300,
    code: code,
    data: parsed.data,
    message: parsed.message || (parsed.errors ? JSON.stringify(parsed.errors) : text.slice(0, 200))
  };
}

function mlGroup_() {
  var id = PropertiesService.getScriptProperties().getProperty("MAILERLITE_GROUP");
  if (!id) throw new Error("Add MAILERLITE_GROUP first: the group ID from the address bar in MailerLite.");
  var res = ml_("GET", "/groups/" + encodeURIComponent(id.trim()));
  if (!res.ok) throw new Error("MailerLite would not accept that key or group: " + res.message);
  return { id: res.data.id, name: res.data.name };
}
