# AVEL — Premium Leather Slippers

A complete, self-contained static website for the AVEL brand: homepage,
product detail page, and shopping cart UI. No framework, no build step,
no external accounts required to run it.

```
avel-website/
├── index.html              ← the entire site (home view + product view)
├── css/
│   └── style.css           ← all styles
├── js/
│   └── main.js             ← all interactivity (nav, cart, product page, animations)
├── assets/
│   └── images/
│       └── README.md       ← where to drop real product photography later
├── package.json            ← optional convenience scripts (not required)
├── .gitignore
└── README.md                ← this file
```

## What's included

- Responsive homepage: header/nav, hero, value strip, product grid, editorial
  section, materials section, pricing section, collections, testimonials,
  Instagram-style grid, newsletter signup, footer
- Product detail page (color/size/quantity selectors, image gallery,
  accordion for details/materials/fit/shipping)
- Slide-out cart drawer with add/remove/update quantity, live subtotal, and
  a free-shipping threshold message
- Mobile menu, sticky header with scroll blur, hover/quick-add interactions,
  and scroll-reveal animations — all in plain CSS/JS, no libraries

Everything runs client-side. There is no backend, no database, and no
payment processing wired up — the "Checkout" button shows a placeholder
alert, since that's the point where you'll connect a real cart/checkout
provider (see **Next steps** below).

## Running it locally

You don't need Node.js, npm, or any build tool. Pick whichever is easiest:

**Option A — just open the file**
Double-click `index.html` (or drag it into a browser window). The whole
site works, including the cart and product page. This is the fastest way
to preview it.

**Option B — a local static server (recommended for testing)**
Some browsers restrict certain features when opening files directly via
`file://`. A local server avoids that entirely:

```bash
cd avel-website
npx serve . -l 3000
```

Then open `http://localhost:3000`. (`npx serve` needs Node.js installed,
but no project dependencies — it just runs a lightweight static server.)

Any other static server works too, e.g. `python3 -m http.server 3000`.

## Production build

There is nothing to compile — `index.html`, `css/style.css`, and
`js/main.js` **are** the production files. "Building" this project means:

1. Add your real product photography into `assets/images/` (see that
   folder's `README.md` for exactly which placeholders to replace).
2. Update any placeholder copy, prices, or links in `index.html` if needed.
3. Upload the contents of this folder as-is to your host.

Optional but recommended before going live:
- Run the three files through a minifier/bundler of your choice if you want
  smaller payloads (not required — the site is lightweight as-is).
- Compress any photos you add (JPEG/WebP, sensibly sized) before uploading.

## Deploying to a host with your own domain

This is a static site, so it works on any static hosting provider. A few
common options:

**Netlify / Vercel (drag-and-drop, easiest)**
1. Create an account, choose "deploy manually" / "add new project."
2. Drag the entire `avel-website` folder onto the upload area (or connect
   it via a GitHub repo you push this folder to).
3. Once deployed, go to the project's domain settings and add your own
   domain, following the DNS instructions the provider gives you (usually
   an A/ALIAS record or CNAME pointing at their servers).

**GitHub Pages**
1. Push this folder's contents to a GitHub repository.
2. In the repo's Settings → Pages, set the source to the branch/folder
   containing `index.html`.
3. Add your custom domain in the same settings page and create the DNS
   records GitHub shows you.

**Any traditional web host (cPanel, FTP, etc.)**
1. Upload the entire contents of this folder into your host's public/
   web root directory (often `public_html`).
2. Point your domain's DNS at the host if it isn't already.
3. Done — no server-side runtime is required.

In every case, upload **all** of `index.html`, `css/`, `js/`, and
`assets/` together, preserving the folder structure — the paths in
`index.html` (`css/style.css`, `js/main.js`) are relative and depend on it.

## Next steps (beyond this deliverable)

- Wire the "Checkout" button to a real cart/checkout system (e.g. Shopify,
  Stripe Checkout, Snipcart) once you're ready to accept payments.
- Replace placeholder product graphics with real photography (see
  `assets/images/README.md`).
- Replace the search/account icons in the header with real functionality
  if you need accounts or on-site search.
