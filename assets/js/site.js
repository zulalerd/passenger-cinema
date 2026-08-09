/* ==========================================================================
   PASSENGER CINEMA - site behaviour
   No build step, no dependencies.

   All content comes from three JSON files, which are what the CMS edits:
     data/site.json    settings and page copy
     data/events.json  screenings, upcoming and past
     data/roles.json   volunteer roles and their questions

   Because those are fetched, the site needs to be served over http rather
   than opened straight off the disk. Run preview.cmd to look at it locally.
   ========================================================================== */
(function () {
  "use strict";

  /* these are filled in from data/site.json before anything renders */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "hello@passengercinema.com";
  var INSTAGRAM     = "https://www.instagram.com/passenger.cinema/";

  /* ---------------------------------------------------------------- utils */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var PC   = { upcoming: [], past: [], roles: [] };
  var SITE = {};

  /* look up "home.heroHeading" in the site settings */
  function t(path) {
    return String(path).split(".").reduce(function (o, k) {
      return (o && o[k] != null) ? o[k] : null;
    }, SITE);
  }

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
     EDITABLE COPY
     Any element with data-t="some.path" gets its text from site.json.
     data-t-html does the same but allows <em> and <strong> through.
     Repeating blocks are handled by the small renderers below.
     ===================================================================== */
  function bindText() {
    $$("[data-t]").forEach(function (el) {
      var v = t(el.getAttribute("data-t"));
      if (v != null) el.textContent = v;
    });
    $$("[data-t-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-html"));
      if (v != null) el.innerHTML = v;
    });
    /* an array of paragraphs */
    $$("[data-t-paras]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-paras"));
      if (Array.isArray(v)) el.innerHTML = v.map(function (p) { return "<p>" + p + "</p>"; }).join("");
    });
    /* label / title / body cards, used for the pillars and the first-time strip */
    $$("[data-t-pillars]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-pillars"));
      if (!Array.isArray(v)) return;
      el.innerHTML = v.map(function (p) {
        return '<article class="pillar">' +
          '<span class="pillar__n">' + esc(p.label) + "</span>" +
          '<h3 class="display d4">' + p.title + "</h3>" +
          "<p>" + p.body + "</p></article>";
      }).join("");
    });
    /* the numbered "what we offer" list */
    $$("[data-t-offer]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-offer"));
      if (!Array.isArray(v)) return;
      el.innerHTML = v.map(function (line, i) {
        return '<li><span class="n">' + (i < 9 ? "0" : "") + (i + 1) + "</span><span>" + line + "</span></li>";
      }).join("");
    });
    /* figure / label stat row, used for the awards block */
    $$("[data-t-stats]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-stats"));
      if (!Array.isArray(v)) return;
      el.innerHTML = v.map(function (s) {
        return "<div><b>" + esc(s.figure) + "</b><span>" + esc(s.label) + "</span></div>";
      }).join("");
    });
    /* the scrolling rule of short phrases */
    $$("[data-t-marquee]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-marquee"));
      if (!Array.isArray(v)) return;
      el.innerHTML = v.map(function (s, i) {
        return (i ? "<span>&middot;</span>" : "") + "<span>" + esc(s) + "</span>";
      }).join("");
    });
    /* founders */
    $$("[data-t-team]").forEach(function (el) {
      var v = t(el.getAttribute("data-t-team"));
      if (!Array.isArray(v)) return;
      el.innerHTML = v.map(function (m) {
        return '<div><h3 class="display d3">' + esc(m.name) + "</h3>" +
          '<p class="label label--muted" style="margin-top:.5rem">' + esc(m.role) + "</p></div>";
      }).join("");
    });
  }

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
          '<span class="poster__t">' + esc(ev.film) + "</span>" +
          '<span class="poster__n">' + esc(ev.country || "") + "</span>" +
        "</span>";

    return '<a class="card" href="event.html?e=' + encodeURIComponent(ev.slug) + '">' +
      '<span class="card__fig' + (cover ? "" : " card__fig--empty") + '">' +
        (index != null ? '<span class="card__no">' + (index < 9 ? "0" : "") + (index + 1) + "</span>" : "") +
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
      ["City", ev.city],
      /* country lives here rather than in the letterspaced label line, because
         a co-production can list a dozen countries and that would sprawl */
      ["Country", ev.country]
    ].filter(function (r) { return r[1]; });

    var order = (ev.runningOrder || []).map(function (r) {
      return "<li><time>" + esc(r.time) + "</time><span>" + esc(r.what) + "</span></li>";
    }).join("");

    return '<article class="ticket">' +
      '<div class="ticket__main">' +
        '<p class="label label--stamp">Next departure</p>' +
        '<h2 class="display d2" style="margin:.7rem 0 .5rem">' + esc(ev.film) + "</h2>" +
        '<p class="label label--muted">' + esc(ev.director) +
          (ev.year ? " · " + ev.year : "") + "</p>" +
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
        '<span class="stamp">' +
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
          '<span class="pstamp__n">' + esc(e.country) + "</span></a>");
      });
      PC.upcoming.forEach(function (e) {
        out.push('<span class="pstamp" data-next="true">' +
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
          return '<button type="button" aria-pressed="false" data-f="' + esc(c) + '">' + esc(c) + "</button>";
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
        '<p><a class="link" href="archive.html">Back to past events <span class="arw" aria-hidden="true">&rarr;</span></a></p>' +
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
          esc(ev.country || "") + (ev.year ? " &middot; " + ev.year : "") + "</p>" +
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
          return "<div><b>" + esc(r.figure) + "</b><span>" + esc(r.label) + "</span></div>";
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
      '<p style="margin:2.5rem 0 0"><a class="link" href="archive.html">All past events <span class="arw" aria-hidden="true">&rarr;</span></a></p>' +
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
        '<p class="label">' + esc(role.title) + ": a few questions</p>" +
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
          var payload = { _form: subject, _subject: "Passenger Cinema: " + subject };
          data.forEach(function (r) { payload[r[0]] = r[1]; });

          /* Works with either service, so you can use whichever you can get set up.
             Google Apps Script cannot answer a CORS preflight, so it needs
             text/plain to stay a "simple request". Formspree and friends want
             proper JSON. */
          var isAppsScript = /script\.google\.com/.test(FORM_ENDPOINT);
          var headers = isAppsScript
            ? { "Content-Type": "text/plain;charset=utf-8" }
            : { "Content-Type": "application/json", "Accept": "application/json" };

          fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
          }).then(function (r) {
            if (!r.ok) throw new Error("bad status");
            /* not every service returns JSON, and that is fine */
            return r.json().catch(function () { return null; });
          }).then(function (res) {
            if (res && res.ok === false) throw new Error(res.error || "rejected");
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
    analytics();
    bindText();
    chrome();
    renderHome();
    renderScreenings();
    renderArchive();
    renderEvent();
    renderVolunteer();
    initForms();
  }

  function failed(err) {
    var onDisk = location.protocol === "file:";
    var m = document.createElement("div");
    m.style.cssText =
      "position:relative;z-index:99;background:#B8402C;color:#FBFAED;" +
      "padding:1.5rem clamp(1.25rem,4vw,3.5rem);font-family:system-ui,sans-serif;" +
      "font-size:1rem;line-height:1.6";
    m.innerHTML = onDisk
      ? "<strong>You are looking at this file straight off your computer, " +
        "so the screenings cannot load.</strong><br>" +
        "This is not a problem with the site. Browsers block a page opened from " +
        "disk from reading the content files.<br><br>" +
        "See the real site at " +
        '<a style="color:#FBFAED" href="https://zulalerd.github.io/passenger-cinema/">' +
        "zulalerd.github.io/passenger-cinema</a>, or double-click " +
        "<code>preview.cmd</code> in this folder to preview it properly."
      : "<strong>The screenings could not load.</strong><br>" +
        "Try reloading. If it keeps happening, the content files may have a " +
        "syntax error.<br><br><em>" +
        esc(err && err.message ? err.message : String(err)) + "</em>";
    var main = $("#main") || document.body;
    main.prepend(m);
  }

  /* =======================================================================
     ANALYTICS (optional, and cookieless)
     Inert until a PostHog project key is set in the CMS under
     Site text & settings. With no key, nothing loads at all.

     It stores NOTHING on the visitor's device: no cookies, no localStorage,
     no person profiles. The trade is that PostHog cannot tell a returning
     visitor from a new one, so read the numbers as "visits", not "people".

     Session replay is ON. Two things follow from that:

     1. Because nothing is stored, the session id resets on every page load,
        so a replay covers one page rather than a whole journey.
     2. Replay records behaviour, which UK and EU regulators treat as needing
        consent. The site has no consent banner, so this is a decision the
        owner has taken knowingly. At minimum the site needs a privacy notice
        saying that sessions are recorded.

     Forms carry .ph-no-capture so nothing anyone types is ever recorded.
     ===================================================================== */
  function analytics() {
    var key = t("analytics.posthogKey");
    if (!key) return;
    var host = t("analytics.posthogHost") || "https://eu.i.posthog.com";
    !function (t, e) {
      var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
        function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]);
          t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }
        (p = t.createElement("script")).type = "text/javascript"; p.async = !0;
        p.src = s.api_host + "/static/array.js";
        (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
        var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [],
          u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a),
            t || (e += " (stub)"), e; }, u.people.toString = function () { return u.toString(1) + ".people (stub)"; },
          o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),
          n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a]);
      }, e.__SV = 1);
    }(document, window.posthog || []);
    window.posthog.init(key, {
      api_host: host,
      persistence: "memory",            /* nothing written to the device at all */
      person_profiles: "never",         /* every event stays anonymous */
      capture_pageview: true,
      autocapture: true,                /* which links and buttons get clicked */
      disable_session_recording: false, /* replay on, see the caveats above */
      session_recording: {
        /* Never record what anyone types. The volunteer form asks for names,
           emails and long personal answers, and none of that should end up
           in a replay. Whole forms are excluded via .ph-no-capture below. */
        maskAllInputs: true,
        maskTextSelector: ".ph-no-capture, .ph-no-capture *"
      }
    });
  }

  function boot() {
    var get = function (p) {
      return fetch(p, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error(p + " returned " + r.status);
        return r.json();
      });
    };
    Promise.all([get("data/site.json"), get("data/events.json"), get("data/roles.json")])
      .then(function (res) {
        SITE = res[0] || {};
        PC.upcoming = (res[1] && res[1].upcoming) || [];
        PC.past     = (res[1] && res[1].past) || [];
        PC.roles    = (res[2] && res[2].roles) || [];
        if (SITE.formEndpoint) FORM_ENDPOINT = SITE.formEndpoint;
        if (SITE.contactEmail) CONTACT_EMAIL = SITE.contactEmail;
        if (SITE.instagram)    INSTAGRAM     = SITE.instagram;
        init();
      })
      .catch(failed);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
