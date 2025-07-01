const rateLimits: Record<string, { count: number; last: number }> = {};

export function rateLimit(ip: string, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const id = `${ip}:${key}`;
  if (!rateLimits[id] || now - rateLimits[id].last > windowMs) {
    rateLimits[id] = { count: 1, last: now };
    return false;
  }
  rateLimits[id].count++;
  rateLimits[id].last = now;
  if (rateLimits[id].count > max) return true;
  return false;
}
