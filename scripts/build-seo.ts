// Static SEO output: one real HTML file per post, plus a sitemap and robots.txt.
//
// WHY THIS EXISTS
// post.tsx sets the title and the Open Graph tags in the browser, after the
// bundle loads. A person never notices. The robots that build link previews —
// X, LinkedIn, Slack — fetch the HTML and never run JavaScript, so every post
// shared anywhere advertised "Blog | Aimable Dusingizimana" and the URL of the
// blog index. This script bakes the same values into the file that is served,
// so both readers of a page see the same thing.
//
// It runs after `vite build`, against dist/, because the built post.html
// already carries the hashed asset paths. The files it writes sit at
// dist/blog/<slug>/index.html, which Vercel serves ahead of the
// /blog/:slug → /post.html rewrite in vercel.json. The rewrite stays as the
// fallback for anything this script has not generated.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export const SITE = 'https://www.adusingi.com';

/** Static pages that belong in the sitemap, as the site advertises them. */
export const STATIC_PAGES = ['/', '/blog', '/photography', '/ai-1on1', '/contact'];

export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    description: string;
}

/** Escape a value going inside an HTML attribute. */
export function escapeAttr(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Escape a value going inside element text, such as <title>. */
export function escapeText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Replace one tag, and fail loudly when it is not there.
 *
 * A silent no-op is exactly how the previous bug survived: everything kept
 * working, and only a robot could see what was wrong. If post.html is
 * restructured, the build stops here rather than shipping stale tags.
 */
function replaceOrThrow(html: string, pattern: RegExp, replacement: string, what: string): string {
    if (!pattern.test(html)) {
        throw new Error(`build-seo: post.html no longer contains ${what}. Update scripts/build-seo.ts.`);
    }
    return html.replace(pattern, replacement);
}

/** The served HTML for one post: the built template with this post's metadata in it. */
export function postPageHtml(template: string, post: PostMeta): string {
    const url = `${SITE}/blog/${post.slug}`;
    const title = `${post.title} | Aimable Dusingizimana`;
    const published = post.date.slice(0, 10);

    let html = template;
    html = replaceOrThrow(html, /<title id="page-title">[\s\S]*?<\/title>/,
        `<title id="page-title">${escapeText(title)}</title>`, 'the page title');
    html = replaceOrThrow(html, /<meta name="description" id="page-description"[\s\S]*?>/,
        `<meta name="description" id="page-description" content="${escapeAttr(post.description)}">`, 'the description');
    html = replaceOrThrow(html, /<meta property="og:url" id="og-url"[\s\S]*?>/,
        `<meta property="og:url" id="og-url" content="${url}">`, 'og:url');
    html = replaceOrThrow(html, /<meta property="og:title" id="og-title"[\s\S]*?>/,
        `<meta property="og:title" id="og-title" content="${escapeAttr(post.title)}">`, 'og:title');
    html = replaceOrThrow(html, /<meta property="og:description" id="og-description"[\s\S]*?>/,
        `<meta property="og:description" id="og-description" content="${escapeAttr(post.description)}">`, 'og:description');
    html = replaceOrThrow(html, /<meta name="twitter:title" id="twitter-title"[\s\S]*?>/,
        `<meta name="twitter:title" id="twitter-title" content="${escapeAttr(post.title)}">`, 'twitter:title');
    html = replaceOrThrow(html, /<meta name="twitter:description" id="twitter-description"[\s\S]*?>/,
        `<meta name="twitter:description" id="twitter-description" content="${escapeAttr(post.description)}">`, 'twitter:description');

    // The canonical tag is the one a search engine believes. og:url is for
    // preview cards and carries no weight here.
    return replaceOrThrow(html, /<\/head>/,
        `  <link rel="canonical" href="${url}">\n` +
        `  <meta property="article:published_time" content="${published}">\n</head>`,
        'a </head> tag');
}

/** The sitemap, in the clean URLs the site advertises. */
export function sitemapXml(posts: PostMeta[], today: string): string {
    const urls = [
        ...STATIC_PAGES.map((path) => ({ loc: `${SITE}${path === '/' ? '' : path}`, lastmod: today })),
        ...posts.map((post) => ({ loc: `${SITE}/blog/${post.slug}`, lastmod: post.date.slice(0, 10) })),
    ];

    const body = urls
        .map(({ loc, lastmod }) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function robotsTxt(): string {
    return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
}

/** Build everything. Only runs when this file is executed, not when it is imported by a test. */
function main(): void {
    const root = resolve(import.meta.dirname, '..');
    const dist = resolve(root, 'dist');
    const template = readFileSync(resolve(dist, 'post.html'), 'utf-8');
    const posts = JSON.parse(readFileSync(resolve(root, 'public/data/posts-all.json'), 'utf-8')) as PostMeta[];

    for (const post of posts) {
        const dir = resolve(dist, 'blog', post.slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), postPageHtml(template, post));
    }

    const today = new Date().toISOString().slice(0, 10);
    writeFileSync(resolve(dist, 'sitemap.xml'), sitemapXml(posts, today));
    writeFileSync(resolve(dist, 'robots.txt'), robotsTxt());

    console.log(`✅ SEO build complete`);
    console.log(`   - ${posts.length} post pages with their own title, description and canonical URL`);
    console.log(`   - sitemap.xml with ${posts.length + STATIC_PAGES.length} URLs`);
    console.log(`   - robots.txt pointing at the sitemap`);
}

if (existsSync(resolve(import.meta.dirname, '..', 'dist', 'post.html')) && process.argv[1]?.includes('build-seo')) {
    main();
}
