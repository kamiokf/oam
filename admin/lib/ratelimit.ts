import { Ratelimit } from '@upstash/ratelimit';
import { redis, hasRedisConfig } from './redis';

// Cache for rate limiter instances to avoid recreation
const limiters = new Map<string, Ratelimit>();

export type RateLimitTier = 'auth' | 'public' | 'standard' | 'heavy';

/**
 * Returns a configured rate limiter based on the requested tier.
 * Caches the instances in memory.
 */
function getLimiter(tier: RateLimitTier): Ratelimit {
    if (limiters.has(tier)) {
        return limiters.get(tier)!;
    }

    let config: { maxRequests: number; windowString: string };

    switch (tier) {
        case 'auth':
            // 5 requests per 5 minutes
            config = { maxRequests: 5, windowString: '5 m' };
            break;
        case 'public':
            // 100 requests per 1 minute
            config = { maxRequests: 100, windowString: '1 m' };
            break;
        case 'heavy':
            // 10 requests per 1 minute
            config = { maxRequests: 10, windowString: '1 m' };
            break;
        case 'standard':
        default:
            // 300 requests per 1 minute
            config = { maxRequests: 300, windowString: '1 m' };
            break;
    }

    const limiter = new Ratelimit({
        redis,
        // @ts-expect-error Upstash type mismatch internally for duration string
        limiter: Ratelimit.slidingWindow(config.maxRequests, config.windowString),
        analytics: true,
        /**
         * Optional prefix for the keys used in redis. This is useful if you want to share a redis
         * instance with other applications and want to avoid key collisions. The default prefix is
         * @upstash/ratelimit
         */
        prefix: '@upstash/ratelimit:oam',
    });

    limiters.set(tier, limiter);
    return limiter;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    reason?: string;
}

/**
 * Main utility to check rate limits.
 * Gracefully allows the request if Redis is not configured (e.g., local dev).
 */
export async function checkRateLimit(
    identifier: string,
    tier: RateLimitTier = 'standard'
): Promise<RateLimitResult> {
    // Graceful fallback for local dev where Upstash isn't configured
    if (!hasRedisConfig) {
        console.warn('⚠️ Upstash Redis not configured. Rate limiting is currently bypassed.');
        return {
            success: true,
            limit: 9999,
            remaining: 9999,
            reset: 0,
        };
    }

    try {
        const limiter = getLimiter(tier);
        const result = await limiter.limit(identifier);

        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } catch (error) {
        console.error('Rate Limiting Error:', error);
        // Fail open in case of Redis outage to prioritize availability
        return {
            success: true,
            limit: 9999,
            remaining: 9999,
            reset: 0,
            reason: 'Limiter error fallback',
        };
    }
}
