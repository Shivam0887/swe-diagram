import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { exportService } from '@/lib/services/exportService';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

const ExportRequestSchema = z.object({
  document: DiagramDocumentSchema,
  format: z.enum(['svg', 'png']).default('svg'),
  scale: z.number().min(1).max(4).default(2),
  theme: z.string().optional(),
  /**
   * Drop the background layer in both SVG and PNG output. Default is
   * false so existing clients keep their opaque backdrop; the editor
   * modal flips this to true when the user toggles "transparent
   * background" in the export sheet.
   */
  transparentBackground: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ExportRequestSchema.parse(body);

    if (validated.format === 'svg') {
      const svg = exportService.svg(validated.document as any, {
        theme: validated.theme,
        transparentBackground: validated.transparentBackground,
      });
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeFilename(validated.document.metadata.title)}.svg"`,
        },
      });
    }

    const pngBuffer = await exportService.png(validated.document as any, {
      scale: validated.scale,
      theme: validated.theme,
      transparentBackground: validated.transparentBackground,
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeFilename(validated.document.metadata.title)}.png"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function safeFilename(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diagram';
}
