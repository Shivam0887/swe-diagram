import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { diagramService } from '@/lib/services/diagramService';
import { handleApiError } from '@/lib/errors';

const CreateDiagramSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  document: DiagramDocumentSchema,
});

export async function GET() {
  try {
    const diagrams = await diagramService.listDiagrams();
    return NextResponse.json({ data: diagrams });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateDiagramSchema.parse(body);
    const diagram = await diagramService.createDiagram(validated as any);
    return NextResponse.json({ data: diagram }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
