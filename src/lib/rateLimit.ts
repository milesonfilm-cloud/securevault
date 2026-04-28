import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type RateLimitRoute = 'ai-scan' | 'ai-health' | 'share' | 'emergency' | 'digilocker';

const inMemoryStore = new Map<string, { count: number; reset: number }>();

function inMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = inMemoryStore.get(key);
  if (!entry || now > entry.reset) {
    inMemoryStore.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function checkRateLimit(
  request: Request,
  route: RateLimitRoute
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const limits: Record<RateLimitRoute, { max: number; windowMs: number }> = {
    'ai-scan': { max: 20, windowMs: 60_000 },
    'ai-health': { max: 10, windowMs: 60_000 },
    share: { max: 30, windowMs: 60_000 },
    emergency: { max: 10, windowMs: 60_000 },
    digilocker: { max: 15, windowMs: 60_000 },
  };

  const { max, windowMs } = limits[route];
  const key = `rl:${route}:${ip}`;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = Redis.fromEnv();
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${windowMs / 1000} s`),
        prefix: 'securevault',
      });
      const { success, reset } = await ratelimit.limit(key);
      return {
        allowed: success,
        retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
      };
    } catch {
      /* fall through */
    }
  }

  const allowed = inMemoryRateLimit(key, max, windowMs);
  return { allowed };
}
