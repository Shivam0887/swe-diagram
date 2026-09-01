import { NextRequest, NextResponse } from 'next/server';
import { diagramService } from '@/lib/services/diagramService';
import { renderService } from '@/lib/services/renderService';
import { handleApiError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const diagram = await diagramService.getDiagram(id);
    if (!diagram) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Diagram not found' } }, { status: 404 });
    }

    const theme = req.nextUrl.searchParams.get('theme') ?? undefined;
    const result = renderService.render(diagram.document, { theme });

    const format = req.nextUrl.searchParams.get('format') ?? 'svg';
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
