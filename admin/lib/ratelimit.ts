// Simple in-memory rate limiter — no external dependencies required.
// Note: resets on cold start (acceptable for a low-traffic admin panel).

interface Window {
    count: number;
    resetAt: number;
}

const store = new Map<string, Window>();

export type RateLimitTier = 'auth' | 'public' | 'standard' | 'heavy';

const TIERS: Record<RateLimitTier, { max: number; windowMs: number }> = {
    auth:     { max: 5,   windowMs: 5 * 60 * 1000 },  // 5 per 5 min
    heavy:    { max: 10,  windowMs: 60 * 1000 },       // 10 per min
    public:   { max: 100, windowMs: 60 * 1000 },       // 100 per min
    standard: { max: 300, windowMs: 60 * 1000 },       // 300 per min
};

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export function checkRateLimit(identifier: string, tier: RateLimitTier = 'standard'): RateLimitResult {
    const { max, windowMs } = TIERS[tier];
    const now = Date.now();
    const key = `${tier}:${identifier}`;

    let window = store.get(key);

    if (!window || now >= window.resetAt) {
        window = { count: 0, resetAt: now + windowMs };
        store.set(key, window);
    }

    window.count++;

    return {
        success: window.count <= max,
        limit: max,
        remaining: Math.max(0, max - window.count),
        reset: window.resetAt,
    };
}
