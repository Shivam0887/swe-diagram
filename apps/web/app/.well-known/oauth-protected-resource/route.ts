import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * RFC 9728: Protected Resource Metadata
 * Informs MCP clients (like Claude, Cursor) about the authorization servers
 * and scopes protecting the MCP endpoint.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';

  const metadata = {
    resource: `${origin}/api/v1/mcp`,
    authorization_servers: [origin],
    scopes_supported: ['diagrams:read', 'diagrams:write'],
    bearer_methods_supported: ['header'],
  };

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
