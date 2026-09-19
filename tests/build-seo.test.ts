import { describe, it, expect } from 'vitest'
import { postPageHtml, sitemapXml, robotsTxt, escapeAttr, SITE, STATIC_PAGES } from '../scripts/build-seo'

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <title id="page-title">Blog Post | Aimable Dusingizimana</title>
  <meta name="description" id="page-description"
    content="Read blog posts about tech, Japan, and building digital products.">
  <meta property="og:url" id="og-url" content="https://www.adusingi.com/blog">
  <meta property="og:title" id="og-title" content="Blog | Aimable Dusingizimana">
  <meta property="og:description" id="og-description"
    content="Read blog posts about tech, Japan, and building digital products.">
  <meta name="twitter:title" id="twitter-title" content="Blog | Aimable Dusingizimana">
  <meta name="twitter:description" id="twitter-description"
    content="Read blog posts about tech, Japan, and building digital products.">
</head>
<body></body>
</html>`

const POST = {
    slug: 'what-time-is-it-where-you-are',
    title: 'What Time Is It Where You Are?',
    date: '2026-09-18T00:00:00.000Z',
    description: 'A clock app built in half an afternoon taught me the rule the serious version needed.',
}

describe('postPageHtml', () => {
    const html = postPageHtml(TEMPLATE, POST)

    it('gives the page its own title', () => {
        expect(html).toContain('<title id="page-title">What Time Is It Where You Are? | Aimable Dusingizimana</title>')
    })

    it('names the post in the tags a preview bot reads without running JavaScript', () => {
        expect(html).toContain('content="What Time Is It Where You Are?">')
        expect(html).toContain(`content="${SITE}/blog/${POST.slug}">`)
        expect(html).not.toContain('content="Blog | Aimable Dusingizimana"')
    })

    it('declares the canonical URL, which og:url does not do', () => {
        expect(html).toContain(`<link rel="canonical" href="${SITE}/blog/${POST.slug}">`)
    })

    it('carries the publication date', () => {
        expect(html).toContain('<meta property="article:published_time" content="2026-09-18">')
    })

    it('escapes a quote in a title instead of breaking the attribute', () => {
        const quoted = postPageHtml(TEMPLATE, { ...POST, title: 'He said "no"' })
        expect(quoted).toContain('content="He said &quot;no&quot;">')
    })

    it('fails loudly when the template no longer has a tag it must set', () => {
        expect(() => postPageHtml(TEMPLATE.replace(/<meta property="og:url"[^>]*>/, ''), POST))
            .toThrow(/og:url/)
    })
})

describe('sitemapXml', () => {
    const xml = sitemapXml([POST], '2026-09-19')

    it('lists the post under the URL the site advertises', () => {
        expect(xml).toContain(`<loc>${SITE}/blog/${POST.slug}</loc>`)
        expect(xml).not.toContain('post.html')
        expect(xml).not.toContain('?slug=')
    })

    it('lists every static page', () => {
        for (const page of STATIC_PAGES) {
            expect(xml).toContain(`<loc>${SITE}${page === '/' ? '' : page}</loc>`)
        }
    })

    it("dates each post by its own date, not by today's", () => {
        expect(xml).toContain('<lastmod>2026-09-18</lastmod>')
    })
})

describe('robotsTxt', () => {
    it('points crawlers at the sitemap', () => {
        expect(robotsTxt()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
    })
})

describe('escapeAttr', () => {
    it('escapes the characters that would end an attribute', () => {
        expect(escapeAttr('a & b < c > d " e')).toBe('a &amp; b &lt; c &gt; d &quot; e')
    })
})
