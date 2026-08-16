# Image Assets — Replace Me

The live site currently uses **inline SVG line-art** as placeholder product
imagery (drawn directly in `js/main.js`, function `slipperSVG()`). There are
**no external image files** the site depends on — this folder is provided so
you have an obvious place to drop real photography when it's ready.

Nothing will break if this folder stays empty; the placeholders will keep
rendering until you wire in real images.

## Where placeholders are used

| Location                          | Current placeholder                          |
|-----------------------------------|-----------------------------------------------|
| Product grid cards (home page)    | Inline SVG slipper (`slipperSVG()` in main.js)|
| Product detail gallery + thumbs   | Inline SVG slipper (`slipperSVG()` in main.js)|
| Cart drawer item thumbnails       | Inline SVG slipper (`slipperSVG()` in main.js)|
| Editorial section background      | CSS gradient (`.editorial-bg` in style.css)   |
| Material/craftsmanship visual     | CSS texture gradient (`.material-visual`)     |
| Collection tiles (3 tiles)        | CSS gradients (`.collection-tile`)            |
| Instagram/social grid (6 tiles)   | CSS gradients (`.social-tile`)                |
| Hero background slipper graphic   | Inline SVG in `index.html` (`.hero-slipper`)  |

## Suggested filenames once you have real photography

Drop files in this folder using names like:

```
assets/images/
  hero-desktop-01.jpg   hero-mobile-01.jpg   (hero slide 1 — already wired via <picture>)
  hero-desktop-02.jpg   hero-mobile-02.jpg   (hero slide 2 — already wired via <picture>)
  hero-desktop-03.jpg   hero-mobile-03.jpg   (hero slide 3 — already wired via <picture>)
  product-avel-one-1.jpg
  product-avel-one-2.jpg
  product-avel-two-1.jpg
  product-avel-two-2.jpg
  product-avel-three-1.jpg
  product-avel-three-2.jpg
  product-avel-signature-1.jpg
  product-avel-signature-2.jpg
  editorial-lifestyle.jpg
  material-closeup.jpg
  collection-essentials.jpg
  collection-signature.jpg
  collection-new-arrivals.jpg
  social-01.jpg ... social-06.jpg
```

Then swap the corresponding CSS gradient / inline SVG for a normal
`<img src="assets/images/...">` or a CSS `background-image` referencing
`url('../assets/images/...')`. Every spot to change is listed in the table
above with its exact selector/function name so it's a direct find-and-replace.
