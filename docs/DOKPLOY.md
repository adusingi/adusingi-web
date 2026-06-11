# Deploying to Dokploy

The site ships as a single Docker container: a multi-stage build that compiles
the Vite site and serves it with a small Express server ([server/index.ts](../server/index.ts)).
The server also provides:

- Clean URL rewrites (`/blog`, `/blog/:slug`, `/contact`, `/ai-1on1`) — the same
  rules that lived in `vercel.json`
- The newsletter API at `POST /api/subscribe` (reuses [api/subscribe.ts](../api/subscribe.ts))
- A health check at `GET /health`

## Steps

1. **Create the application**
   - In Dokploy: *Create Application* → *Git provider* → select this repository
     and the branch you deploy from (e.g. `main`).
   - Build type: **Dockerfile** (it's at the repo root).

2. **Port**
   - The container listens on **3000** (override with the `PORT` env var).
   - Set the application port / port mapping in Dokploy to `3000`.

3. **Environment variables** (Application → Environment)
   - `RESEND_API_KEY` — required for the newsletter subscribe endpoint.
   - `ALLOWED_ORIGIN` — optional, CORS origin for `/api/subscribe`
     (e.g. `https://www.adusingi.com`). Defaults to `*`.

4. **Domain**
   - Add your domain (e.g. `www.adusingi.com`) in the Domains tab, port `3000`,
     and enable HTTPS (Let's Encrypt).

5. **Health check** (optional but recommended)
   - The image declares a Docker `HEALTHCHECK` against `/health`. You can also
     configure Dokploy's health check path to `/health`.

6. **Deploy**
   - Trigger a deploy. Subsequent pushes to the configured branch can be
     auto-deployed via Dokploy's GitHub webhook.

## Local verification

```bash
pnpm install
pnpm build          # builds posts + TypeScript + Vite into dist/
pnpm start          # serves dist/ + API on http://localhost:3000
```

Or with Docker:

```bash
docker build -t adusingi-web .
docker run -p 3000:3000 -e RESEND_API_KEY=... adusingi-web
```

## Notes

- `vercel.json` is kept for reference/fallback but is not used by Dokploy.
- The newsletter sending scripts (`pnpm newsletter:send`) are unrelated to the
  container; they run locally as before.
