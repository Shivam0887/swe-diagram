import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectService } from '@/lib/services/projectService';
import { handleApiError } from '@/lib/errors';

const UpdateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await projectService.getProject(id);
    if (!project) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: project });
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
    const validated = UpdateProjectSchema.parse(body);
    const updated = await projectService.updateProject(id, validated);
    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await projectService.deleteProject(id);
    if (!ok) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
