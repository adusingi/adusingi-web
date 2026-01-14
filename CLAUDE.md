# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Aimable Dusingizimana - a Project Manager and Builder based in Okayama, Japan.

## Tech Stack

- **Vite 5** - Build tool and dev server
- **TypeScript** - Type safety for interactivity code
- **Tailwind CSS 4** - Styling via PostCSS
- **Lucide** - Icon library (vanilla JS, not React)
- **gray-matter** - YAML frontmatter parsing for blog posts
- **marked** - Markdown to HTML conversion

## Development Commands

Package manager: **pnpm**

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (host: true for network access)
pnpm build            # Build posts + TypeScript check + Vite build
pnpm build:posts      # Generate posts.json from markdown
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm test             # Run tests with vitest
pnpm newsletter:send <post-slug>  # Send blog post as newsletter (requires RESEND_API_KEY)
```

## 🚨 Development Rules

**ALWAYS work from development branch:**
- Switch to `development` branch before starting any work
- Create feature branches from `development`
- Never work directly from `main` branch

## 🚨 Deployment Rules - REQUIRE EXPLICIT CONSENT

**NEVER deploy without explicit user permission:**
- Blog posts
- New features  
- Code changes
- Configuration updates

**Deployment workflow:**
1. **ASK FIRST**: Always ask "Ready to deploy this?"
2. **WAIT**: Wait for explicit "yes" or "deploy now" response
3. **CONFIRM**: Briefly describe what will be deployed
4. **PROCEED**: Only then run deployment commands

**Emergency exceptions only:**
- Critical security fixes
- Breaking production issues
- WITH immediate user notification

**Blog Post Process:**
- Write content → Build → Preview locally → **ASK FOR APPROVAL** → Deploy

## Architecture

This is a **vanilla HTML/JavaScript** project, not a React app. It uses a **multi-page** setup:

- **[index.html](index.html)**: Main landing page with all portfolio content and structure
- **[index.tsx](index.tsx)**: JavaScript interactivity for main page:
  - Lucide icon initialization
  - Mobile menu toggle
  - Navbar scroll effects (transparent → solid)
  - Reveal-on-scroll animations via IntersectionObserver
- **[contact.html](contact.html)**: Separate contact page with Tally form embeds
- **[contact.tsx](contact.tsx)**: JavaScript interactivity for contact page:
  - Mobile menu toggle
  - Contact form toggling (three different forms)
  - Hash-based navigation for forms
- **[blog.html](blog.html)**: Blog index page listing all posts
- **[blog.tsx](blog.tsx)**: JavaScript interactivity for blog index:
  - Render posts from JSON
  - Tag filtering (client-side)
  - Mobile menu toggle
- **[post.html](post.html)**: Individual blog post page
- **[post.tsx](post.tsx)**: JavaScript interactivity for post page:
  - Load post from JSON based on URL slug
  - Dynamic meta tags for SEO
  - Mobile menu toggle
- **[src/components/newsletter-form.ts](src/components/newsletter-form.ts)**: Newsletter subscription form handler
- **[api/subscribe.ts](api/subscribe.ts)**: Vercel serverless function for newsletter subscriptions (adds contacts via Resend API)
- **[style.css](style.css)**: Tailwind imports and custom theme (fonts, colors, reveal animations)
- **[vite.config.ts](vite.config.ts)**: Multi-page build configuration

### Styling

Tailwind CSS 4 with PostCSS build. Theme in [style.css](style.css):
- **Fonts**:
  - Inconsolata (sans/mono) - via @fontsource
  - Cormorant Garamond (serif) - via @fontsource
  - Noto Serif JP (Japanese text) - via Google Fonts, used with `.font-jp` class
- **Colors**: Custom navy, slate variants
- **Animations**: `.reveal` class with delay modifiers (100ms, 200ms, 300ms)

### Adding Features

For the **main page**:
1. Update [index.html](index.html) for structure/content
2. Update [index.tsx](index.tsx) for interactivity
3. Update [style.css](style.css) for custom styles

For the **contact page**:
1. Update [contact.html](contact.html) for structure/content
2. Update [contact.tsx](contact.tsx) for interactivity
3. Share styles via [style.css](style.css)

For the **blog**:
1. Add markdown files to [posts/](posts/) directory (format: `YYYY-MM-DD-slug.md`)
2. Run `pnpm run build:posts` to generate [src/data/posts.json](src/data/posts.json)
3. Posts automatically appear on [blog.html](blog.html) and [post.html](post.html)

## Blog System

### Architecture
- **Markdown posts** in `/posts` with YAML frontmatter
- **Build-time generation**: [scripts/build-posts.ts](scripts/build-posts.ts) converts markdown to JSON
- **Static output**: All posts in [src/data/posts.json](src/data/posts.json) (committed to git)
- **Zero runtime deps**: Blog pages read from static JSON

### Post Format
Posts are in `/posts` directory with naming: `YYYY-MM-DD-slug.md`

```markdown
---
title: "Post Title"
date: 2024-12-15
description: "Brief description for SEO"
tags: ["tag1", "tag2"]
draft: false
---

Markdown content here...
```

**Important**: The slug is extracted from the filename by removing the date prefix and `.md` extension. For example, `2024-12-15-my-post.md` becomes slug `my-post`.

### URLs
- Blog index: `/blog` → [blog.html](blog.html)
- Individual post: `/blog/post-slug` → [post.html](post.html) (via Vercel rewrite in [vercel.json](vercel.json))
- Query param fallback: `/post.html?slug=post-slug`

### Newsletter Integration
- **Template**: [newsletter/post-template.ts](newsletter/post-template.ts) generates HTML email from post content
- **Sending**: [newsletter/send-post.ts](newsletter/send-post.ts) sends via Resend API
- **Usage**: `pnpm run newsletter:send <post-slug>` (use the slug from filename, not the full filename)
- **Requires**: `RESEND_API_KEY` and `NEWSLETTER_TO` environment variables (see [.env.example](.env.example))

## Deployment

Configured for **Vercel** with URL rewrites for clean blog URLs (see [vercel.json](vercel.json)):

```bash
vercel          # Deploy preview
vercel --prod   # Deploy production
```

Build process: `pnpm run build:posts && tsc && vite build`
Output directory: `dist/`

## Important Notes

- This is a **vanilla HTML/JS project**. The `.tsx` files are TypeScript with JSX syntax for Lucide icons only
- React and React-DOM have been removed
- Icons are initialized using `createIcons()` from `lucide` package
- All interactivity is vanilla TypeScript - use `document.querySelector`, `addEventListener`, etc.
- Build order matters: posts must be built before TypeScript compilation
- Posts are sorted by date (newest first) automatically in [scripts/build-posts.ts](scripts/build-posts.ts)
- Tests use vitest - run `pnpm test` to execute. Test files are in [tests/](tests/)
