---
type: Project Guide
title: Adusingi Portfolio
description: Development and operating guide for the adusingi.com multi-page portfolio.
tags: [portfolio, vite, typescript]
timestamp: 2026-08-18T20:55:00+09:00
---

# Adusingi Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Personal portfolio website for Aimable Dusingizimana - Project Manager & Builder based in Okayama, Japan.

The source is open under the [MIT License](#license). Feel free to read it, learn from it, or reuse
the structure for your own site — just please swap out the personal content (name, projects, copy, and images).

## Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling via PostCSS
- **Lucide Icons** - Icon library
- **Vanilla JavaScript** - Interactivity (no frameworks)
- **gray-matter** - Markdown frontmatter parsing
- **marked** - Markdown to HTML conversion

## Getting Started

This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Build blog posts from markdown
pnpm run build:posts

# Send a blog post as newsletter (requires RESEND_API_KEY)
pnpm run newsletter:send <post-slug>
```

## Project Structure

```
adusingi-web/
├── index.html          # Main landing page
├── index.tsx           # Main page JavaScript
├── contact.html        # Contact page
├── contact.tsx         # Contact page JavaScript
├── blog.html           # Blog index page
├── blog.tsx            # Blog index JavaScript
├── post.html           # Individual post page
├── post.tsx            # Post page JavaScript
├── posts/              # Markdown blog posts
│   └── *.md            # Blog post files (YYYY-MM-DD-slug.md)
├── scripts/
│   └── build-posts.ts  # Converts markdown to JSON
├── src/
│   └── data/
│       └── posts.json  # Generated post data (auto-generated)
├── newsletter/
│   ├── post-template.ts   # Email template
│   └── send-post.ts       # Newsletter sending script
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── CLAUDE.md           # AI assistant guidance
```

## Architecture

This is a **multi-page vanilla HTML/JavaScript** site (no frameworks):

### Pages
- **[index.html](index.html)** - Main landing page with portfolio content
- **[contact.html](contact.html)** - Contact page with Tally form embeds
- **[blog.html](blog.html)** - Blog index with tag filtering
- **[post.html](post.html)** - Individual blog post page
- **[photography.html](photography.html)** - Flat photography grid backed by local photos plus the Files publication feed

### Blog System
- **Markdown posts** in `/posts` directory with YAML frontmatter
- **Build-time generation** - markdown converted to JSON at build time
- **Static output** - all blog data in `src/data/posts.json`
- **Tag filtering** - client-side filtering on blog index
- **SEO-friendly URLs** - Vercel rewrites for clean URLs (`/blog/post-slug`)

### Photography System

- Existing photos remain in `public/photos/photos.json`, newest first.
- New photos tagged `#portfolio` in Files load from the public
  `files.mobayilo.com` photography feed before the local collection.
- If the remote feed is unavailable, malformed, or does not respond within
  three seconds, the complete local collection still renders.
- Grid images use small derivatives while the lightbox uses larger,
  metadata-stripped display derivatives.

### Styling
- **Tailwind CSS 4** via PostCSS build
- **Custom fonts**: Inconsolata, Cormorant Garamond, Noto Serif JP
- **Reveal animations** using IntersectionObserver

## Deployment

The site is deployed on **Vercel** from GitHub, at `www.adusingi.com` (the apex domain redirects to
`www`). DNS and email are at OVH. [`vercel.json`](vercel.json) holds the build settings and the clean URL
rewrites. [`api/subscribe.ts`](api/subscribe.ts) is deployed automatically as a Vercel Serverless Function
at `POST /api/subscribe`; it requires a `RESEND_API_KEY` (and optional `ALLOWED_ORIGIN`) environment
variable, set in the Vercel project settings. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

```bash
# Build into dist/
pnpm build

# Serve the built site
pnpm preview

# Run the site plus the serverless function
pnpm dev:api
```

The build process generates blog posts, runs TypeScript type checking, then runs the Vite build,
outputting to the `dist/` directory.

> The [Dockerfile](Dockerfile) and the Express server in [`server/index.ts`](server/index.ts) are an unused
> self-host path, kept as an option. Production does not use them.

## Features

- Responsive design with mobile-first approach
- Smooth scroll animations using IntersectionObserver
- Mobile menu with toggle functionality
- Dynamic navbar with scroll effects
- Projects showcase
- Experience timeline
- Interests section
- Contact page with multiple forms
- **Blog system** with markdown posts
- **Tag filtering** for blog posts
- **Newsletter integration** with Resend

## Blog Usage

### Adding a New Post

1. Create a new markdown file in `/posts` with the naming format: `YYYY-MM-DD-slug.md`

```bash
# Example
posts/2024-12-15-my-new-post.md
```

2. Add YAML frontmatter at the top of the file:

```yaml
---
title: "Your Post Title"
date: 2024-12-15
description: "Brief description for SEO and previews"
tags: ["tag1", "tag2"]
draft: false
---

Your markdown content here...
```

3. Build the posts:

```bash
pnpm run build:posts
```

4. The post will appear on `/blog` and be accessible at `/blog/my-new-post`

### Draft Posts

Set `draft: true` in the frontmatter to exclude a post from the build:

```yaml
---
title: "Work in Progress"
draft: true
---
```

### Sending Newsletter

To send a blog post as a newsletter via Resend:

1. Set up your environment variables:

```bash
# Copy .env.example to .env
cp .env.example .env

# Add your Resend API key
RESEND_API_KEY=re_your_api_key_here
NEWSLETTER_TO=recipient@example.com
```

2. Send the newsletter:

```bash
pnpm run newsletter:send my-post-slug
```

**Note**: You'll need to configure a verified sending domain in your Resend account and update the `from` address in `newsletter/send-post.ts`.

## License

This project is licensed under the [MIT License](LICENSE) — © 2026 Aimable Dusingizimana.

The MIT License covers the source code. Personal content (written copy, project descriptions, and any
images or branding for Aimable Dusingizimana) is not licensed for reuse — please replace it with your own
if you build on this.
