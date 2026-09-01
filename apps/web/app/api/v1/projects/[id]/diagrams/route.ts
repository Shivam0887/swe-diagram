import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { projectService } from '@/lib/services/projectService';
import { diagramService } from '@/lib/services/diagramService';
import { handleApiError } from '@/lib/errors';

const CreateDiagramInProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  document: DiagramDocumentSchema,
});

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify the project exists before listing its diagrams; otherwise an
    // empty list could mean "no diagrams" or "no such project" and the
    // client can't tell the difference.
    const project = await projectService.getProject(id);
    if (!project) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    const diagrams = await diagramService.listByProject(id);
    return NextResponse.json({ data: diagrams });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = CreateDiagramInProjectSchema.parse(body);
    const diagram = await diagramService.createDiagram({
      ...validated,
      projectId: id,
    } as any);
    return NextResponse.json({ data: diagram }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
