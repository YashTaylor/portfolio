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

## Changing the theme

All colors live as CSS custom properties at the top of `css/style.css` (`:root` block). Change `--accent` (and `--accent-2` for gradients) to instantly retheme the site. Fonts are Inter + JetBrains Mono, loaded from Google Fonts.

## Interactions

All in `js/main.js`, no libraries: typing-effect hero, animated stat counters, cursor spotlight, 3D-tilt project cards with cursor-tracking glow, staggered scroll reveals, scroll progress bar, hide-on-scroll nav, and a back-to-top button. Everything degrades gracefully under `prefers-reduced-motion` and on touch devices.

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
