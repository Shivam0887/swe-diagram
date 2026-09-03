import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CanvasBackgroundSchema, DiagramDocumentSchema } from '@platform/diagram-schema';
import { exportService } from '@/lib/services/exportService';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * Background override sent by the client. Accepts:
 *   - `'none'` to suppress the bg layer (alpha PNG, no rect in SVG)
 *   - `'theme'` to use the document's `metadata.background` as-is
 *   - a full `CanvasBackground` object (`grid` / `dots` / `solid`)
 *     to override per-export
 *
 * The `background` shape is the same `CanvasBackground` defined on
 * `DiagramMetadata`; reusing the schema means new options added to
 * the document model flow through to the export API automatically.
 */
const BackgroundOverrideSchema = z.union([
  z.enum(['none', 'theme']),
  CanvasBackgroundSchema,
]);

const ExportRequestSchema = z.object({
  document: DiagramDocumentSchema,
  format: z.enum(['svg', 'png']).default('svg'),
  scale: z.number().min(1).max(4).default(2),
  theme: z.string().optional(),
  /**
   * Per-export background override. Default is `'theme'`, meaning
   * the export uses the document's `metadata.background`. Pass
   * `'none'` for a transparent backdrop or a `CanvasBackground`
   * object to override the visual.
   */
  background: BackgroundOverrideSchema.optional().default('theme'),
  /**
   * Drop the background layer in both SVG and PNG output. Legacy
   * alias for `background: 'none'`; the editor modal sends `background`
   * in the new code path but we keep this for any older clients.
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
        background: validated.background as any,
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
      background: validated.background as any,
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
