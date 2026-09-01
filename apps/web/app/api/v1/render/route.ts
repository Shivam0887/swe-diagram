import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { renderService } from '@/lib/services/renderService';
import { handleApiError } from '@/lib/errors';

const RenderRequestSchema = z.object({
  document: DiagramDocumentSchema,
  theme: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RenderRequestSchema.parse(body);
    const result = renderService.render(validated.document as any, {
      theme: validated.theme,
      width: validated.width,
      height: validated.height,
    });

    const format = req.nextUrl.searchParams.get('format') ?? 'json';
    if (format === 'svg') {
      return new NextResponse(result.svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
