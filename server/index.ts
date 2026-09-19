// Optional self-host server for any Docker host. Production runs on Vercel; see docs/DEPLOYMENT.md.
// Serves the static Vite build from dist/ with the same clean-URL rewrites
// as vercel.json, and exposes the newsletter API at /api/subscribe.
import express from 'express';
import { resolve } from 'path';
import { existsSync } from 'fs';
import subscribeHandler from '../api/subscribe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
const distDir = resolve(import.meta.dirname, '../dist');
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Newsletter subscription (reuses the Vercel handler — its req/res usage is
// express-compatible: method, headers, socket, body / setHeader, status, json)
app.post('/api/subscribe', (req, res) => {
  void subscribeHandler(req as unknown as VercelRequest, res as unknown as VercelResponse);
});
app.options('/api/subscribe', (req, res) => {
  void subscribeHandler(req as unknown as VercelRequest, res as unknown as VercelResponse);
});

// Health check for the container host
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// Clean URL rewrites (mirrors vercel.json)
app.get('/contact', (_req, res) => res.sendFile(resolve(distDir, 'contact.html')));
app.get('/ai-1on1', (_req, res) => res.sendFile(resolve(distDir, 'ai-1on1.html')));
app.get('/photography', (_req, res) => res.sendFile(resolve(distDir, 'photography.html')));
app.get('/blog', (_req, res) => res.sendFile(resolve(distDir, 'blog.html')));
// Prefer the page build-seo.ts generated for this post — it carries the post's
// own title, description and canonical URL. Vercel resolves this the same way:
// a real file at /blog/<slug> wins over the rewrite in vercel.json.
app.get('/blog/:slug', (req, res) => {
  const slug = req.params.slug;
  const generated = resolve(distDir, 'blog', slug, 'index.html');
  const safe = /^[a-z0-9-]+$/i.test(slug) && existsSync(generated);
  res.sendFile(safe ? generated : resolve(distDir, 'post.html'));
});

// Static assets
app.use(express.static(distDir, { extensions: ['html'] }));

// 404 fallback
app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`adusingi-web listening on port ${port}`);
});
