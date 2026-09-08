import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { McpAuthError } from './mcpAuth';

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload failed schema validation.',
          details: err.errors.map((e) => ({
            path: e.path,
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  if (err instanceof McpAuthError) {
    const headers: Record<string, string> = {};
    if (err.code === 'RATE_LIMITED') {
      // Rate limit headers would be added by the route handler
    }
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      { status: err.status }
    );
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred.';

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    { status: 500 }
  );
}
