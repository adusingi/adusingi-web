import { describe, it, expect, beforeEach } from 'vitest';
import { formatDate, isValidEmail, getSlugFromUrl, postHref } from '../src/lib/utils';

describe('Utils', () => {
    describe('formatDate', () => {
        it('formats date string correctly', () => {
            const date = '2025-01-01';
            expect(formatDate(date)).toBe('January 1, 2025');
        });

        it('handles different date formats', () => {
            const date = '2025/12/31';
            expect(formatDate(date)).toBe('December 31, 2025');
        });

        it('handles edge cases', () => {
            expect(() => formatDate('invalid-date')).not.toThrow();
        });
    });

    describe('isValidEmail', () => {
        it('validates correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.jp')).toBe(true);
            expect(isValidEmail('user+tag@example.org')).toBe(true);
        });

        it('rejects invalid emails', () => {
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail('test')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('test@domain')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user name@domain.com')).toBe(false);
        });

        it('handles edge cases', () => {
            expect(isValidEmail('a@b.c')).toBe(true);
        });
    });

    describe('getSlugFromUrl', () => {
        beforeEach(() => {
            // Reset window.location before each test
            Object.defineProperty(window, 'location', {
                value: {
                    search: '',
                    pathname: '/',
                    hash: '',
                },
                writable: true,
            });
        });

        it('should return null when window is undefined', () => {
            const originalWindow = global.window;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (global as any).window;
            
            const result = getSlugFromUrl();
            expect(result).toBeNull();
            
            global.window = originalWindow;
        });

        it('should extract slug from query parameter', () => {
            window.location.search = '?slug=my-post-slug';
            window.location.pathname = '/post.html';
            
            const result = getSlugFromUrl();
            expect(result).toBe('my-post-slug');
        });

        it('should extract slug from path', () => {
            window.location.search = '';
            window.location.pathname = '/blog/my-post-slug';
            
            const result = getSlugFromUrl();
            expect(result).toBe('my-post-slug');
        });

        it('should prioritize query parameter over path', () => {
            window.location.search = '?slug=query-slug';
            window.location.pathname = '/blog/path-slug';
            
            const result = getSlugFromUrl();
            expect(result).toBe('query-slug');
        });

        it('should return null when no slug found', () => {
            window.location.search = '';
            window.location.pathname = '/blog/';
            
            const result = getSlugFromUrl();
            expect(result).toBeNull();
        });
    });

    describe('postHref', () => {
        it('builds the URL the site advertises, not the page that serves it', () => {
            expect(postHref('what-time-is-it-where-you-are')).toBe('/blog/what-time-is-it-where-you-are');
        });

        it('never links post.html directly', () => {
            // The blog list linked /post.html?slug=... from December 2025 to
            // September 2026. It rendered correctly, so nothing failed — every
            // reader just arrived on a URL og:url and the newsletter disagree with.
            expect(postHref('any-slug')).not.toContain('post.html');
        });

        it('round-trips: what postHref writes, getSlugFromUrl reads back', () => {
            const slug = 'i-forgot-a-meeting';
            window.location.search = '';
            window.location.pathname = postHref(slug);

            expect(getSlugFromUrl()).toBe(slug);
        });
    });
});
