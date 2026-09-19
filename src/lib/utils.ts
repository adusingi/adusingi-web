/**
 * Format a date string into "Month Day, Year".
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Validate email format using regex.
 */
export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * The canonical URL of a post.
 *
 * The site advertises `/blog/<slug>` everywhere that matters — `og:url`, the
 * newsletter, links written inside posts — and `vercel.json` rewrites it to
 * post.html in production, as `server/index.ts` does locally. Linking post.html
 * directly still renders the post, which is why it went unnoticed from December
 * 2025 until September 2026: every reader simply landed on a URL the site never
 * claims as its own.
 *
 * So the URL is built in one place, and `getSlugFromUrl` below reads back what
 * this writes.
 */
export function postHref(slug: string): string {
    return `/blog/${encodeURIComponent(slug)}`;
}

/**
 * Extract 'slug' query parameter from URL or path.
 */
export function getSlugFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    // 1. Check query param (?slug=...)
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('slug');
    if (querySlug) return querySlug;

    // 2. Check path (/blog/slug)
    const path = window.location.pathname;
    const match = path.match(/\/blog\/([^/]+)/);
    return match ? match[1] : null;
}
