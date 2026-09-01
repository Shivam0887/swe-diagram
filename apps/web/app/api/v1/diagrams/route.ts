import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiagramDocumentSchema } from '@platform/diagram-schema';
import { diagramService } from '@/lib/services/diagramService';
import { handleApiError } from '@/lib/errors';

const CreateDiagramSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  document: DiagramDocumentSchema,
});

export const runtime = 'nodejs';

/**
 * GET /api/v1/diagrams?projectId=<id>
 *   Returns every diagram under a project. `projectId` is required —
 *   the API no longer supports a global cross-project list.
 */
export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_PROJECT_ID',
            message: 'projectId query param is required',
          },
        },
        { status: 400 }
      );
    }
    const diagrams = await diagramService.listByProject(projectId);
    return NextResponse.json({ data: diagrams });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/diagrams
 *   Creates a new diagram under an existing project. The project's id
 *   must be supplied; orphan diagrams are not allowed.
 */
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
