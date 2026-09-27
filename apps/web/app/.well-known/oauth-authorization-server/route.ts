import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * RFC 8414: OAuth 2.0 Authorization Server Metadata
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';

  const metadata = {
    issuer: origin,
    authorization_endpoint: `${origin}/api/v1/oauth/authorize`,
    token_endpoint: `${origin}/api/v1/oauth/token`,
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
    grant_types_supported: ['client_credentials', 'authorization_code'],
    response_types_supported: ['code'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['diagrams:read', 'diagrams:write'],
  };

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
