import { Redis } from '@upstash/redis';

// Only initialize the true Redis client if the URL and Token are present
const hasRedisConfig = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Global Redis Client (Upstash)
 * In a Next.js environment (especially dev), we want to avoid creating multiple instances.
 * If ENV vars are missing, we expose a mock client to prevent the app from breaking during local UI dev.
 */
export const redis = hasRedisConfig
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : // Mocking the Redis client to gracefully fail open if not configured
    ({
        get: async () => null,
        set: async () => 'OK',
        // Rate limiter relies on script loading and eval, which we won't fully mock.
        // The ratelimiter wrapper will check `hasRedisConfig` to bypass the actual call.
    } as unknown as Redis);

export { hasRedisConfig };
