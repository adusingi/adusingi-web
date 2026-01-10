# Blog Post Workflow Guide

How to write, publish, and send blog posts as newsletters.

---

## 1. Write a New Post

Create a markdown file in the `posts/` directory:

```
posts/YYYY-MM-DD-your-post-slug.md
```

Example: `posts/2025-12-15-my-new-post.md`

### Post Template

```markdown
---
title: "Your Post Title"
date: 2025-12-15
description: "Brief description for SEO and previews"
tags: ["tech", "japan"]
draft: false
---

Your markdown content here...

## Headings work

- Lists work
- **Bold** and *italic* too

Code blocks:

```javascript
console.log('hello');
```
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `description` | Yes | Short summary for SEO |
| `tags` | Yes | Array of tags for filtering |
| `draft` | No | Set to `true` to hide from blog |

---

## 2. Build the Posts

Generate JSON from your markdown:

```bash
pnpm run build:posts
```

This updates `src/data/posts.json` with your new post.

---

## 3. Preview Locally

Start the dev server:

```bash
pnpm dev
```

Visit:
- http://localhost:5173/blog.html - all posts
- http://localhost:5173/post.html?slug=your-post-slug - your post

---

## 4. Deploy

Build and deploy to production:

```bash
pnpm build
vercel --prod
```

Or push to git if auto-deploy is configured.

---

## 5. Send Newsletter

After deploying, send the post to subscribers.

### Set Environment Variables

```bash
export RESEND_API_KEY="re_your_key"
export NEWSLETTER_TO="recipient@example.com"
```

Or add to `.env` file.

### Send the Newsletter

```bash
pnpm run newsletter:send <slug>
```

**Important:** Use the slug (filename without date and `.md`).

| Filename | Slug to use |
|----------|-------------|
| `2025-12-15-my-new-post.md` | `my-new-post` |
| `2024-01-10-hello-world.md` | `hello-world` |

Example:

```bash
pnpm run newsletter:send my-new-post
```

---

## Quick Reference

| Step | Command |
|------|---------|
| Build posts | `pnpm run build:posts` |
| Dev server | `pnpm dev` |
| Full build | `pnpm build` |
| Deploy | `vercel --prod` |
| Send newsletter | `pnpm run newsletter:send <slug>` |

---

## Troubleshooting

### Post not showing up
- Check `draft: false` in frontmatter
- Run `pnpm run build:posts` again
- Check filename format: `YYYY-MM-DD-slug.md`

### Newsletter send fails
- Verify `RESEND_API_KEY` is set
- Check the slug matches a post in `src/data/posts.json`
- Run `pnpm run build:posts` first

### Subscription form 404 in local dev
- Use `vercel dev` instead of `pnpm dev`
- Or test on deployed site
