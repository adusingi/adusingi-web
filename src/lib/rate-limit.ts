import { Redis } from '@upstash/redis';

// Create Redis instance strictly from env vars
// If vars are missing, or initialization fails, redis will be null
let redis: Redis | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (error) {
    console.warn('Failed to initialize Redis:', error);
    redis = null;
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check if the request should be rate limited.
 * 
 * @param identifier Unique identifier for the user (e.g. IP address)
 * @param limit Max requests allowed
 * @param durationInSeconds Time window in seconds
 * @returns RateLimitResult
 */
export async function checkRateLimit(
    identifier: string,
    limit: number = 5,
    durationInSeconds: number = 3600
): Promise<RateLimitResult> {
    // 1. Fallback: If Redis is not configured, allow everything (or implement in-memory Map if preferred, 
    // but in-memory is unreliable on serverless).
    // We chose "fail open" to avoid breaking the site if config is missing.
    if (!redis) {
        console.warn('⚠️ Rate Limiting disabled: Missing Upstash Redis credentials.');
        return {
            success: true,
            limit,
            remaining: limit,
            reset: Date.now() + durationInSeconds * 1000,
        };
    }

    const key = `rate_limit:${identifier}`;

    try {
        // 2. Increment counter
        const requests = await redis.incr(key);

        // 3. Set expiration if it's the first request (or if key didn't exist)
        if (requests === 1) {
            await redis.expire(key, durationInSeconds);
        }

        // 4. Get time to live for headers
        const ttl = await redis.ttl(key);

        return {
            success: requests <= limit,
            limit,
            remaining: Math.max(0, limit - requests),
            reset: Date.now() + ttl * 1000,
        };
    } catch (error) {
        console.error('Redis error:', error);
        // Fail open if Redis is down
        return {
            success: true,
            limit,
            remaining: limit,
            reset: Date.now() + durationInSeconds * 1000,
        };
    }
}
