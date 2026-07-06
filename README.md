# Yash Tailor — Portfolio

A single-page personal portfolio built with plain HTML, CSS, and JavaScript. No build step, no dependencies — just open `index.html` in a browser.

## Filling in your content

All placeholder text is wrapped in `[square brackets]` and marked with `<!-- TODO -->` comments in `index.html`. Search for `TODO` to find every spot. The main ones:

| What | Where |
|---|---|
| Page title & meta description | `<head>` at the top of `index.html` |
| Role/tagline & intro | Hero section |
| Bio (2–3 paragraphs) | About section |
| Photo | Replace the `about__photo-placeholder` div with an `<img src="assets/photo.jpg">` |
| Projects (3 cards) | Projects section — title, description, tech tags, GitHub/demo links |
| Skills | Skills section — three groups of badges |
| Experience/education | Timeline entries in the Skills section |
| Email address | `mailto:` link in the Contact section |
| GitHub / LinkedIn URLs | Social icon links in the Contact section |
| Resume | Drop your PDF at `assets/resume.pdf` |

## Theme — "The Traveler's Road"

A Japanese-animated-film-inspired world: the sky shifts from sunset to moonlit night as you scroll, sakura petals drift, birds cross the sky by day, and fireflies and lanterns glow at night. All scenery is inline SVG/CSS/canvas — zero image assets besides the photo and resume. The previous dark developer theme is preserved on the `dark-theme` git branch.

All colors live as CSS custom properties at the top of `css/style.css` (`:root` block). Fonts: Shippori Mincho + Zen Kaku Gothic New (Google Fonts).

## Interactions & systems

- `js/main.js` — sky crossfade + `--night` variable, cinematic hero name reveal, role crossfade, stat counters, staggered reveals, timeline fill, nav/progress/back-to-top
- `js/ambient.js` — shared canvas: sakura petals (always), bird flocks (day), fireflies (night)
- `js/audio.js` — optional ambience synthesized with the Web Audio API (wind + fūrin chimes on the Hirajoshi scale), muted by default, toggle at bottom-left

Everything degrades gracefully under `prefers-reduced-motion` and on touch devices.

## Running locally

Just open `index.html` in a browser — no server needed.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (for a `username.github.io` URL, name it exactly `yourusername.github.io`; otherwise any name works and the site lives at `yourusername.github.io/repo-name`).
2. Push this folder:
   ```
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**.
4. Your site goes live at the URL shown on that Pages settings screen within a minute or two.
