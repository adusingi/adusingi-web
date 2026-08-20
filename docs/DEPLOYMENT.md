# Deployment

The site runs on **Vercel**, deployed from GitHub.

## Live setup

| Item | Value |
| --- | --- |
| Host | Vercel |
| Repository | `github.com/adusingi/adusingi-web` |
| Production domain | `www.adusingi.com` |
| Apex domain | `adusingi.com` → 307 redirect to `www` |
| DNS + registrar | OVH (`ns16.ovh.net`, `dns16.ovh.net`) |
| Email (MX) | OVH mail — unrelated to the site host |

`www` is a CNAME to Vercel's DNS target. The apex uses Vercel's `76.76.21.21`
A record and redirects to `www`.

## How it deploys

1. Push to the deploy branch on GitHub.
2. Vercel builds with `pnpm build` (`build:posts` → `tsc` → `vite build`).
3. Static output in `dist/` is served from Vercel's CDN.
4. `api/subscribe.ts` is deployed automatically as a Vercel Serverless
   Function at `POST /api/subscribe`.

[vercel.json](../vercel.json) holds the build settings and the clean URL
rewrites (`/contact`, `/photography`, `/blog`, `/blog/:slug`).

## Environment variables

Set these in the Vercel project settings (Settings → Environment Variables):

- `RESEND_API_KEY` — required by the newsletter subscribe endpoint.
- `ALLOWED_ORIGIN` — optional CORS origin for `/api/subscribe`
  (e.g. `https://www.adusingi.com`). Defaults to `*`.

The newsletter sending scripts (`pnpm newsletter:send`) run locally. They are
not part of the deployment.

## Local verification

```bash
pnpm install
pnpm build          # builds posts + TypeScript + Vite into dist/
pnpm preview        # serves the built site
pnpm dev:api        # `vercel dev` — runs the site plus the serverless function
```

## Unused container path

The repository also contains a Docker image ([Dockerfile](../Dockerfile)) and a
small Express server ([server/index.ts](../server/index.ts)) that serves `dist/`,
applies the same URL rewrites, reuses the `api/subscribe.ts` handler, and adds a
health check at `/health`.

**Production does not use this path.** It is kept as a self-host option. You can
run it locally:

```bash
pnpm build
pnpm start          # http://localhost:3000
```

To confirm which path serves production, request `/health`. Vercel returns 404
because that route exists only in the Express server.
