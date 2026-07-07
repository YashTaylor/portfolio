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

## Theme — "The Night Shrine"

A traditional dark Japanese world in permanent night: ink-black sky with moon and stars, a vermillion torii under moonbeams, lacquer panels edged in gold, lantern-lit project scrolls, dark-wood ema plaques, and a koi pond in a tea house garden. Ember sparks rise and fireflies drift across the scene. All scenery is inline SVG/CSS/canvas — zero image assets besides the photo and resume.

Other themes preserved on branches: `warm-japanese-theme` (sunset→night sakura version), `dark-theme` (original modern developer design).

All colors live as CSS custom properties at the top of `css/style.css` (`:root` block). Fonts: Shippori Mincho + Zen Kaku Gothic New (Google Fonts).

## Interactions & systems

- `js/main.js` — cinematic hero name reveal, role crossfade, stat counters, staggered reveals, timeline fill, parallax, nav/progress/back-to-top
- `js/ambient.js` — shared canvas: rising ember sparks + fireflies
- `js/audio.js` — optional ambience synthesized with the Web Audio API (wind + fūrin chimes on the Hirajoshi scale), muted by default, toggle at bottom-left

Everything degrades gracefully under `prefers-reduced-motion` and on touch devices.

## Running locally

Just open `index.html` in a browser — no server needed.

## Live site

**https://yashtaylor.github.io/portfolio/** — deployed with GitHub Pages from the `main` branch root. Every push to `main` redeploys automatically within a minute or two:

```
git add -A && git commit -m "your change" && git push
```
