# Passenger Cinema website

A plain HTML/CSS/JavaScript site. No build step, no framework, no dependencies.
All the content lives in three JSON files, which you edit through a web CMS.

Live repo: https://github.com/zulalerd/passenger-cinema

---

## 1. What's here

```
passenger-cinema/
├── index.html          Home
├── screenings.html     Upcoming screenings
├── archive.html        All past screenings, filterable by country
├── event.html          A single past screening (reads ?e=slug)
├── recommend.html      Recommend a film + offer a space (two forms)
├── volunteer.html      What we offer + role-specific application form
├── about.html          Story, team, contact
│
├── data/               ← ALL THE CONTENT LIVES HERE
│   ├── site.json         settings and page copy
│   ├── events.json       screenings, upcoming and past
│   └── roles.json        volunteer roles and their questions
│
├── .pages.yml          tells the CMS how to edit those files
├── form-handler.gs     Google Apps Script that collects form responses
├── preview.cmd         double-click to preview the site locally
└── assets/
    ├── css/style.css
    ├── js/site.js
    └── img/
        ├── brand/      official logo kit files
        └── events/     screening photographs
```

---

## 2. Editing the site (the easy way)

1. Go to **https://app.pagescms.org** and sign in with GitHub.
2. Grant it access to the `passenger-cinema` repo.
3. You get a web admin with three sections:
   - **Screenings** — add an upcoming event, move one into the archive, upload photos
   - **Volunteer roles** — change the roles and their application questions
   - **Site text & settings** — every headline and paragraph on the site

Saving in the CMS writes a commit to GitHub, and the live site updates a minute
or so later. You can do all of this from your phone.

**Adding a screening:** open Screenings, click add under *Upcoming*, fill it in.
The one at the top is the "next departure" shown on the home page.

**After the event has happened:** move it from *Upcoming* into *Archive* (top of
the list), then add the story, the "beyond the screen" section, credits, any
impact figures, and the photographs.

**Photographs:** upload them in the CMS. The first photo on an event is used as
the cover image, so pick a wide one. Events with no photos fall back to a
designed placeholder panel, so nothing looks broken while you catch up.

### Editing the files by hand instead

You can also just edit the JSON in `data/` in any text editor and push. Keep it
valid JSON: double quotes around everything, commas between items, no trailing
comma before a closing bracket.

---

## 3. Dates still to confirm

Entries with a `confirm` note need checking before you rely on them. They show
in the CMS as "Internal note" and never appear on the website.

| Screening | What to confirm |
|---|---|
| The Cook, the Thief… | Exact date (7 June 2026 came from your Barcelona planning sheet), plus photos |
| Vengo | Exact date. We only have "April 2026". Plus photos |
| In the Mood for Love | Date, venue, your own copy, photos |
| Black Orpheus | Narrowed to 19 Feb – 4 Mar 2025 by the Janus licence invoice and the photo archive date, so likely 22/23 Feb or 1/2 Mar. Photos still zipped in Drive |
| Tampopo | Exact date, photos |

Everything else is dated from the EXIF timestamps on your own photographs, so
those dates are solid.

---

## 4. Collecting form responses

The film recommendation, venue suggestion and volunteer forms can post straight
into a Google Sheet you own. Setup takes about five minutes and the full
instructions are in the comments at the top of **`form-handler.gs`**.

The short version:

1. Make a new Google Sheet.
2. Extensions → Apps Script, paste in `form-handler.gs`.
3. Deploy → New deployment → Web app, execute as **Me**, access **Anyone**.
4. Copy the web app URL.
5. Paste it into the CMS under **Site text & settings → Form endpoint**.

You get one tab per form, a timestamped row per submission, and an email alert
each time (turn that off by clearing `NOTIFY_EMAIL` in the script).

Until you do this, the forms fall back to opening the visitor's email client
with their answers pre-filled. That works, but you lose anyone who doesn't have
an email client set up, and nothing is stored.

---

## 5. How it gets online

The site is live at **https://passengercinema.com**, hosted on **Vercel**.

The chain is:

```
you save in the CMS  →  commit to GitHub  →  Vercel redeploys  →  Cloudflare  →  visitor
```

Cloudflare holds the DNS and proxies to Vercel. You don't need to touch either
of them day to day: pushing to `main`, whether from the CMS or by hand, is all
it takes. A deploy lands in about a minute.

GitHub Pages is **not** used. There is deliberately no `CNAME` file in the repo,
because that file is how Pages claims a domain and having both configured for
`passengercinema.com` caused confusion.

### `vercel.json`

This sets cache headers, and it matters. The files in `data/` are rewritten on
every CMS save, so they are marked `must-revalidate` — without that, Vercel's
CDN can serve yesterday's events for hours and it looks like the site is broken.
Photographs cache for a week, since they never change once uploaded.

### When something looks wrong

Open **https://passengercinema.com/data/events.json** in your browser.

- Films listed there → the content is fine, so it is a deploy or cache issue.
  Hard-reload with Ctrl+Shift+R, and check the Vercel dashboard for a failed build.
- That URL errors → something is genuinely broken. Check the most recent commit.

---

## 6. Previewing locally

Double-click **`preview.cmd`**. It starts a small server and opens the site in
your browser. Press Ctrl+C in the black window to stop it.

You can't open `index.html` straight off the disk any more: browsers block
pages loaded that way from reading the JSON files in `data/`. The site will tell
you so if you try.

---

## 7. Design notes

- **Colours** are the official brand values from your logo kit: Midnight Green
  `#114C5C` and Ivory `#FBFAED`, plus a stamp red `#B8402C` and an ochre
  `#D2913A` for accents on dark backgrounds. All CSS variables at the top of
  `style.css`.
- **Type** is Fraunces (editorial serif, headlines), Archivo (body) and
  Space Mono (labels, dates, ticket details), from Google Fonts.
- **Country codes instead of flag emoji.** Flag emoji don't render on Windows,
  so countries show as two-letter luggage tags. They suit the travel idea better
  anyway.
- **The passport stamps** are drawn in CSS, not images: uneven rotation, a
  double rule, three cycling ink colours and an SVG turbulence mask so the ink
  breaks up like a real rubber stamp.
- Responsive, keyboard-navigable, and respects `prefers-reduced-motion`.
