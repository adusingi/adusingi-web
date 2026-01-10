import { describe, it, expect } from 'vitest';
import { formatDate, isValidEmail } from '../src/lib/utils'; // Import directly from source

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
    });

    describe('isValidEmail', () => {
        it('validates correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.jp')).toBe(true);
        });

        it('rejects invalid emails', () => {
            expect(isValidEmail('test')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('test@domain')).toBe(false); // Regex might be loose, let's check implementation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ handles at least one dot
            expect(isValidEmail('@domain.com')).toBe(false);
        });
    });
});
