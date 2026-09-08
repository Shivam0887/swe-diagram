import { NextRequest, NextResponse } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { validateMcpApiKey, getRateLimitHeadersForContext, McpAuthError } from '@/lib/mcpAuth';
import { createMcpServer } from './server';
import { McpRequestContext } from './context';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleMcpRequest(req: NextRequest) {
  let auth: Awaited<ReturnType<typeof validateMcpApiKey>> | null = null;
  
  try {
    auth = await validateMcpApiKey(req);
  } catch (error) {
    if (error instanceof McpAuthError) {
      const headers: Record<string, string> = {};
      if (error.code === 'RATE_LIMITED' && auth) {
        Object.assign(headers, getRateLimitHeadersForContext(auth));
      }
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status, headers }
      );
    }
    throw error;
  }

  if (!auth) {
    return NextResponse.json(
      { error: { code: 'INVALID_API_KEY', message: 'Invalid API key' } },
      { status: 401 }
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => auth.apiKeyId,
    onsessioninitialized: (sessionId) => {
      console.log(`[MCP] Session initialized: ${sessionId}`);
    },
  });

  const context: McpRequestContext = {
    auth,
    requestId: crypto.randomUUID(),
  };

  const server = createMcpServer(context);
  
  await server.connect(transport);
  
  // Convert NextRequest to standard Request
  const standardReq = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body ? await req.blob() : null,
  });
  
  const response = await transport.handleRequest(standardReq);
  
  // Add rate limit headers to response
  const rateLimitHeaders = getRateLimitHeadersForContext(auth);
  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    response.headers.set(key, value);
  }
  
  // Convert back to NextResponse
  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  
  return nextResponse;
}

export async function POST(req: NextRequest) {
  try {
    return await handleMcpRequest(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    return await handleMcpRequest(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await handleMcpRequest(req);
  } catch (error) {
    return handleApiError(error);
  }
}