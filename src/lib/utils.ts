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
