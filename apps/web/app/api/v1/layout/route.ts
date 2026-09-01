import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { layoutService } from '@/lib/services/layoutService';
import { handleApiError } from '@/lib/errors';

const LayoutRequestSchema = z.object({
  document: DiagramDocumentSchema,
  direction: z.enum(['horizontal', 'vertical']).optional().default('horizontal'),
  nodeSpacing: z.number().positive().optional(),
  layerSpacing: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LayoutRequestSchema.parse(body);
    const layoutedDoc = await layoutService.layout(validated.document as any, {
      direction: validated.direction,
      nodeSpacing: validated.nodeSpacing,
      layerSpacing: validated.layerSpacing,
    });
    return NextResponse.json({ data: layoutedDoc });
  } catch (error) {
    return handleApiError(error);
  }
}
