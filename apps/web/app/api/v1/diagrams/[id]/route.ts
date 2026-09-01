import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { diagramService } from '@/lib/services/diagramService';
import { handleApiError } from '@/lib/errors';

const UpdateDiagramSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  document: DiagramDocumentSchema.optional(),
});

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
    return NextResponse.json({ data: diagram });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = UpdateDiagramSchema.parse(body);
    const updated = await diagramService.updateDiagram(id, validated as any);
    if (!updated) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Diagram not found' } }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await diagramService.deleteDiagram(id);
    if (!deleted) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Diagram not found' } }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
