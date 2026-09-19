---
name: addblog
description: Adapt a published LinkedIn post into a post on the adusingi.com blog, then draft the tweet that points at it. Use when given a LinkedIn post URL to put on the blog, or asked to republish a LinkedIn post here.
---

# Add a LinkedIn post to the blog

Input: a LinkedIn post URL, sometimes with the post text pasted beside it.
Output: the post live on `www.adusingi.com/blog` after the owner approves the deploy,
and a tweet drafted for him to copy into `x.com/adusingi`.

## 0. Work in the site repo

This skill is reachable from any directory, but every command below runs in the
`adusingi-web` repo and nowhere else:

```bash
cd ~/Documents/Code/p/adusingi-web
```

The post being adapted usually lives in another repo — a LinkedIn draft in
`mobayilo-business/marketing/posts/` is the common case. Read it there, then come back
here to write. Never write blog files into the repo you were called from.

## 1. Get the text

WebFetch the URL. LinkedIn serves an auth wall to non-browsers, so the fetch comes back with navigation chrome and no post body.

When the text is pasted in the request, use that. When the post was drafted in
`mobayilo-business/marketing/posts/`, that file holds the published text verbatim — read
it from there. Otherwise ask for it and wait: a LinkedIn post cannot be reconstructed
from its URL slug.

Adapt only what is already **published**. A draft has no URL, no date, and no resolved
links, so there is nothing to adapt yet.

## 2. Read the newest post first

```bash
ls posts/ | tail -3
```

Read the newest one in full. It carries the house style: the frontmatter fields, `##` section headings, `👉 [label](url)` for a call to action, and the closing line

```
*Originally published on LinkedIn, and adapted for this blog.*
```

Keep the author's sentences exactly as written — short, plain, one idea each. Adapt the structure only: LinkedIn's ALL-CAPS section headers become `##` headings, and its trailing hashtags become frontmatter `tags`.

## 3. Date the post

The publication date hides in the activity id in the URL (`...-activity-7496545657369894912-VJ9f`):

```bash
python3 -c "
import datetime, sys
ms = int(sys.argv[1]) >> 22
print(datetime.datetime.fromtimestamp(ms/1000, datetime.timezone.utc).strftime('%Y-%m-%d'))
" 7496545657369894912
```

The calendar date is right; the clock time it prints runs ahead of the real one, so take the date alone. Name the file `posts/YYYY-MM-DD-slug.md` — the build strips the date prefix to make the slug.

## 4. Resolve every link

`lnkd.in` short links answer with an interstitial page rather than a redirect, so `curl -L` stays on the short URL. The target sits in the page body:

```bash
curl -s "https://lnkd.in/XXXXXXX" | grep -oE 'https?://[^"<>\ ]+' | grep -viE "lnkd\.in|linkedin\.com|licdn" | head -3
```

Put the resolved target in the post so readers do not bounce through LinkedIn. Then turn the ones pointing back at this site into internal paths: `https://adusingi.com/photography.html` becomes `/photography`, and an earlier post becomes `/blog/<slug>`.

## 5. Series posts link both ways

When the post looks back at an earlier one ("the first one", "this is the second post"), link to that post by slug, and add the forward link to the earlier post's file in the same change.

Leave future posts unnamed. Each post follows what is worth writing at the time, so a teaser like "next in the series: X" turns into a debt the next post has to pay. Say what this post is; stop there.

## 6. Build and check

```bash
pnpm build:posts     # writes public/data/ — the only place the site reads from
pnpm test:run
pnpm build           # preview serves dist/, so build before previewing
pnpm start           # express, port 3000 — it routes /blog/:slug like production
```

**Hand over `http://localhost:3000/blog/<slug>`, and use `pnpm start` to serve it.**
`pnpm preview` is vite serving `dist/` with no rewrite rules, so under it
`/blog/<slug>` quietly falls back to the home page and only
`/post.html?slug=<slug>` shows the post. The production routes live in
`vercel.json` (`/blog/:slug` → `/post.html`), and `server/index.ts` is the one
local server that reproduces them. Sending the owner a `post.html?slug=` link
makes him check a URL the site will never use.

Read the generated `public/data/posts/<slug>.json` and confirm the headings and every `href` came out right, and that the post sits first in `public/data/posts.json`.

## 7. Deploy

Commit on a `content/<slug>` branch cut from `development`. Then hand over the preview URL and ask for approval — CLAUDE.md requires explicit consent before any deploy.

On approval: merge into `development`, merge `development` into `main`, push both. Vercel builds from `main` and takes under a minute.

Confirming it landed needs the data, not the page. `/blog/<slug>` is a single-page app
shell that answers **200 for any slug**, including one that does not exist, so a status
code proves nothing. Poll the post list until the new slug is first:

```bash
curl -s "https://www.adusingi.com/data/posts.json?cb=$RANDOM" |
  python3 -c "import sys,json; d=json.load(sys.stdin); p=d['posts'] if isinstance(d,dict) else d; print(p[0]['slug'])"
```

The cache-buster matters — without it the CDN can serve the pre-deploy list for minutes.
Then read the post's own JSON and confirm the title, date, tags and every `href`:

```bash
curl -s "https://www.adusingi.com/data/posts/<slug>.json"
```

## 8. Draft the tweet

Only now, because the tweet carries a URL and step 7 is what proves that URL resolves to
the post. Write one tweet for `x.com/adusingi`, print it in the terminal as a copy-paste
block, and stop. **Never post it** — there is no X integration here, and the owner posts
it himself.

A tweet is a different shape, not a shorter LinkedIn post. Do not truncate the article.
Take the single sharpest concrete thing in it — a number, a contradiction, a quoted line
— and let the link card carry everything else.

- **One tweet, not a thread**, unless the owner asks for a thread.
- **Budget about 255 characters of text.** X counts every link as 23 characters whatever
  its length, so 280 − 23 − a newline leaves roughly 255. Print the count beside the
  draft. If the account has Premium the cap is far higher, but a tweet that fits 280
  travels further — keep the budget anyway.
- **The link goes last, on its own line**, as the canonical
  `https://www.adusingi.com/blog/<slug>`, using the slug verified in step 7 and not the
  one you expected to build.
- **Do not repeat the title.** X renders a preview card carrying the title and
  description already, so a tweet that restates them wastes its only screen.
- **At most one hashtag, and only for a real community.** A pile of them reads as spam on
  X, unlike LinkedIn where the post's four are normal.
- **Keep the author's sentences.** Same rule as the blog: adapt the structure, never the
  voice.

Print it in this shape:

```
─── tweet for x.com/adusingi ───
<the text>

https://www.adusingi.com/blog/<slug>
─── 231 characters ───
```

The count is your arithmetic, so treat it as approximate: X's composer shows the true
one, and it is the number that decides. Say so when you hand the draft over.

For a thread, make each tweet a complete thought, put the link in the last one only, and
do not number them — X already shows them as a chain.

## 9. Clean up

Ask whether to delete the branch.
