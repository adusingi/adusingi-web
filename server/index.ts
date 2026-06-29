// Production server for Dokploy (or any Docker host).
// Serves the static Vite build from dist/ with the same clean-URL rewrites
// as vercel.json, and exposes the newsletter API at /api/subscribe.
import express from 'express';
import { resolve } from 'path';
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

// Health check for Dokploy
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// Clean URL rewrites (mirrors vercel.json)
app.get('/contact', (_req, res) => res.sendFile(resolve(distDir, 'contact.html')));
app.get('/ai-1on1', (_req, res) => res.sendFile(resolve(distDir, 'ai-1on1.html')));
app.get('/photography', (_req, res) => res.sendFile(resolve(distDir, 'photography.html')));
app.get('/blog', (_req, res) => res.sendFile(resolve(distDir, 'blog.html')));
app.get('/blog/:slug', (_req, res) => res.sendFile(resolve(distDir, 'post.html')));

// Static assets
app.use(express.static(distDir, { extensions: ['html'] }));

// 404 fallback
app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`adusingi-web listening on port ${port}`);
});
