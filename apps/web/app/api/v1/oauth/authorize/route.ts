import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { oauthClientRepository } from '@platform/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * OAuth 2.0 / 2.1 Authorization Endpoint (RFC 6749 / RFC 7636)
 * Pre-registered clients only (no dynamic client registration).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const responseType = searchParams.get('response_type');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const requestedScope = searchParams.get('scope');

  if (!clientId) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id is required' },
      { status: 400 }
    );
  }

  const client = await oauthClientRepository.findByClientId(clientId);
  if (!client) {
    return NextResponse.json(
      { error: 'unauthorized_client', error_description: 'Unknown or unregistered client_id' },
      { status: 400 }
    );
  }

  if (!client.isActive) {
    return NextResponse.json(
      { error: 'unauthorized_client', error_description: 'Client is disabled' },
      { status: 400 }
    );
  }

  // Validate redirect_uri against pre-registered URIs
  if (!redirectUri) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'redirect_uri is required' },
      { status: 400 }
    );
  }

  const isRedirectAllowed = client.redirectUris.includes(redirectUri);
  if (!isRedirectAllowed) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'redirect_uri does not match any pre-registered URI for this client',
      },
      { status: 400 }
    );
  }

  // Helper to redirect error back to client
  const redirectWithError = (error: string, desc: string) => {
    const target = new URL(redirectUri);
    target.searchParams.set('error', error);
    target.searchParams.set('error_description', desc);
    if (state) target.searchParams.set('state', state);
    return NextResponse.redirect(target);
  };

  if (responseType !== 'code') {
    return redirectWithError(
      'unsupported_response_type',
      'Only response_type=code is supported'
    );
  }

  // Enforce PKCE for authorization code grant
  if (!codeChallenge) {
    return redirectWithError(
      'invalid_request',
      'code_challenge is required for authorization code grant (PKCE)'
    );
  }

  if (codeChallengeMethod !== 'S256') {
    return redirectWithError(
      'invalid_request',
      'code_challenge_method must be S256'
    );
  }

  // Determine granted scopes (intersection with client pre-registered scopes)
  const availableScopes = client.scopes || ['diagrams:read', 'diagrams:write'];
  const grantedScopes = requestedScope
    ? requestedScope.split(' ').filter((s) => availableScopes.includes(s))
    : availableScopes;

  // Generate 5-minute single-use authorization code
  const code = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  await oauthClientRepository.createAuthCode({
    code,
    clientId: client.clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod: 'S256',
    scopes: grantedScopes,
    createdAt: now.toISOString(),
    expiresAt,
  });

  const redirectTarget = new URL(redirectUri);
  redirectTarget.searchParams.set('code', code);
  if (state) {
    redirectTarget.searchParams.set('state', state);
  }

  return NextResponse.redirect(redirectTarget);
}
