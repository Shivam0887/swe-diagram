import { z } from 'zod';
import { PointSchema, SizeSchema } from './nodes';

export const StepAnnotationSchema = z.object({
  id: z.string().min(1),
  type: z.literal('step'),
  position: PointSchema,
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const CalloutAnnotationSchema = z.object({
  id: z.string().min(1),
  type: z.literal('callout'),
  position: PointSchema,
  size: SizeSchema.optional(),
  title: z.string().min(1),
  text: z.string().min(1),
  variant: z.enum(['info', 'warning', 'tip', 'success']).optional().default('info'),
});

export const HighlightAnnotationSchema = z.object({
  id: z.string().min(1),
  type: z.literal('highlight'),
  position: PointSchema,
  size: SizeSchema,
  color: z.string().optional(),
});

export const TextAnnotationSchema = z.object({
  id: z.string().min(1),
  type: z.literal('text'),
  position: PointSchema,
  content: z.string().min(1),
  fontSize: z.number().positive().optional(),
  fontWeight: z.enum(['normal', 'bold']).optional(),
});

export const DiagramAnnotationSchema = z.discriminatedUnion('type', [
  StepAnnotationSchema,
  CalloutAnnotationSchema,
  HighlightAnnotationSchema,
  TextAnnotationSchema,
]);
