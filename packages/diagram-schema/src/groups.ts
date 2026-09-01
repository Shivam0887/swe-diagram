import { z } from 'zod';
import { PointSchema, SizeSchema } from './nodes';

export const GroupStyleSchema = z.enum(['boundary', 'container', 'swimlane', 'card']);
export type GroupStyle = z.infer<typeof GroupStyleSchema>;

export const DiagramGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  position: PointSchema,
  size: SizeSchema,
  style: GroupStyleSchema.optional().default('boundary'),
  colorRole: z.string().optional(),
  zIndex: z.number().optional(),
});
