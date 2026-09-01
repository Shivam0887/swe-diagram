import { z } from 'zod';
import { DiagramNodeSchema, NodeTypeSchema, NodeShapeSchema, NodeDataSchema, NodeStyleSchema, SizeSchema } from './nodes';
import { DiagramEdgeSchema } from './edges';
import { DiagramGroupSchema } from './groups';
import { DiagramAnnotationSchema } from './annotations';
import type { DiagramDocument } from './types';

export const ThemeIdSchema = z.enum(['editorial-dark', 'polished-dark']);

export const CanvasBackgroundSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('grid'),
    color: z.string().optional(),
    gridColor: z.string().optional(),
    gridSize: z.number().positive().optional(),
  }),
  z.object({
    type: z.literal('dots'),
    color: z.string().optional(),
    dotColor: z.string().optional(),
    dotSpacing: z.number().positive().optional(),
  }),
  z.object({
    type: z.literal('solid'),
    color: z.string(),
  }),
]);

export const DiagramMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  width: z.number().positive().default(1200),
  height: z.number().positive().default(800),
  background: CanvasBackgroundSchema.optional().default({ type: 'grid' }),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CustomCollectionItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  nodeTemplate: z.object({
    type: NodeTypeSchema,
    shape: NodeShapeSchema.optional(),
    size: SizeSchema,
    data: NodeDataSchema,
    style: NodeStyleSchema.optional(),
  }),
});

export const CustomCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  items: z.array(CustomCollectionItemSchema),
});

export const DiagramDocumentSchema = z.object({
  schemaVersion: z.string().default('1.0'),
  rendererVersion: z.string().default('1.0.0'),
  theme: ThemeIdSchema.default('polished-dark'),
  metadata: DiagramMetadataSchema,
  nodes: z.array(DiagramNodeSchema).default([]),
  edges: z.array(DiagramEdgeSchema).default([]),
  groups: z.array(DiagramGroupSchema).default([]),
  annotations: z.array(DiagramAnnotationSchema).default([]),
  customCollections: z.array(CustomCollectionSchema).optional().default([]),
});

export type ValidationErrorDetail = {
  path: (string | number)[];
  message: string;
};

export type ValidationResult =
  | { success: true; data: DiagramDocument }
  | { success: false; errors: ValidationErrorDetail[] };

export function validateDiagramDocument(input: unknown): ValidationResult {
  const result = DiagramDocumentSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as DiagramDocument };
  }

  const errors: ValidationErrorDetail[] = result.error.errors.map((err) => ({
    path: err.path,
    message: err.message,
  }));

  return { success: false, errors };
}
