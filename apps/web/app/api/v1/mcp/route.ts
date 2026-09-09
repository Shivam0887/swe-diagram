import { NextRequest, NextResponse } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { validateMcpApiKey, getRateLimitHeadersForContext, McpAuthError } from '@/lib/mcpAuth';
import { createMcpServer } from './server';
import { McpRequestContext } from './context';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stateless MCP Streamable HTTP handler.
 *
 * Per the MCP SDK v1.30 stateless architecture:
 * - A fresh McpServer + Transport is created for every incoming request.
 * - `sessionIdGenerator: undefined` disables session management.
 * - `enableJsonResponse: true` returns plain JSON instead of SSE streams,
 *   which is appropriate for serverless/Next.js environments.
 * - Transport and server are closed after each request to prevent leaks.
 */
async function handleMcpPost(req: NextRequest) {
  let auth: Awaited<ReturnType<typeof validateMcpApiKey>> | null = null;

  try {
    auth = await validateMcpApiKey(req);
  } catch (error) {
    if (error instanceof McpAuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    throw error;
  }

  const context: McpRequestContext = {
    auth,
    requestId: crypto.randomUUID(),
  };

  const server = createMcpServer(context);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    const response = await transport.handleRequest(req);

    // Attach rate limit headers to the response
    const rateLimitHeaders = getRateLimitHeadersForContext(auth);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } finally {
    await transport.close();
    await server.close();
  }
}

/**
 * JSON-RPC error response helper for non-POST methods.
 */
function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed. Stateless MCP server only accepts POST.',
      },
      id: null,
    },
    {
      status: 405,
      headers: { Allow: 'POST' },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    return await handleMcpPost(req);
  } catch (error) {
    return handleApiError(error);
  }
}

// In stateless mode, GET (SSE streams) and DELETE (session termination)
// are not applicable - return 405 Method Not Allowed.
export async function GET() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}