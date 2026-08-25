# The Wild Olive Tree — site skeleton

A rough starting point for a homemade tinctures/ointments business site.
Plain HTML/CSS/JS, no build step, no dependencies — just three files.

## Files

- `index.html` — the whole site (hero, product grid, process, about, order/contact)
- `style.css` — all styling, colors/fonts defined as variables at the top
- `script.js` — mobile menu toggle + footer year

## What to edit first

Search the HTML for `<!-- MOM:` comments — those mark every spot that needs
real content:

- Logo — drop a file named `logo.png` into this same folder and it'll show up
  next to the business name in the header automatically (it's already wired
  up; nothing shows until the file exists)
- Her story / photo in the **About** section
- Real products in the **Apothecary** grid (duplicate a `.product-card` block per item)
- How people actually order (email/Instagram/phone — currently placeholder links)
- The FDA disclaimer text should stay as-is if she's selling herbal products in the US —
  worth double-checking wording against similar small herbal sellers, but don't drop it

## Running it locally

No build step needed. Just open `index.html` in a browser, or for a local
server (avoids some browser file:// quirks):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Putting it on GitHub Pages

1. Create a new repo on GitHub and push these three files to it.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment," set Source to **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
4. Save. GitHub gives you a URL like `https://<username>.github.io/<repo-name>/`
   within a minute or two.
5. (Optional) If she gets a custom domain later, add a `CNAME` file with the
   domain name, and point the domain's DNS at GitHub Pages.

## Notes for later

- No cart/checkout — this is a "here's what I have, message me to order" site,
  which is normal for a small homemade-goods business. Add real checkout
  (Shopify, Square, etc.) later if volume justifies it.
- Images: drop photos into an `/images` folder and reference them instead of
  the gray placeholder box in the About section.
- The design leans into an apothecary-label look on purpose (amber glass,
  hand-labeled batch numbers) — feel free to swap the palette in the
  `:root` block at the top of `style.css` if that's not her vibe.
