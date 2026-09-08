import { NextRequest } from 'next/server';
import argon2 from 'argon2';
import { apiKeyRepository } from '@platform/db';

export interface McpAuthContext {
  apiKeyId: string;
  tier: 'free' | 'pro' | 'enterprise';
  rateLimit: { requests: number; windowMs: number };
}

export class McpAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'McpAuthError';
  }
}

const TIER_LIMITS: Record<McpAuthContext['tier'], { requests: number; windowMs: number }> = {
  free: { requests: 30, windowMs: 60000 },
  pro: { requests: 120, windowMs: 60000 },
  enterprise: { requests: 600, windowMs: 60000 },
};

// In-memory rate limiting (sliding window per API key)
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(apiKeyId: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  const timestamps = rateLimitStore.get(apiKeyId) ?? [];
  const recentRequests = timestamps.filter(ts => ts > windowStart);
  
  if (recentRequests.length >= limit.requests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(apiKeyId, recentRequests);
  return true;
}

function getRateLimitHeaders(apiKeyId: string, limit: { requests: number; windowMs: number }): Record<string, string> {
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  const timestamps = rateLimitStore.get(apiKeyId) ?? [];
  const recentRequests = timestamps.filter(ts => ts > windowStart);
  const remaining = Math.max(0, limit.requests - recentRequests.length);
  const resetMs = recentRequests.length > 0 ? recentRequests[0] + limit.windowMs - now : 0;
  
  return {
    'X-RateLimit-Limit': limit.requests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetMs / 1000).toString(),
  };
}

export async function validateMcpApiKey(req: NextRequest): Promise<McpAuthContext> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new McpAuthError('MISSING_API_KEY', 'Authorization header with Bearer token required', 401);
  }

  const apiKey = authHeader.slice(7);
  if (apiKey.length < 16) {
    throw new McpAuthError('INVALID_API_KEY', 'Invalid API key format', 401);
  }

  // Key format: prefix_hash (prefix is first 8 chars)
  const prefix = apiKey.slice(0, 8);
  const providedHash = apiKey.slice(9); // skip the underscore separator

  const record = await apiKeyRepository.findByPrefix(prefix);
  if (!record) {
    throw new McpAuthError('INVALID_API_KEY', 'Invalid API key', 401);
  }

  if (!record.isActive) {
    throw new McpAuthError('API_KEY_DISABLED', 'API key has been disabled', 401);
  }

  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    throw new McpAuthError('API_KEY_EXPIRED', 'API key has expired', 401);
  }

  // Verify hash using argon2
  const isValid = await argon2.verify(record.keyHash, providedHash);
  if (!isValid) {
    throw new McpAuthError('INVALID_API_KEY', 'Invalid API key', 401);
  }

  // Update last used timestamp
  await apiKeyRepository.update(record.id, { lastUsedAt: new Date().toISOString() });

  const tier = record.tier;
  const limit = TIER_LIMITS[tier];
  
  // Check rate limit
  if (!checkRateLimit(record.id, limit)) {
    const headers = getRateLimitHeaders(record.id, limit);
    throw new McpAuthError('RATE_LIMITED', 'Rate limit exceeded', 429);
  }

  return {
    apiKeyId: record.id,
    tier,
    rateLimit: limit,
  };
}

export function getRateLimitHeadersForContext(context: McpAuthContext): Record<string, string> {
  return getRateLimitHeaders(context.apiKeyId, context.rateLimit);
}