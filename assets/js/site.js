/* ==========================================================================
   PASSENGER CINEMA - site behaviour
   No build step, no dependencies. Reads everything from data/events.js.
   ========================================================================== */
(function () {
  "use strict";

  /* ======================================================================
     CONFIGURATION: the only thing you need to change
     ----------------------------------------------------------------------
     FORM_ENDPOINT: paste a form endpoint here to receive submissions by
     email. Free options that need no server:
        Formspree  ->  https://formspree.io     e.g. "https://formspree.io/f/abcdwxyz"
        Netlify    ->  if you deploy on Netlify, see README.md
     Leave it as "" and every form falls back to opening the visitor's
     email client with the answers pre-filled. The site still works.
     ====================================================================== */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "hello@passengercinema.com";
  var INSTAGRAM     = "https://www.instagram.com/passenger.cinema/";

  /* ---------------------------------------------------------------- utils */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var PC = window.PC || { upcoming: [], past: [], roles: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
  var DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function parseDate(iso) {
    var p = String(iso).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function fmtLong(ev) {
    if (ev.dateNote) return ev.dateNote;
    var d = parseDate(ev.date);
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function fmtShort(ev) {
    if (ev.dateNote) return ev.dateNote;
    var d = parseDate(ev.date);
    return d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear();
  }
  function fmtStamp(ev) {
    var d = parseDate(ev.date);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + String(d.getFullYear()).slice(2);
  }
  function imgPath(f) { return "assets/img/events/" + f; }

  /* =======================================================================
     CHROME: nav, current page, shared contact details
     ===================================================================== */
  function chrome() {
    var toggle = $(".navToggle");
    var nav = $(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.getAttribute("data-open") === "true";
        nav.setAttribute("data-open", String(!open));
        toggle.setAttribute("aria-expanded", String(!open));
        $(".navToggle__t", toggle).textContent = open ? "Menu" : "Close";
      });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A" && window.innerWidth < 940) {
          nav.setAttribute("data-open", "false");
          toggle.setAttribute("aria-expanded", "false");
          $(".navToggle__t", toggle).textContent = "Menu";
        }
      });
    }

    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav a, .foot a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("?")[0];
      if (href === here) a.setAttribute("aria-current", "page");
    });

    $$("[data-contact-email]").forEach(function (el) {
      el.textContent = CONTACT_EMAIL;
      if (el.tagName === "A") el.href = "mailto:" + CONTACT_EMAIL;
    });
    $$("[data-instagram]").forEach(function (el) { el.href = INSTAGRAM; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* =======================================================================
     CARDS
     ===================================================================== */
  function cardMarkup(ev, index) {
    var cover = ev.photos && ev.photos.length ? ev.photos[0] : null;
    var fig = cover
      ? '<img src="' + imgPath(cover) + '" alt="" loading="lazy" decoding="async">'
      : '<span class="poster" aria-hidden="true">' +
          '<span class="poster__code">' + esc(ev.code || "PC") + "</span>" +
          '<span class="poster__t">' + esc(ev.film) + "</span>" +
          '<span class="poster__n">' + esc(ev.country || "") + "</span>" +
        "</span>";

    return '<a class="card" href="event.html?e=' + encodeURIComponent(ev.slug) + '">' +
      '<span class="card__fig' + (cover ? "" : " card__fig--empty") + '">' +
        (index != null ? '<span class="card__no">' + (index < 9 ? "0" : "") + (index + 1) + "</span>" : "") +
        '<span class="card__code">' + esc(ev.code || "") + "</span>" +
        fig +
      "</span>" +
      '<span class="card__body">' +
        '<span class="card__meta">' +
          '<span class="label label--muted">' + esc(fmtShort(ev)) + "</span>" +
          '<span class="label label--muted">' + esc(ev.city || ev.country) + "</span>" +
        "</span>" +
        "<h3>" + esc(ev.film) + "</h3>" +
        '<p class="card__dir">' + esc(ev.director) + (ev.year ? " · " + ev.year : "") + "</p>" +
        (ev.beyond ? '<p class="card__beyond">' + esc(ev.beyond) + "</p>" : "") +
      "</span>" +
    "</a>";
  }

  /* =======================================================================
     HOME + SCREENINGS: next departure ticket
     ===================================================================== */
  /* `full` = we are already on the screenings page, so drop the "full details" link */
  function ticketMarkup(ev, full) {
    var meta = [
      ["Date", fmtLong(ev)],
      ["Time", (ev.doors || ev.start || "") + (ev.ends ? " to " + ev.ends : "")],
      ["Venue", ev.venue],
      ["City", ev.city]
    ].filter(function (r) { return r[1]; });

    var order = (ev.runningOrder || []).map(function (r) {
      return "<li><time>" + esc(r[0]) + "</time><span>" + esc(r[1]) + "</span></li>";
    }).join("");

    return '<article class="ticket">' +
      '<div class="ticket__main">' +
        '<p class="label label--stamp">Next departure</p>' +
        '<h2 class="display d2" style="margin:.7rem 0 .5rem">' + esc(ev.film) + "</h2>" +
        '<p class="label label--muted">' + esc(ev.director) +
          (ev.country ? " · " + esc(ev.country) : "") + "</p>" +
        '<dl class="ticket__meta">' +
          meta.map(function (r) {
            return '<div class="ticket__row"><dt>' + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
          }).join("") +
        "</dl>" +
        (ev.standfirst ? '<p class="lede" style="max-width:48ch;margin-bottom:1.75rem">' + esc(ev.standfirst) + "</p>" : "") +
        (order ? '<p class="label label--muted" style="margin-bottom:.9rem">Running order</p><ul class="runorder">' + order + "</ul>" : "") +
        (full ? "" : '<a class="btn" href="screenings.html">Full details <span aria-hidden="true">&rarr;</span></a>') +
      "</div>" +
      '<aside class="ticket__stub">' +
        '<span class="stamp">' + esc(ev.destinationCode || ev.code || "") + " &middot; " +
          esc(ev.destinationCountry || ev.country || "") + "</span>" +
        '<div class="ticket__row"><dt>Boarding</dt><dd>' + esc(fmtStamp(ev)) + "</dd></div>" +
        '<div class="ticket__row"><dt>Destination</dt><dd>' + esc(ev.city) + "</dd></div>" +
        (ev.ticketUrl
          ? '<a class="btn" style="margin-top:.5rem" href="' + esc(ev.ticketUrl) + '" target="_blank" rel="noopener">' +
            esc(ev.ticketLabel || "Get tickets") + ' <span aria-hidden="true">&#8599;</span></a>'
          : "") +
      "</aside>" +
    "</article>";
  }

  function renderHome() {
    var slot = $("[data-next-departure]");
    if (slot) {
      if (PC.upcoming.length) {
        slot.innerHTML = ticketMarkup(PC.upcoming[0]);
      } else {
        slot.innerHTML = '<div class="empty"><p class="label label--muted" style="margin-bottom:.75rem">No dates announced</p>' +
          "<p>We are between destinations. Follow us on Instagram, or tell us where we should go next.</p>" +
          '<p style="margin-top:1.25rem"><a class="link" href="recommend.html">Suggest a film <span class="arw" aria-hidden="true">&rarr;</span></a></p></div>';
      }
    }

    var feat = $("[data-featured-archive]");
    if (feat) {
      var withPix = PC.past.filter(function (e) { return e.photos && e.photos.length; }).slice(0, 3);
      feat.innerHTML = withPix.map(function (e) { return cardMarkup(e, null); }).join("");
    }

    var pass = $("[data-passport]");
    if (pass) {
      var done = {};
      var out = [];
      PC.past.forEach(function (e) {
        if (!e.country || done[e.country]) return;
        done[e.country] = 1;
        out.push('<a class="pstamp" href="archive.html#' + encodeURIComponent(e.country) + '">' +
          "<b>" + esc(e.code || "") + "</b>" +
          '<span class="pstamp__n">' + esc(e.country) + "</span></a>");
      });
      PC.upcoming.forEach(function (e) {
        out.push('<span class="pstamp" data-next="true">' +
          "<b>" + esc(e.destinationCode || "") + "</b>" +
          '<span class="pstamp__n">' + esc(e.destinationCountry || e.city) +
          " <em>next</em></span></span>");
      });
      pass.innerHTML = out.join("");
    }

    var count = $("[data-stat-countries]");
    if (count) {
      var c = {};
      PC.past.forEach(function (e) { if (e.country) c[e.country] = 1; });
      count.textContent = Object.keys(c).length;
    }
    var evs = $("[data-stat-events]");
    if (evs) evs.textContent = PC.past.length;
  }

  /* =======================================================================
     SCREENINGS
     ===================================================================== */
  function renderScreenings() {
    var slot = $("[data-upcoming]");
    if (!slot) return;

    if (!PC.upcoming.length) {
      slot.innerHTML = '<div class="empty"><p class="label label--muted" style="margin-bottom:.75rem">Nothing on sale right now</p>' +
        "<p>We programme one journey at a time. Follow us on Instagram to hear about the next one first, " +
        "or tell us where we should be going.</p>" +
        '<p style="margin-top:1.5rem"><a class="btn" href="recommend.html">Suggest a film or a space</a></p></div>';
      return;
    }

    slot.innerHTML = PC.upcoming.map(function (ev) {
      var body = (ev.body || []).map(function (p) { return "<p>" + p + "</p>"; }).join("");
      return '<article style="margin-bottom:clamp(3rem,7vw,5rem)">' +
        ticketMarkup(ev, true) +
        (body ? '<div class="two-col" style="margin-top:clamp(2.5rem,5vw,4rem)">' +
            '<div><p class="label">About the film</p></div>' +
            '<div class="prose">' + body + "</div>" +
          "</div>" : "") +
      "</article>";
    }).join("");
  }

  /* =======================================================================
     ARCHIVE
     ===================================================================== */
  function renderArchive() {
    var slot = $("[data-archive]");
    if (!slot) return;

    var events = PC.past.slice();
    var total = events.length;

    function draw(filter) {
      var list = filter ? events.filter(function (e) { return e.country === filter; }) : events;
      slot.innerHTML = list.length
        ? list.map(function (e) { return cardMarkup(e, total - 1 - events.indexOf(e)); }).join("")
        : '<div class="empty"><p>Nothing here yet.</p></div>';
    }

    var bar = $("[data-archive-filters]");
    if (bar) {
      var countries = [];
      events.forEach(function (e) {
        if (e.country && countries.indexOf(e.country) === -1) countries.push(e.country);
      });
      countries.sort();
      bar.innerHTML = '<button type="button" aria-pressed="true" data-f="">All · ' + total + "</button>" +
        countries.map(function (c) {
          var f = (events.filter(function (e) { return e.country === c; })[0] || {}).code || "";
          return '<button type="button" aria-pressed="false" data-f="' + esc(c) + '"><b>' +
            esc(f) + "</b>" + esc(c) + "</button>";
        }).join("");

      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        $$("button", bar).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw(b.dataset.f || null);
        history.replaceState(null, "", b.dataset.f ? "#" + encodeURIComponent(b.dataset.f) : location.pathname);
      });
    }

    var hash = decodeURIComponent(location.hash.slice(1));
    var initial = events.some(function (e) { return e.country === hash; }) ? hash : null;
    if (initial && bar) {
      $$("button", bar).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.f === initial)); });
    }
    draw(initial);
  }

  /* =======================================================================
     EVENT DETAIL
     ===================================================================== */
  function renderEvent() {
    var root = $("[data-event]");
    if (!root) return;

    var slug = new URLSearchParams(location.search).get("e");
    var i = -1;
    PC.past.forEach(function (e, n) { if (e.slug === slug) i = n; });

    if (i === -1) {
      root.innerHTML = '<section class="section"><div class="wrap wrap--narrow">' +
        '<p class="label label--stamp">404</p><h1 class="display d2" style="margin:1rem 0">' +
        "We cannot find that screening.</h1>" +
        '<p><a class="link" href="archive.html">Back to the archive <span class="arw" aria-hidden="true">&rarr;</span></a></p>' +
        "</div></section>";
      return;
    }

    var ev = PC.past[i];
    var prev = PC.past[i + 1];      /* older */
    var next = PC.past[i - 1];      /* newer */
    document.title = ev.film + " | Passenger Cinema";
    var md = $('meta[name="description"]');
    if (md && ev.standfirst) md.setAttribute("content", ev.standfirst);

    var cover = ev.photos && ev.photos.length ? ev.photos[0] : null;

    /* --- hero ------------------------------------------------------- */
    var hero = '<header class="ehero grain">' +
      (cover ? '<div class="ehero__media"><img src="' + imgPath(cover) + '" alt=""></div>' : "") +
      '<div class="wrap ehero__in">' +
        '<p class="label label--muted">' +
          esc(ev.code) + " &middot; " + esc(ev.country) +
          (ev.year ? " · " + ev.year : "") + "</p>" +
        '<h1 class="display d1">' + esc(ev.film) + "</h1>" +
        '<p class="lede" style="max-width:44ch;opacity:.9">' + esc(ev.standfirst || "") + "</p>" +
        (ev.soldOut ? '<p style="margin-top:1.5rem"><span class="stamp stamp--ochre">Sold out</span></p>' : "") +
        (ev.first ? '<p style="margin-top:1.5rem"><span class="stamp stamp--ochre">Our first screening</span></p>' : "") +
      "</div></header>";

    /* --- meta ------------------------------------------------------- */
    var metaRows = [
      ["Date", fmtLong(ev)],
      ["Venue", ev.venue],
      ["Where", ev.city],
      ["Director", ev.director],
      ["Attendance", ev.attendance ? ev.attendance + " people" : null]
    ].filter(function (r) { return r[1]; });

    var meta = '<section class="section section--tight"><div class="wrap">' +
      '<dl class="emeta">' + metaRows.map(function (r) {
        return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
      }).join("") + "</dl></div></section>";

    /* --- story ------------------------------------------------------ */
    var story = "";
    if (ev.story && ev.story.length) {
      story = '<section class="section"><div class="wrap"><div class="two-col">' +
        '<div><p class="label">The screening</p></div>' +
        '<div class="prose">' + ev.story.map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
        "</div></div></section>";
    }

    /* --- beyond the screen ------------------------------------------ */
    var beyond = "";
    if (ev.beyondBody && ev.beyondBody.length) {
      beyond = '<section class="section ivory"><div class="wrap"><div class="two-col">' +
        '<div><p class="label label--stamp">' + esc(ev.beyondTitle || "Beyond the screen") + "</p></div>" +
        '<div class="prose">' + ev.beyondBody.map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
        "</div></div></section>";
    }

    /* --- impact ----------------------------------------------------- */
    var impact = "";
    if (ev.impact && ev.impact.length) {
      impact = '<section class="section section--tight"><div class="wrap">' +
        '<div class="shead"><div class="shead__top"><p class="label">What happened next</p></div></div>' +
        '<div class="impact">' + ev.impact.map(function (r) {
          return "<div><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></div>";
        }).join("") + "</div></div></section>";
    }

    /* --- gallery ---------------------------------------------------- */
    var gallery = "";
    if (ev.photos && ev.photos.length > 1) {
      gallery = '<section class="section deep grain" style="position:relative"><div class="wrap" style="position:relative;z-index:2">' +
        '<div class="shead"><div class="shead__top"><p class="label">In the room</p>' +
        '<p class="label label--muted shead__note">' + ev.photos.length + " photographs</p></div></div>" +
        '<div class="gallery" data-gallery>' +
          ev.photos.map(function (f, n) {
            return '<button type="button" data-i="' + n + '" aria-label="Open photograph ' + (n + 1) + '">' +
              '<img src="' + imgPath(f) + '" alt="' + esc(ev.film) + ", photograph " + (n + 1) +
              '" loading="lazy" decoding="async"></button>';
          }).join("") +
        "</div></div></section>";
    }

    /* --- credits + links -------------------------------------------- */
    var credits = "";
    if ((ev.credits && ev.credits.length) || (ev.links && ev.links.length)) {
      credits = '<section class="section"><div class="wrap"><div class="two-col">' +
        '<div><p class="label">Made with</p></div><div>' +
        (ev.credits && ev.credits.length
          ? '<ul class="credits">' + ev.credits.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>"
          : "") +
        (ev.links && ev.links.length
          ? '<p style="margin-top:1.75rem">' + ev.links.map(function (l) {
              return '<a class="link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
                esc(l.label) + ' <span class="arw" aria-hidden="true">&#8599;</span></a>';
            }).join(" ") + "</p>"
          : "") +
        "</div></div></div></section>";
    }

    /* --- prev / next ------------------------------------------------ */
    var nav = '<nav class="section section--tight ivory" aria-label="More screenings"><div class="wrap">' +
      '<div class="grid2" style="gap:1.5rem">' +
      (prev ? '<a class="link" href="event.html?e=' + encodeURIComponent(prev.slug) + '">' +
        '<span class="arw" aria-hidden="true">&larr;</span> ' + esc(prev.film) + "</a>" : "<span></span>") +
      (next ? '<a class="link" style="justify-self:end" href="event.html?e=' + encodeURIComponent(next.slug) + '">' +
        esc(next.film) + ' <span class="arw" aria-hidden="true">&rarr;</span></a>' : "<span></span>") +
      "</div>" +
      '<p style="margin:2.5rem 0 0"><a class="link" href="archive.html">All past screenings <span class="arw" aria-hidden="true">&rarr;</span></a></p>' +
      "</div></nav>";

    root.innerHTML = hero + meta + story + beyond + impact + gallery + credits + nav;

    if (ev.photos && ev.photos.length > 1) initLightbox(ev);
  }

  /* =======================================================================
     LIGHTBOX
     ===================================================================== */
  function initLightbox(ev) {
    var grid = $("[data-gallery]");
    if (!grid) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", ev.film + " photographs");
    box.innerHTML =
      '<div class="lightbox__bar"><p class="label" data-lb-count></p>' +
        '<button type="button" class="lightbox__close" data-lb-close>Close &#10005;</button></div>' +
      '<div class="lightbox__fig"><img alt="" data-lb-img></div>' +
      '<div class="lightbox__nav">' +
        '<button type="button" data-lb-prev>&larr; Prev</button>' +
        '<button type="button" data-lb-next>Next &rarr;</button>' +
      "</div>";
    document.body.appendChild(box);

    var img = $("[data-lb-img]", box);
    var cnt = $("[data-lb-count]", box);
    var idx = 0, lastFocus = null;

    function show(n) {
      idx = (n + ev.photos.length) % ev.photos.length;
      img.src = imgPath(ev.photos[idx]);
      img.alt = ev.film + ", photograph " + (idx + 1);
      cnt.textContent = (idx + 1) + " / " + ev.photos.length;
    }
    function open(n) {
      lastFocus = document.activeElement;
      show(n);
      box.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      $("[data-lb-close]", box).focus();
    }
    function close() {
      box.removeAttribute("data-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) open(+b.dataset.i);
    });
    $("[data-lb-close]", box).addEventListener("click", close);
    $("[data-lb-prev]", box).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", box).addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* =======================================================================
     VOLUNTEER: the role picker builds its own questions
     ===================================================================== */
  function renderVolunteer() {
    var picker = $("[data-roles]");
    var qslot  = $("[data-role-questions]");
    if (!picker || !qslot) return;

    picker.innerHTML = PC.roles.map(function (r, n) {
      return '<div class="role"><label>' +
        '<input type="radio" name="role" value="' + esc(r.title) + '" data-role="' + esc(r.id) + '"' +
          (n === 0 ? " checked" : "") + ">" +
        "<span>" +
          '<span class="role__t"><span class="role__dot" aria-hidden="true"></span>' +
            "<h3>" + esc(r.title) + "</h3></span>" +
          "<p>" + esc(r.blurb) + "</p>" +
        "</span></label></div>";
    }).join("");

    function build(id) {
      var role = PC.roles.filter(function (r) { return r.id === id; })[0];
      if (!role) { qslot.innerHTML = ""; return; }
      qslot.innerHTML =
        '<p class="label" style="margin-bottom:1.25rem">' + esc(role.title) + ": a few questions</p>" +
        role.questions.map(function (q) {
          var id2 = "q-" + role.id + "-" + q.id;
          return '<div class="field">' +
            '<label for="' + id2 + '">' + esc(q.label) +
              (q.required ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
            (q.hint ? '<p class="hint" id="' + id2 + '-h">' + esc(q.hint) + "</p>" : "") +
            '<textarea id="' + id2 + '" name="' + esc(q.label) + '"' +
              (q.hint ? ' aria-describedby="' + id2 + '-h"' : "") +
              (q.required ? " required" : "") + "></textarea>" +
            '<p class="err" hidden>Please fill this in</p>' +
          "</div>";
        }).join("");
    }

    build(PC.roles[0] && PC.roles[0].id);
    picker.addEventListener("change", function (e) {
      if (e.target.name === "role") build(e.target.dataset.role);
    });
  }

  /* =======================================================================
     FORMS
     ===================================================================== */
  function initForms() {
    $$("form[data-pcform]").forEach(function (form) {
      var msg = $("[data-formmsg]", form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        /* honeypot */
        var hp = $(".hp input", form);
        if (hp && hp.value) return;

        /* validation */
        var bad = null;
        $$("[required]", form).forEach(function (f) {
          var wrap = f.closest(".field");
          var err  = wrap ? $(".err", wrap) : null;
          var ok   = f.value.trim() !== "" && (f.type !== "email" || /.+@.+\..+/.test(f.value));
          f.setAttribute("aria-invalid", ok ? "false" : "true");
          if (err) err.hidden = ok;
          if (!ok && !bad) bad = f;
        });
        if (bad) {
          bad.focus();
          bad.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }

        var subject = form.dataset.subject || "Passenger Cinema website";
        var data = [];
        $$("input, textarea, select", form).forEach(function (f) {
          if (!f.name || f.closest(".hp")) return;
          if ((f.type === "radio" || f.type === "checkbox") && !f.checked) return;
          if (!f.value.trim()) return;
          data.push([f.name, f.value.trim()]);
        });

        var btn = $('button[type="submit"]', form);
        var restore = btn ? btn.innerHTML : "";

        function done(state, text) {
          if (msg) {
            msg.setAttribute("data-state", state);
            msg.innerHTML = text;
            msg.scrollIntoView({ block: "center", behavior: "smooth" });
          }
          if (btn) { btn.disabled = false; btn.innerHTML = restore; }
        }

        if (FORM_ENDPOINT) {
          if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
          var payload = { _subject: subject };
          data.forEach(function (r) { payload[r[0]] = r[1]; });
          fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(payload)
          }).then(function (r) {
            if (!r.ok) throw new Error("bad status");
            form.reset();
            done("ok", "<strong>Thank you, that has landed.</strong><br>We read everything and we will be in touch.");
          }).catch(function () {
            done("err", "<strong>Something went wrong.</strong><br>Please email us at " +
              '<a href="mailto:' + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + '">' +
              CONTACT_EMAIL + "</a> instead.");
          });
        } else {
          var body = data.map(function (r) { return r[0] + "\n" + r[1]; }).join("\n\n");
          var href = "mailto:" + CONTACT_EMAIL +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);
          window.location.href = href;
          done("mail", "<strong>Your email app should be opening.</strong><br>" +
            "If nothing happened, copy your answers and send them to " +
            '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a>.");
        }
      });
    });
  }

  /* =======================================================================
     GO
     ===================================================================== */
  function init() {
    chrome();
    renderHome();
    renderScreenings();
    renderArchive();
    renderEvent();
    renderVolunteer();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
