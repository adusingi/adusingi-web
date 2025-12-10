# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Aimable Dusingizimana - a Project Manager and Builder based in Okayama, Japan.

## Tech Stack

- **Vite 5** - Build tool and dev server
- **TypeScript** - Type safety for interactivity code
- **Tailwind CSS 4** - Styling via PostCSS
- **Lucide** - Icon library (vanilla JS, not React)

## Development Commands

Package manager: **pnpm**

```bash
pnpm install   # Install dependencies
pnpm dev       # Start dev server
pnpm build     # TypeScript check + Vite build
pnpm preview   # Preview production build
pnpm lint      # Run ESLint
```

## Architecture

This is a **vanilla HTML/JavaScript** project, not a React app:

- **[index.html](index.html)**: All site content and structure with Tailwind classes
- **[index.tsx](index.tsx)**: JavaScript interactivity only:
  - Lucide icon initialization
  - Mobile menu toggle
  - Navbar scroll effects (transparent → solid)
  - Reveal-on-scroll animations via IntersectionObserver
- **[style.css](style.css)**: Tailwind imports and custom theme (fonts, colors, reveal animations)

### Styling

Tailwind CSS 4 with PostCSS build. Theme in [style.css](style.css):
- **Fonts**: Inconsolata (sans/mono), Cormorant Garamond (serif)
- **Colors**: Custom navy, slate variants
- **Animations**: `.reveal` class with delay modifiers

### Adding Features

1. Update [index.html](index.html) for structure/content
2. Update [index.tsx](index.tsx) for interactivity
3. Update [style.css](style.css) for custom styles

## Deployment

Configured for **Vercel** (see [vercel.json](vercel.json)):

```bash
vercel          # Deploy preview
vercel --prod   # Deploy production
```

## Notes

- No tests in this project
- Run `pnpm lint` before committing
- Some React dependencies exist in package.json for Vite plugin compatibility but React components are not used
