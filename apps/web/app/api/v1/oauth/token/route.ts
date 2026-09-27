import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { oauthClientRepository } from '@platform/db';
import { signMcpJwtToken, verifyPkce } from '@/lib/oauthToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseBasicAuth(header: string | null): { clientId?: string; clientSecret?: string } {
  if (!header || !header.startsWith('Basic ')) {
    return {};
  }
  try {
    const credentials = Buffer.from(header.slice(6), 'base64').toString('utf-8');
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) return {};
    return {
      clientId: credentials.slice(0, colonIndex),
      clientSecret: credentials.slice(colonIndex + 1),
    };
  } catch {
    return {};
  }
}

async function parseRequestBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (contentType.includes('application/json')) {
    try {
      return (await req.json()) as Record<string, string>;
    } catch {
      return {};
    }
  }

  // Fallback to text urlencoded
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const body = await parseRequestBody(req);
  const basicAuth = parseBasicAuth(req.headers.get('authorization'));

  const grantType = body.grant_type;
  const clientId = basicAuth.clientId || body.client_id;
  const clientSecret = basicAuth.clientSecret || body.client_secret;

  if (!grantType) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'grant_type is required' },
      { status: 400 }
    );
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'invalid_client', error_description: 'client_id is required' },
      { status: 401 }
    );
  }

  const client = await oauthClientRepository.findByClientId(clientId);
  if (!client) {
    return NextResponse.json(
      { error: 'invalid_client', error_description: 'Client authentication failed: unknown client' },
      { status: 401 }
    );
  }

  if (!client.isActive) {
    return NextResponse.json(
      { error: 'unauthorized_client', error_description: 'Client is disabled' },
      { status: 401 }
    );
  }

  const origin = req.nextUrl.origin || 'http://localhost:3000';

  // Branch A: Client Credentials Grant (RFC 6749 Section 4.4)
  if (grantType === 'client_credentials') {
    if (!clientSecret || !client.clientSecretHash) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'client_secret is required for confidential client' },
        { status: 401 }
      );
    }

    const isValidSecret = await argon2.verify(client.clientSecretHash, clientSecret);
    if (!isValidSecret) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client authentication failed: invalid secret' },
        { status: 401 }
      );
    }

    const requestedScope = body.scope;
    const availableScopes = client.scopes || ['diagrams:read', 'diagrams:write'];
    const grantedScopes = requestedScope
      ? requestedScope.split(' ').filter((s) => availableScopes.includes(s))
      : availableScopes;

    const { accessToken, expiresIn } = signMcpJwtToken({
      clientId: client.clientId,
      name: client.name,
      tier: client.tier,
      scopes: grantedScopes,
      issuer: origin,
      expiresInSeconds: 3600,
    });

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: grantedScopes.join(' '),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      }
    );
  }

  // Branch B: Authorization Code Grant with PKCE (RFC 6749 Section 4.1 & RFC 7636)
  if (grantType === 'authorization_code') {
    const code = body.code;
    const redirectUri = body.redirect_uri;
    const codeVerifier = body.code_verifier;

    if (!code) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code is required' },
        { status: 400 }
      );
    }

    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code_verifier is required (PKCE)' },
        { status: 400 }
      );
    }

    // Confidential clients must authenticate
    if (client.clientType === 'confidential') {
      if (!clientSecret || !client.clientSecretHash) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'client_secret is required for confidential client' },
          { status: 401 }
        );
      }

      const isValidSecret = await argon2.verify(client.clientSecretHash, clientSecret);
      if (!isValidSecret) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'Client authentication failed' },
          { status: 401 }
        );
      }
    }

    // Atomically consume auth code
    const authCode = await oauthClientRepository.consumeAuthCode(code);
    if (!authCode) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Authorization code is invalid or has already been used' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(authCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Authorization code has expired' },
        { status: 400 }
      );
    }

    // Validate client match
    if (authCode.clientId !== client.clientId) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Authorization code was not issued to this client' },
        { status: 400 }
      );
    }

    // Validate redirect URI match
    if (redirectUri && authCode.redirectUri !== redirectUri) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'redirect_uri does not match original authorization request' },
        { status: 400 }
      );
    }

    // Verify PKCE
    const isPkceValid = verifyPkce(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod);
    if (!isPkceValid) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'code_verifier failed PKCE verification' },
        { status: 400 }
      );
    }

    const { accessToken, expiresIn } = signMcpJwtToken({
      clientId: client.clientId,
      name: client.name,
      tier: client.tier,
      scopes: authCode.scopes,
      issuer: origin,
      expiresInSeconds: 3600,
    });

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: authCode.scopes.join(' '),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      }
    );
  }

  return NextResponse.json(
    {
      error: 'unsupported_grant_type',
      error_description: 'Only client_credentials and authorization_code grants are supported',
    },
    { status: 400 }
  );
}
