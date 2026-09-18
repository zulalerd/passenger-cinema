/**
 * PASSENGER CINEMA: ticket confirmation emails
 *
 * Every five minutes this asks Stripe for new purchases made through the ticket
 * link, emails each buyer their ticket, and adds them to a "Tickets" tab in the
 * Sheet. That tab doubles as the door list, and it is how the script knows who
 * has already been emailed, so nobody gets two.
 *
 * Why it checks Stripe rather than Stripe calling it: Apps Script web apps reply
 * with a redirect, which Stripe counts as a failed delivery. It retries, sends
 * duplicate emails, and eventually switches the webhook off. Checking every five
 * minutes avoids all of that and needs nothing public.
 *
 * ---------------------------------------------------------------------------
 * SETTING IT UP (about ten minutes, all in your own accounts)
 *
 *  1. STRIPE: make a key that can only look at ticket sales.
 *     Dashboard, Developers, API keys, "Create restricted key".
 *       - Name it "Ticket emails".
 *       - Set "Checkout Sessions" to Read and "Payment Links" to Read.
 *       - Leave everything else as None. Create, then copy the key
 *         (it starts rk_live_).
 *     Keep it to yourself. It never goes into this file or the website.
 *
 *  2. GOOGLE: open the Sheet that holds your website form responses,
 *     then Extensions, Apps Script.
 *       - Next to "Files", click +, choose Script, name it ticket-emails.
 *       - Paste this entire file in and save.
 *       - Project Settings (the cog), Script Properties, Add script property:
 *           Property: STRIPE_KEY    Value: the rk_live_ key from step 1
 *         Save.
 *
 *  3. Back in the editor, pick "setup" in the function menu and click Run.
 *     Google will ask you to authorise it; that is expected, it is your own
 *     script reading your own Stripe sales and sending from your own Gmail.
 *     Setup checks the key, finds the ticket link, creates the Tickets tab,
 *     switches on the five-minute check, and emails YOU a sample ticket.
 *
 *  That is it. To stop it after the event, run "stop".
 *
 *  Gmail lets a script send about 100 emails a day on a personal account and
 *  1,500 on Google Workspace. If a busy day goes over, the rest are sent on the
 *  next check once the limit resets; nobody is skipped.
 * ---------------------------------------------------------------------------
 */

var TICKETS = {
  paymentLinkUrl: "https://buy.stripe.com/8x29ATc2t3WRfJmfGH3Ru03",
  ticketPrice: 1500,                    // in pence; used to thank people who pay more
  sheetName: "Tickets",
  fromName: "Passenger Cinema",
  replyTo: "hello@passengercinema.com",

  event: {
    film: "Once Upon a Time in Venezuela",
    director: "Anabel Rodríguez Ríos",
    dateLong: "Sunday 4 October 2026",
    dateShort: "Sun 4 Oct",
    doors: "15:30",
    start: "16:00",
    venue: "Central Film School",
    address: "72 Landor Road, London SW9 9PH",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Central+Film+School+72+Landor+Road+London+SW9+9PH",
    stations: "Clapham North and Clapham High Street stations are a few minutes' walk away.",
    afterFilm: "Live Q&A with director Anabel Rodríguez Ríos, who joins us online, then Rodrian Ramirez plays the cuatro, a traditional Venezuelan instrument.",
    charities: "All ticket proceeds will go to Venezuelan earthquake relief through two charities, Coromoto 2020 and Venezuelan Relief UK.",
    image: "https://passengercinema.com/assets/img/events/venezuela-01.jpg",
    pageUrl: "https://passengercinema.com/screenings.html"
  }
};


/* ------------------------------------------------------------ run these -- */

function setup() {
  var key = stripeKey_();
  var link = paymentLinkId_();
  var sheet = ticketSheet_();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "checkForNewTickets") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("checkForNewTickets").timeBased().everyMinutes(5).create();

  sendTestEmail();
  Logger.log("Ready. Watching " + link + ", logging to the '" + sheet.getName() +
             "' tab, and a sample ticket has been emailed to " + Session.getEffectiveUser().getEmail() + ".");
  if (key.indexOf("rk_") !== 0) {
    Logger.log("Note: that key is not a restricted key. It works, but a restricted key with read-only access is safer.");
  }
}

function stop() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "checkForNewTickets") ScriptApp.deleteTrigger(t);
  });
  Logger.log("Stopped. No more ticket emails will be sent.");
}

function sendTestEmail() {
  var me = Session.getEffectiveUser().getEmail();
  var mail = ticketEmail_({
    name: "Zülal Erdoğan", email: me, ref: "PC-SAMPLE",
    amount: 2500, currency: "gbp", paidAt: new Date()
  });
  MailApp.sendEmail({
    to: me, subject: "[Sample] " + mail.subject, htmlBody: mail.html, body: mail.text,
    name: TICKETS.fromName, replyTo: TICKETS.replyTo
  });
}


/* ------------------------------------------ the five-minute check itself -- */

function checkForNewTickets() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;          // a previous check is still running
  try {
    var sheet = ticketSheet_();
    var done = {};
    var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    ids.forEach(function (r) { if (r[0]) done[r[0]] = true; });

    var link = paymentLinkId_();
    var after = null, page;
    do {
      var q = "?payment_link=" + encodeURIComponent(link) + "&status=complete&limit=100" +
              (after ? "&starting_after=" + encodeURIComponent(after) : "");
      page = stripe_("/v1/checkout/sessions" + q);

      for (var i = 0; i < page.data.length; i++) {
        var s = page.data[i];
        after = s.id;
        if (done[s.id] || s.payment_status !== "paid") continue;
        var email = s.customer_details && s.customer_details.email;
        if (!email) continue;

        var buyer = {
          name: (s.customer_details.name || "").trim(),
          email: email,
          ref: "PC-" + s.id.slice(-6).toUpperCase(),
          amount: s.amount_total,
          currency: s.currency,
          paidAt: new Date(s.created * 1000)
        };
        var mail = ticketEmail_(buyer);
        try {
          MailApp.sendEmail({
            to: buyer.email, subject: mail.subject, htmlBody: mail.html, body: mail.text,
            name: TICKETS.fromName, replyTo: TICKETS.replyTo
          });
        } catch (err) {
          /* most likely the daily sending limit: stop here and pick up on a
             later check, rather than marking anyone as done */
          Logger.log("Could not send to " + buyer.email + ": " + err);
          return;
        }
        var donation = Math.max(0, buyer.amount - TICKETS.ticketPrice);
        sheet.appendRow([s.id, buyer.ref, buyer.name, buyer.email,
                         buyer.amount / 100, donation / 100, buyer.paidAt, new Date(), ""]);
        done[s.id] = true;
      }
    } while (page.has_more);
  } finally {
    lock.releaseLock();
  }
}


/* ------------------------------------------------------------- the email -- */

/* Kept free of Apps Script services so the same function can be previewed in
   a browser. Table layout and inline styles, because that is what email apps
   reliably render. */
function ticketEmail_(b) {
  var e = TICKETS.event;
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (p) {
    var sym = { gbp: "£", eur: "€", usd: "$" }[String(b.currency || "gbp").toLowerCase()] || "";
    return sym + (p % 100 === 0 ? String(p / 100) : (p / 100).toFixed(2));
  };
  var donation = Math.max(0, b.amount - TICKETS.ticketPrice);
  var first = b.name ? b.name.split(/\s+/)[0] : "";
  var paid = money(b.amount);

  var C = { ink: "#114C5C", cream: "#F2EAD5", paper: "#FBF7EC", gold: "#AE7632", red: "#B8402C", rule: "#D9CFB6" };
  var serif = "Georgia,'Times New Roman',serif";
  var sans = "Arial,Helvetica,sans-serif";
  var tall = "'League Gothic','Arial Narrow','Helvetica Neue Condensed',Arial,sans-serif";
  var label = "font-family:" + sans + ";font-size:11px;letter-spacing:2px;text-transform:uppercase;color:" + C.gold + ";font-weight:bold;";
  var value = "font-family:" + sans + ";font-size:17px;line-height:23px;color:" + C.ink + ";font-weight:bold;";

  function cell(l, v, extra) {
    return '<td valign="top" style="padding:14px 0 14px 0;' + (extra || "") + '">' +
      '<div style="' + label + '">' + esc(l) + '</div>' +
      '<div style="' + value + 'padding-top:5px;">' + v + '</div></td>';
  }

  var subject = "Your ticket: " + e.film + ", " + e.dateShort;

  var html =
'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>' + esc(subject) + '</title></head>' +
'<body style="margin:0;padding:0;background:' + C.cream + ';">' +
'<div style="display:none;max-height:0;overflow:hidden;">You are going to Congo Mirador. Doors ' + e.doors + ', ' + esc(e.dateLong) + ', ' + esc(e.venue) + '.</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.cream + ';"><tr><td align="center" style="padding:24px 12px;">' +
'<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:' + C.paper + ';">' +

  // masthead
  '<tr><td style="background:' + C.ink + ';padding:20px 32px;">' +
    '<img src="https://passengercinema.com/assets/img/brand/logo-ivory.png" width="118" alt="Passenger Cinema" style="display:block;border:0;width:118px;height:auto;">' +
  '</td></tr>' +

  // still
  '<tr><td><img src="' + e.image + '" width="600" alt="A girl paddling a red canoe past houses on stilts, from the film" style="display:block;border:0;width:100%;height:auto;"></td></tr>' +

  // greeting and title
  '<tr><td style="padding:30px 32px 6px 32px;">' +
    '<div style="' + label + '">Your ticket is confirmed</div>' +
    '<div style="font-family:' + tall + ';font-size:46px;line-height:44px;font-weight:bold;color:' + C.gold + ';text-transform:uppercase;padding-top:10px;">' + esc(e.film) + '</div>' +
    '<p style="font-family:' + serif + ';font-size:17px;line-height:26px;color:' + C.ink + ';margin:16px 0 0 0;">' +
      (first ? "Hi " + esc(first) + ", thank you" : "Thank you") +
      " for booking. We can't wait to see you there. Everything you need is below.</p>" +
  '</td></tr>' +

  // the ticket
  '<tr><td style="padding:20px 32px 8px 32px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ' + C.ink + ';">' +
    '<tr><td style="padding:4px 20px 0 20px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
        '<tr>' + cell("Name", esc(b.name || b.email)) + cell("Ticket", esc(b.ref), "text-align:right;") + '</tr>' +
        '<tr><td colspan="2" style="border-top:1px dashed ' + C.rule + ';font-size:0;line-height:0;">&nbsp;</td></tr>' +
        '<tr>' + cell("Date", esc(e.dateLong)) + cell("Doors / Film", e.doors + " / " + e.start, "text-align:right;") + '</tr>' +
        '<tr><td colspan="2" style="border-top:1px dashed ' + C.rule + ';font-size:0;line-height:0;">&nbsp;</td></tr>' +
        '<tr>' + cell("Where", esc(e.venue) + '<div style="font-weight:normal;font-size:15px;line-height:21px;padding-top:2px;">' + esc(e.address) + '</div>') +
                 cell("Seat", "Unreserved", "text-align:right;") + '</tr>' +
        '<tr><td colspan="2" style="border-top:1px dashed ' + C.rule + ';font-size:0;line-height:0;">&nbsp;</td></tr>' +
        '<tr>' + cell("Paid", esc(paid), "") + '<td></td></tr>' +
      '</table>' +
    '</td></tr>' +
    '<tr><td style="background:' + C.ink + ';padding:12px 20px;font-family:' + sans + ';font-size:13px;line-height:19px;color:' + C.cream + ';">' +
      'Show this email at the door, on your phone is fine. We will have your name on our list too.' +
    '</td></tr>' +
  '</table></td></tr>' +

  // practical notes
  '<tr><td style="padding:18px 32px 0 32px;font-family:' + serif + ';font-size:16px;line-height:25px;color:' + C.ink + ';">' +
    '<p style="margin:0 0 14px 0;"><strong>Seats are not numbered.</strong> Doors open at ' + e.doors + ', so come early if you would like to pick your spot. The film starts at ' + e.start + '.</p>' +
    '<p style="margin:0 0 14px 0;"><strong>After the film:</strong> ' + esc(e.afterFilm) + '</p>' +
    '<p style="margin:0 0 14px 0;"><strong>Getting there:</strong> ' + esc(e.stations) + ' <a href="' + e.mapUrl + '" style="color:' + C.red + ';">Open in Maps</a></p>' +
  '</td></tr>' +

  // the cause
  '<tr><td style="padding:10px 32px 30px 32px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.red + ';"><tr><td style="padding:18px 20px;font-family:' + serif + ';font-size:16px;line-height:24px;color:#FFFFFF;">' +
    esc(e.charities) +
    (donation > 0 ? " Thank you for paying more than the ticket price. All of it goes to the appeal." : "") +
  '</td></tr></table></td></tr>' +

  // footer
  '<tr><td style="padding:0 32px 28px 32px;font-family:' + sans + ';font-size:13px;line-height:20px;color:#5E7780;">' +
    'Questions? Just reply to this email.<br>' +
    '<a href="' + e.pageUrl + '" style="color:' + C.ink + ';">passengercinema.com</a> &nbsp;·&nbsp; ' +
    '<a href="https://www.instagram.com/passenger.cinema/" style="color:' + C.ink + ';">@passenger.cinema</a>' +
  '</td></tr>' +

'</table></td></tr></table></body></html>';

  var text = [
    (first ? "Hi " + first + "," : "Hello,"),
    "",
    "Your ticket is confirmed for " + e.film + ". Thank you for booking.",
    "",
    "Name: " + (b.name || b.email),
    "Ticket: " + b.ref,
    "Date: " + e.dateLong,
    "Doors: " + e.doors + ", film starts " + e.start,
    "Where: " + e.venue + ", " + e.address,
    "Seat: Unreserved",
    "Paid: " + paid,
    "",
    "Show this email at the door, on your phone is fine. We will have your name on our list too.",
    "",
    "Seats are not numbered. Doors open at " + e.doors + ", so come early if you would like to pick your spot.",
    "After the film: " + e.afterFilm,
    "Getting there: " + e.stations,
    "",
    e.charities + (donation > 0 ? " Thank you for paying more than the ticket price. All of it goes to the appeal." : ""),
    "",
    "Questions? Just reply to this email.",
    "Passenger Cinema, passengercinema.com"
  ].join("\n");

  return { subject: subject, html: html, text: text };
}


/* --------------------------------------------------------------- helpers -- */

function stripeKey_() {
  var key = PropertiesService.getScriptProperties().getProperty("STRIPE_KEY");
  if (!key) throw new Error("Add your Stripe key first: Project Settings, Script Properties, STRIPE_KEY.");
  return key.trim();
}

function stripe_(path) {
  var res = UrlFetchApp.fetch("https://api.stripe.com" + path, {
    headers: { Authorization: "Bearer " + stripeKey_() },
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() >= 300) {
    throw new Error("Stripe said: " + (body.error && body.error.message || res.getResponseCode()));
  }
  return body;
}

/* Stripe filters sales by the link's ID (plink_...), not its web address, so
   look it up from the address and remember it. The address is remembered too,
   so changing paymentLinkUrl above makes it look the new one up. */
function paymentLinkId_() {
  var props = PropertiesService.getScriptProperties();
  var cached = props.getProperty("PAYMENT_LINK_ID");
  if (props.getProperty("PAYMENT_LINK_URL") !== TICKETS.paymentLinkUrl) cached = null;
  if (cached) return cached;
  var after = null, page;
  do {
    page = stripe_("/v1/payment_links?limit=100" + (after ? "&starting_after=" + after : ""));
    for (var i = 0; i < page.data.length; i++) {
      after = page.data[i].id;
      if (page.data[i].url === TICKETS.paymentLinkUrl) {
        props.setProperty("PAYMENT_LINK_ID", page.data[i].id);
        props.setProperty("PAYMENT_LINK_URL", TICKETS.paymentLinkUrl);
        return page.data[i].id;
      }
    }
  } while (page.has_more);
  throw new Error("Could not find a payment link with the address " + TICKETS.paymentLinkUrl +
                  ". Check it matches the link in Stripe exactly.");
}

function ticketSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TICKETS.sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(TICKETS.sheetName);
    sheet.appendRow(["Stripe session", "Ticket", "Name", "Email", "Paid (£)", "Above ticket price (£)",
                     "Bought", "Emailed", "Arrived"]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
  }
  return sheet;
}
