const rateLimitStore = new Map();

export function rateLimit(
  key,
  limit = 10,
  windowMs = 60 * 1000
) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (now >= existing.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;

  return {
    success: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
  };
}

// RESET LIMITER
export function resetRateLimit(key) {
  return rateLimitStore.delete(key);
}