import { NextRequest } from 'next/server';
import argon2 from 'argon2';
import { apiKeyRepository, oauthClientRepository } from '@platform/db';
import { verifyMcpJwtToken } from './oauthToken';

export interface McpAuthContext {
  apiKeyId: string;
  tier: 'free' | 'pro' | 'enterprise';
  rateLimit: { requests: number; windowMs: number };
}

export class McpAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public headers?: Record<string, string>
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

// In-memory rate limiting (sliding window per client/key)
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(id: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const windowStart = now - limit.windowMs;

  const timestamps = rateLimitStore.get(id) ?? [];
  const recentRequests = timestamps.filter((ts) => ts > windowStart);

  if (recentRequests.length >= limit.requests) {
    return false;
  }

  recentRequests.push(now);
  rateLimitStore.set(id, recentRequests);
  return true;
}

function getRateLimitHeaders(id: string, limit: { requests: number; windowMs: number }): Record<string, string> {
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  const timestamps = rateLimitStore.get(id) ?? [];
  const recentRequests = timestamps.filter((ts) => ts > windowStart);
  const remaining = Math.max(0, limit.requests - recentRequests.length);
  const resetMs = recentRequests.length > 0 ? recentRequests[0] + limit.windowMs - now : 0;

  return {
    'X-RateLimit-Limit': limit.requests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetMs / 1000).toString(),
  };
}

function getWwwAuthenticateHeader(req: NextRequest, error?: string, description?: string): Record<string, string> {
  const origin = req.nextUrl?.origin || 'http://localhost:3000';
  const resourceMetadata = `${origin}/.well-known/oauth-protected-resource`;

  if (!error) {
    return {
      'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadata}"`,
    };
  }

  return {
    'WWW-Authenticate': `Bearer error="${error}", error_description="${description || error}", resource_metadata="${resourceMetadata}"`,
  };
}

export async function validateMcpApiKey(req: NextRequest): Promise<McpAuthContext> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new McpAuthError(
      'MISSING_API_KEY',
      'Authorization header with Bearer token required',
      401,
      getWwwAuthenticateHeader(req)
    );
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new McpAuthError(
      'MISSING_API_KEY',
      'Bearer token cannot be empty',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Bearer token cannot be empty')
    );
  }

  // Branch 1: OAuth 2.0 JWT Access Token (contains header.payload.signature)
  if (token.split('.').length === 3) {
    const claims = verifyMcpJwtToken(token);
    if (!claims) {
      throw new McpAuthError(
        'INVALID_TOKEN',
        'Invalid or expired OAuth access token',
        401,
        getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid or expired OAuth access token')
      );
    }

    const client = await oauthClientRepository.findByClientId(claims.sub);
    if (!client) {
      throw new McpAuthError(
        'INVALID_CLIENT',
        'OAuth client no longer exists',
        401,
        getWwwAuthenticateHeader(req, 'invalid_client', 'OAuth client no longer exists')
      );
    }

    if (!client.isActive) {
      throw new McpAuthError(
        'CLIENT_DISABLED',
        'OAuth client has been disabled',
        401,
        getWwwAuthenticateHeader(req, 'unauthorized_client', 'OAuth client has been disabled')
      );
    }

    const tier = client.tier || claims.tier || 'free';
    const limit = TIER_LIMITS[tier];

    if (!checkRateLimit(client.clientId, limit)) {
      const rateHeaders = getRateLimitHeaders(client.clientId, limit);
      throw new McpAuthError('RATE_LIMITED', 'Rate limit exceeded', 429, rateHeaders);
    }

    return {
      apiKeyId: client.clientId,
      tier,
      rateLimit: limit,
    };
  }

  // Branch 2: Static Pre-Shared API Key (dgr_XXXXXXXX_SECRET)
  if (token.length < 16) {
    throw new McpAuthError(
      'INVALID_API_KEY',
      'Invalid API key format',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid API key format')
    );
  }

  const separatorIndex = token.indexOf('_', 4);
  if (separatorIndex === -1) {
    throw new McpAuthError(
      'INVALID_API_KEY',
      'Invalid API key format',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid API key format')
    );
  }

  const prefix = token.slice(0, separatorIndex);
  const secret = token.slice(separatorIndex + 1);

  if (!prefix || !secret) {
    throw new McpAuthError(
      'INVALID_API_KEY',
      'Invalid API key format',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid API key format')
    );
  }

  const record = await apiKeyRepository.findByPrefix(prefix);
  if (!record) {
    throw new McpAuthError(
      'INVALID_API_KEY',
      'Invalid API key',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid API key')
    );
  }

  if (!record.isActive) {
    throw new McpAuthError(
      'API_KEY_DISABLED',
      'API key has been disabled',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'API key has been disabled')
    );
  }

  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    throw new McpAuthError(
      'API_KEY_EXPIRED',
      'API key has expired',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'API key has expired')
    );
  }

  const isValid = await argon2.verify(record.keyHash, secret);
  if (!isValid) {
    throw new McpAuthError(
      'INVALID_API_KEY',
      'Invalid API key',
      401,
      getWwwAuthenticateHeader(req, 'invalid_token', 'Invalid API key')
    );
  }

  await apiKeyRepository.update(record.id, { lastUsedAt: new Date().toISOString() });

  const tier = record.tier;
  const limit = TIER_LIMITS[tier];

  if (!checkRateLimit(record.id, limit)) {
    const headers = getRateLimitHeaders(record.id, limit);
    throw new McpAuthError('RATE_LIMITED', 'Rate limit exceeded', 429, headers);
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