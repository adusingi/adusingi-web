---
title: "Building a Minimal Blog with Vite and TypeScript"
date: 2024-12-10
description: "How I built a zero-maintenance blog system using markdown, static generation, and vanilla JavaScript—no frameworks required."
tags: ["vite", "typescript", "blogging", "web-dev"]
draft: false
---

# Building a Minimal Blog with Vite and TypeScript

When building my portfolio site, I wanted to add a blog but had one strict requirement: **write once, no maintenance, stable for years**.

No frameworks that change every six months. No complicated build pipelines. No databases. Just markdown files that get converted to static HTML at build time.

## The Stack

Here's what I chose:

- **Vite** - Already using it for the portfolio
- **TypeScript** - Type safety for the build script
- **gray-matter** - Parse YAML frontmatter
- **marked** - Convert markdown to HTML
- **Vanilla JavaScript** - No React, no Vue, no framework

That's it. Four dependencies total.

## How It Works

### 1. Write Posts in Markdown

Each post is a simple markdown file in `/posts`:

```markdown
---
title: "My Post Title"
date: 2024-12-10
description: "Short description"
tags: ["vite", "typescript"]
draft: false
---

Your content here...
```

### 2. Build Script Generates JSON

A Node script reads all markdown files, parses them, and outputs a single JSON file:

```typescript
// scripts/build-posts.ts
import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';

// Read markdown files
// Parse frontmatter
// Convert to HTML
// Output to src/data/posts.json
```

### 3. Pages Read from JSON

The blog index and individual post pages simply import the JSON file:

```typescript
import posts from './src/data/posts.json';

// Render posts
```

## Why This Approach?

**Advantages:**
- ✅ No runtime dependencies (everything is static)
- ✅ Fast builds (just parsing markdown)
- ✅ Version controlled (posts are in git)
- ✅ Portable (markdown works everywhere)
- ✅ Future-proof (no framework lock-in)

**Trade-offs:**
- ❌ No dynamic features (comments, likes, etc.)
- ❌ Need to rebuild to publish
- ❌ All posts loaded at once (fine for small blogs)

For my use case—occasional technical posts with no dynamic features—this is perfect.

## SEO Considerations

Since this is a static site, I used:

- **Query parameters** for post URLs (`/post.html?slug=my-post`)
- **Vercel rewrites** for clean URLs (`/blog/my-post`)
- **Dynamic meta tags** set via JavaScript after page load

Not perfect for SEO, but good enough for a personal blog.

## Next Steps

I'm planning to add:

- RSS feed generation
- Newsletter integration with Resend
- Sitemap generation
- Code syntax highlighting

All of these can be done at build time, keeping the runtime completely static.

## Conclusion

You don't need a framework to build a blog. Sometimes the simplest solution—markdown files and a build script—is all you need.

The code for this blog system is [on GitHub](https://github.com/adusingi/adusingi-web). Feel free to use it as a starting point for your own minimal blog.

---

*Have questions about this setup? [Reach out](/contact.html) and let's chat.*
