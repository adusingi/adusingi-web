# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Aimable Dusingizimana (Adusingi) - a Project Manager and Builder based in Okayama, Japan. The site showcases projects, experience, interests, and contact information.

## Tech Stack

- **React 19** - UI framework (loaded via importmap CDN in production)
- **TypeScript 5.2** - Type safety
- **Vite 5.1** - Build tool and dev server
- **Tailwind CSS** - Styling (loaded via CDN)
- **Framer Motion 12** - Animation library
- **Lucide React** - Icon library
- **ESLint** - Code linting with React hooks and TypeScript support

## Development Commands

This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server (hot reload enabled)
pnpm dev

# Build for production (TypeScript check + Vite build)
pnpm build

# Preview production build locally
pnpm preview

# Run ESLint for code quality checks
pnpm lint
```

## Architecture

### Hybrid HTML/React Approach

The project uses an unusual hybrid architecture:

1. **Primary content in [index.html](index.html)**: The entire site structure (navbar, hero, projects, interests, experience, footer) is written as static HTML with Tailwind classes. This is the production implementation.

2. **[index.tsx](index.tsx)**: The entry point that adds JavaScript interactivity:
   - Initializes Lucide icons
   - Implements mobile menu toggle
   - Adds navbar scroll effects (transparent → solid background)
   - Handles reveal-on-scroll animations using IntersectionObserver

**Note:** Previously, there were React components (`components/`), `App.tsx`, `constants.tsx`, and `types.ts` files that are now obsolete and should be removed. See [CLEANUP_REPORT.md](CLEANUP_REPORT.md) for details.

### Key Implementation Details

- **Styling**: TailwindCSS is loaded via CDN script tag in [index.html](index.html) with custom theme configuration (fonts: Inter + Playfair Display)
- **Dependencies**: React, Framer Motion, and other packages are loaded via importmap in [index.html](index.html) pointing to aistudiocdn.com
- **Animations**: Custom reveal animations using CSS classes (.reveal, .reveal-delay-*) triggered by IntersectionObserver
- **Responsive**: Mobile-first design with responsive breakpoints (md, lg)

## Configuration Files

- **[vite.config.ts](vite.config.ts)**: Basic Vite config with React plugin and `server.host: true` for network access
- **[tsconfig.json](tsconfig.json)**: TypeScript config with strict mode, React JSX, and ES2020 target
- **[eslint.config.js](eslint.config.js)**: ESLint flat config with TypeScript, React hooks, and React refresh plugins
- **[vercel.json](vercel.json)**: Vercel deployment configuration using pnpm

## Deployment

The project is configured for Vercel deployment:

```bash
# Deploy to Vercel (requires Vercel CLI)
vercel

# Deploy to production
vercel --prod
```

Build output goes to `dist/` directory. The build process runs TypeScript type checking before bundling.

## Important Notes

- No tests exist in this project
- The site is designed to be deployed as static HTML with minimal JavaScript
- If adding new features, follow the current pattern: update [index.html](index.html) for structure/content and [index.tsx](index.tsx) for interactivity
- Run `pnpm lint` before committing to ensure code quality
- See [CLEANUP_REPORT.md](CLEANUP_REPORT.md) for information about obsolete files that should be removed
