import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectService } from '@/lib/services/projectService';
import { handleApiError } from '@/lib/errors';

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const runtime = 'nodejs';

export async function GET() {
  try {
    const projects = await projectService.listProjects();
    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);
    const project = await projectService.createProject(validated);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
