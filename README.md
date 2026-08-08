# Passenger Cinema website

A plain HTML/CSS/JavaScript site. No build step, no framework, no dependencies.
Double-click `index.html` to open it locally, or drop the whole folder onto a host.

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
├── about.html          Story, awards, team, contact
├── data/
│   └── events.js       ← THE ONLY FILE YOU NORMALLY NEED TO EDIT
└── assets/
    ├── css/style.css
    ├── js/site.js      ← the form endpoint + contact email live at the top
    └── img/
        ├── brand/      official logo kit files
        └── events/     screening photographs
```

---

## 2. Adding a screening

Open `data/events.js`. Add an object to the top of `PC.upcoming`:

```js
{
  slug: "some-film",              // used in the URL, lowercase, hyphens
  film: "Some Film",
  director: "Director Name",
  code: "FR",                     // ISO country code, shown as a luggage tag
  country: "France",
  destinationCode: "GB",          // where the audience physically goes
  destinationCountry: "United Kingdom",
  year: 1962,
  date: "2026-10-04",             // ISO. The site formats and sorts on this
  doors: "18:30",
  start: "19:00",
  ends: "22:00",
  venue: "Some Venue",
  city: "Peckham, London",
  ticketUrl: "https://...",
  ticketLabel: "Get tickets",
  standfirst: "One or two sentences, used on the ticket card.",
  body: ["Paragraph one.", "Paragraph two."],
  runningOrder: [["18:30","Doors open"], ["19:00","Screening"]],
  beyond: "What happens after the credits",
  photos: []
}
```

**After the event has happened**, cut it out of `upcoming`, paste it at the **top**
of `past`, then add:

- `attendance: 40` and `soldOut: true` if relevant
- `story: [...]` sets the paragraphs about the screening (HTML like `<em>` is allowed)
- `beyondTitle` / `beyondBody: [...]` cover the workshop, meal, gig, Q&A
- `impact: [["40","tickets, sold out in two days"], ...]` adds an optional stat row
- `credits: [...]` lists venues, collaborators, workshop leads
- `links: [{label:"...", url:"..."}]` adds optional external links
- `photos: ["some-film-01.jpg", ...]` (see below)

Entries with a `confirm:` note still need checking. They currently are:

| Screening | What to confirm |
|---|---|
| The Cook, the Thief… | Exact date (7 June 2026 came from your Barcelona planning sheet), plus photos |
| Vengo | Exact date. We only have "April 2026". Plus photos |
| In the Mood for Love | Date, venue, your own copy, photos |
| Black Orpheus | Narrowed to 19 Feb – 4 Mar 2025 (Janus licence invoice, then the photo archive date), so likely 22/23 Feb or 1/2 Mar. Photos still zipped in Drive |
| Tampopo | Exact date, photos |

Everything else is dated from the EXIF timestamps on your own photographs, so
those dates are solid.

---

## 3. Adding photographs

1. Save JPEGs into `assets/img/events/`.
2. Name them `slug-01.jpg`, `slug-02.jpg`, … to keep the folder readable.
3. List the filenames in that event's `photos:` array. **The first one is the
   cover image**, used on cards and as the page hero, so choose a wide one.

Keep them around 1400–1800px on the longest side and under ~400KB each, or the
archive page gets slow on mobile. The 50 photos already in there were exported
at that size from your Drive folders.

Events with no photos automatically fall back to a designed placeholder panel
(country code + film title), so nothing looks broken while you catch up.

---

## 4. Making the forms actually send

Right now every form falls back to **opening the visitor's email client** with
all their answers pre-filled, addressed to `hello@passengercinema.com`. That
works everywhere but relies on the visitor having an email client set up, and
you lose anyone who doesn't.

To receive submissions properly, pick one:

### Option A: Formspree (works on any host, free tier is fine)

1. Sign up at <https://formspree.io> and create a form. You get an endpoint like
   `https://formspree.io/f/abcdwxyz`.
2. Open `assets/js/site.js` and set it on line ~18:

```js
var FORM_ENDPOINT = "https://formspree.io/f/abcdwxyz";
```

That's it. All three forms (film, venue, volunteer) will post there, each with a
distinct subject line so they're easy to filter.

### Option B: Netlify Forms (only if you host on Netlify)

Add `netlify` and a `name` attribute to each `<form>` tag, e.g.
`<form class="form" data-pcform name="film-recommendation" netlify ...>`, add a
hidden `<input type="hidden" name="form-name" value="film-recommendation">`
inside it, and leave `FORM_ENDPOINT` as `""`… **but** you must also remove the
`e.preventDefault()` behaviour for those forms. Formspree is less fiddly.

### Changing the contact address

Also at the top of `assets/js/site.js`:

```js
var CONTACT_EMAIL = "hello@passengercinema.com";
var INSTAGRAM     = "https://www.instagram.com/passenger.cinema/";
```

These fill in everywhere on the site automatically.

---

## 5. Putting it online

The site is static files, so any of these work. All free.

**Netlify (easiest):** go to <https://app.netlify.com/drop> and drag the
`passenger-cinema` folder onto the page. You get a URL immediately. To use
`passengercinema.com`, buy the domain and point it at Netlify in
Site settings → Domain management.

**GitHub Pages:** create a repo, upload the folder contents, then
Settings → Pages → deploy from `main` / root.

**Cloudflare Pages / Vercel:** same idea, connect the repo or upload directly.

To update afterwards, edit the files and re-upload (or push to the repo).

---

## 6. Previewing locally

Opening `index.html` directly from Finder/Explorer mostly works. If your browser
blocks the `data/events.js` load over `file://`, run a tiny local server from the
folder instead:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

---

## 7. Design notes

- **Colours** are the official brand values from your logo kit: Midnight Green
  `#114C5C` and Ivory `#FBFAED`, plus a stamp red `#B8402C` and an ochre
  `#D2913A` for accents on dark backgrounds. They're all CSS variables at the
  top of `style.css`.
- **Type** is Fraunces (editorial serif, headlines), Archivo (body) and
  Space Mono (the letterspaced labels, dates and ticket details), loaded from
  Google Fonts. If you'd rather self-host them, download from
  <https://fonts.google.com> and swap the `<link>` for `@font-face` rules.
- **Country codes instead of flag emoji.** Flag emoji don't render on Windows,
  which is a large share of UK visitors, so countries show as two-letter luggage
  tags instead. They also suit the travel idea better.
- The site is responsive, keyboard-navigable, works without JavaScript for all
  the static copy, and respects `prefers-reduced-motion`.
