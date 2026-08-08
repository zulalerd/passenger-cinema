/**
 * PASSENGER CINEMA — form handler
 *
 * Receives submissions from the website and appends them to a Google Sheet,
 * one tab per form. Optionally emails you when something arrives.
 *
 * ---------------------------------------------------------------------------
 * SETTING IT UP (about five minutes, all in your own Google account)
 *
 *  1. Create a new Google Sheet. Call it something like
 *     "Passenger Cinema — website responses".
 *
 *  2. In that Sheet: Extensions → Apps Script. Delete whatever is in the
 *     editor and paste this entire file in.
 *
 *  3. Change NOTIFY_EMAIL below if you want an alert on every submission,
 *     or set it to "" to turn emails off.
 *
 *  4. Click Deploy → New deployment.
 *       - Click the gear next to "Select type" and choose Web app
 *       - Description:      passenger cinema forms
 *       - Execute as:       Me
 *       - Who has access:   Anyone
 *     Then Deploy. Google will ask you to authorise it; that is expected,
 *     it is your own script writing to your own Sheet.
 *
 *  5. Copy the Web app URL it gives you. It looks like
 *     https://script.google.com/macros/s/AKfy..../exec
 *
 *  6. Paste that URL into the CMS under Site text & settings → Form endpoint
 *     (or into data/site.json as "formEndpoint"). Save. Done.
 *
 * If you ever edit this script, you must Deploy → Manage deployments →
 * edit → New version, or the live site keeps running the old code.
 * ---------------------------------------------------------------------------
 */

var NOTIFY_EMAIL = "hello@passengercinema.com";  // set to "" for no emails

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var formName = String(data._form || data._subject || "Other").slice(0, 90);
    delete data._form;
    delete data._subject;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(formName) || ss.insertSheet(formName);

    var keys = Object.keys(data);

    // first write to this tab: lay down a header row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Received"].concat(keys));
      sheet.getRange(1, 1, 1, keys.length + 1).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // reuse the existing header order, adding any new columns on the end
    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    keys.forEach(function (k) {
      if (header.indexOf(k) === -1) {
        header.push(k);
        sheet.getRange(1, header.length).setValue(k).setFontWeight("bold");
      }
    });

    var row = header.map(function (h) {
      if (h === "Received") return new Date();
      return data[h] != null ? data[h] : "";
    });
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      var body = keys.map(function (k) { return k + "\n" + data[k]; }).join("\n\n");
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "Passenger Cinema — " + formName,
        body: body + "\n\n---\n" + ss.getUrl()
      });
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// The site posts as text/plain so the browser skips the CORS preflight,
// which Apps Script cannot answer. This still arrives as JSON in e.postData.
function doGet() {
  return json({ ok: true, note: "Passenger Cinema form handler is running." });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
