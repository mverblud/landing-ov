# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Vanilla HTML5 + CSS + JavaScript. No build tools, no package managers, no frameworks, no libraries. The site runs by opening `index.html` directly in a browser (`file://`) and deploys as-is to GitHub Pages.

## Running the site

Open `index.html` in any browser. No server required. To simulate GitHub Pages locally, any static server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There are no tests, no linters, and no build steps.

## Architecture

All styles live in **`css/styles.css`**, which is organized in 18 numbered sections matching a CSS design system:

1. **Design Tokens** — all `--color-*`, `--space-*`, `--text-*`, `--radius-*`, `--shadow-*` and `--transition-*` custom properties are defined in `:root`. These are the single source of truth for the visual system. Always use tokens instead of hardcoded values.
2. Sections 2–17 implement the design system components and page sections in the same order they appear in `index.html`.
3. Section 18 is all responsive breakpoints (1024px → 768px → 480px), grouped at the end.

**`js/main.js`** is divided into 8 self-contained IIFEs (one per feature): navbar sticky/mobile, smooth scroll, reveal on-scroll, animated counters, scroll-top button, footer year, and card tilt. All animation is gated behind a `prefersReducedMotion` check at the top of the file.

**`index.html`** uses semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<address>`, `<article>`). Sections have IDs that match the navbar anchor links: `#inicio`, `#nosotros`, `#que-hacemos`, `#por-que`, `#proximamente`, `#contacto`.

## Key constraints

- **No inline CSS or JS** — all styling via `css/styles.css`, all behavior via `js/main.js`.
- **No external dependencies** — the only network requests are Google Fonts (`fonts.googleapis.com`). Everything else is local.
- WhatsApp links use the format `https://wa.me/5493517687201?text=...` (number includes country + area code, no `+`).

## Assets

| Path | Purpose |
|---|---|
| `img/logo.png` | Horizontal logo (navbar + footer). Replace to rebrand. |
| `img/perfil.png` | Isotipo — used as favicon, apple-touch-icon and Open Graph image. |
| `img/hero.jpg` | Optional hero background photo. CSS hero works without it; to activate it, uncomment the block marked `/* Si el usuario agrega hero.jpg */` in `css/styles.css` section 7. |
| `img/marcas/*.svg` | Brand logo placeholders. Replace SVG files with real logos; filenames and `<img>` references in `index.html` must match. |
| `icons/` | PWA icons (`icon-192.png`, `icon-512.png`) — currently empty; derive from `img/perfil.png`. |

## Adding new pages

The design system in `css/styles.css` is built to be reused. New pages (Productos, Marcas, Nosotros, Contacto, Tienda) should:
1. Link `css/styles.css` and `js/main.js`.
2. Use the existing token-based classes (`.btn`, `.card`, `.section`, `.container`, `.eyebrow`, `.badge`, etc.).
3. Add any page-specific styles as a new numbered section at the end of `styles.css`, using existing tokens.
