import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
