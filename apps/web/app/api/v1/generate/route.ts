import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiGeneratorService } from '@/lib/services/aiGeneratorService';
import { handleApiError } from '@/lib/errors';

const GenerateRequestSchema = z.object({
  prompt: z.string().min(3),
  theme: z.string().optional().default('polished-dark'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = GenerateRequestSchema.parse(body);
    const generatedDoc = await aiGeneratorService.generateFromPrompt(
      validated.prompt,
      validated.theme
    );
    return NextResponse.json({ data: generatedDoc });
  } catch (error) {
    return handleApiError(error);
  }
}
