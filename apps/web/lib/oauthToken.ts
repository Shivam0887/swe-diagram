import crypto from 'node:crypto';
import type { ApiKeyTier } from '@platform/db';

export interface McpJwtPayload {
  sub: string; // Client ID
  name: string;
  tier: ApiKeyTier;
  scope: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
}

function getJwtSecret(): string {
  const secret = process.env.MCP_JWT_SECRET || process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  // In dev / fallback, warn once and use stable deterministic fallback
  return 'agentic-diagrams-default-mcp-jwt-secret-change-in-production-32chars';
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

/**
 * Sign an MCP JWT access token using HMAC-SHA256 (HS256)
 */
export function signMcpJwtToken(params: {
  clientId: string;
  name: string;
  tier: ApiKeyTier;
  scopes: string[];
  issuer: string;
  expiresInSeconds?: number;
}): { accessToken: string; expiresIn: number } {
  const expiresIn = params.expiresInSeconds ?? 3600; // 1 hour default
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: McpJwtPayload = {
    sub: params.clientId,
    name: params.name,
    tier: params.tier,
    scope: params.scopes.join(' '),
    iss: params.issuer,
    aud: 'mcp',
    iat: now,
    exp: now + expiresIn,
    jti: crypto.randomUUID(),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const secret = getJwtSecret();
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  return {
    accessToken: `${data}.${signature}`,
    expiresIn,
  };
}

/**
 * Verify and decode an MCP JWT access token
 */
export function verifyMcpJwtToken(token: string): McpJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const secret = getJwtSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payloadText = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadText) as McpJwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    if (payload.aud !== 'mcp') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify PKCE code verifier against code challenge
 */
export function verifyPkce(
  codeVerifier: string,
  codeChallenge: string,
  method: 'S256' | 'plain'
): boolean {
  if (method === 'plain') {
    return codeVerifier === codeChallenge;
  }

  if (method === 'S256') {
    const computed = crypto.createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');
    return computed === codeChallenge;
  }

  return false;
}
