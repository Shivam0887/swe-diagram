import { z } from 'zod';
import {
  DiagramDocumentSchema,
  DiagramNodeSchema,
  DiagramEdgeSchema,
  NodeTypeSchema,
  ThemeIdSchema,
  CanvasBackgroundSchema,
  NodeShapeSchema,
  EdgeRoutingSchema,
  EdgeStyleSchema,
  EdgeMarkerSchema,
} from '@platform/diagram-schema';

const DiagramInputSchema = DiagramDocumentSchema;

export const CreateDiagramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  theme: ThemeIdSchema.optional(),
  metadata: z.object({
    width: z.number().default(1200),
    height: z.number().default(800),
    background: CanvasBackgroundSchema.optional(),
  }).optional(),
  nodes: z.array(DiagramNodeSchema).default([]),
  edges: z.array(DiagramEdgeSchema).default([]),
  customCollections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string().optional(),
      nodeTemplate: z.object({
        type: NodeTypeSchema,
        shape: NodeShapeSchema.optional(),
        size: z.object({ width: z.number(), height: z.number() }).optional(),
        data: z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          icon: z.string().optional(),
          showIcon: z.boolean().optional(),
          role: z.string().optional(),
          pulsing: z.boolean().optional(),
          tags: z.array(z.string()).optional(),
          metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
          details: z.record(z.unknown()).optional(),
        }).optional(),
        style: z.record(z.unknown()).optional(),
        ports: z.array(z.object({
          id: z.string(),
          position: z.enum(['top', 'right', 'bottom', 'left']),
          type: z.enum(['source', 'target', 'bidirectional']),
          label: z.string().optional(),
          offset: z.number().optional(),
        })).optional(),
      }),
    })),
  })).optional(),
});

export const AddNodeSchema = z.object({
  diagram: DiagramInputSchema,
  node: z.object({
    type: NodeTypeSchema,
    title: z.string().min(1).max(100),
    subtitle: z.string().max(200).optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    size: z.object({ width: z.number(), height: z.number() }).optional(),
    shape: NodeShapeSchema.optional(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    badgeColor: z.string().optional(),
    style: z.record(z.unknown()).optional(),
    data: z.record(z.unknown()).optional(),
    groupId: z.string().optional(),
    ports: z.array(z.object({
      id: z.string(),
      position: z.enum(['top', 'right', 'bottom', 'left']),
      type: z.enum(['source', 'target', 'bidirectional']),
      label: z.string().optional(),
      offset: z.number().optional(),
    })).optional(),
  }),
  theme: ThemeIdSchema.optional(),
});

export const AddEdgeSchema = z.object({
  diagram: DiagramInputSchema,
  edge: z.object({
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
    sourcePortId: z.string().optional(),
    targetPortId: z.string().optional(),
    routing: EdgeRoutingSchema.optional(),
    style: EdgeStyleSchema.optional(),
    markerStart: EdgeMarkerSchema.optional(),
    markerEnd: EdgeMarkerSchema.optional(),
    label: z.string().optional(),
    sublabel: z.string().optional(),
    stepNumber: z.number().int().positive().optional(),
    color: z.string().optional(),
    strokeWidth: z.number().positive().optional(),
    dashStyle: EdgeStyleSchema.optional(),
    animated: z.boolean().optional(),
    animationType: z.enum(['particles', 'dash_flow', 'pulse']).optional(),
    animationSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
    flowColor: z.string().optional(),
    waypoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
    data: z.record(z.unknown()).optional(),
  }),
  theme: ThemeIdSchema.optional(),
});

export const UpdateNodeSchema = z.object({
  diagram: DiagramInputSchema,
  nodeId: z.string(),
  patches: z.object({
    type: NodeTypeSchema.optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    size: z.object({ width: z.number(), height: z.number() }).optional(),
    shape: NodeShapeSchema.optional(),
    style: z.record(z.unknown()).optional(),
    data: z.record(z.unknown()).optional(),
    locked: z.boolean().optional(),
    zIndex: z.number().optional(),
    groupId: z.string().optional(),
    ports: z.array(z.object({
      id: z.string(),
      position: z.enum(['top', 'right', 'bottom', 'left']),
      type: z.enum(['source', 'target', 'bidirectional']),
      label: z.string().optional(),
      offset: z.number().optional(),
    })).optional(),
  }),
  theme: ThemeIdSchema.optional(),
});

export const DeleteNodeSchema = z.object({
  diagram: DiagramInputSchema,
  nodeId: z.string(),
  theme: ThemeIdSchema.optional(),
});

export const ApplyLayoutSchema = z.object({
  diagram: DiagramInputSchema,
  direction: z.enum(['horizontal', 'vertical']).default('horizontal'),
  algorithm: z.enum(['elk', 'dagre']).default('elk'),
  nodeSpacing: z.number().positive().default(80),
  layerSpacing: z.number().positive().default(100),
  edgeRouting: z.enum(['orthogonal', 'curved']).default('orthogonal'),
  theme: ThemeIdSchema.optional(),
});

export const RenderSvgSchema = z.object({
  diagram: DiagramInputSchema,
  theme: ThemeIdSchema.optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  background: z.union([z.enum(['none', 'theme']), CanvasBackgroundSchema]).optional(),
});

export const ExportPngSchema = z.object({
  diagram: DiagramInputSchema,
  theme: ThemeIdSchema.optional(),
  scale: z.number().min(1).max(4).default(2),
  background: z.union([z.enum(['none', 'theme']), CanvasBackgroundSchema]).optional(),
  pageSize: z.union([
    z.literal('auto'),
    z.object({ width: z.number().int().min(64).max(8192), height: z.number().int().min(64).max(8192), label: z.string().optional() })
  ]).default('auto'),
});

export const ExportPdfSchema = z.object({
  diagram: DiagramInputSchema,
  theme: ThemeIdSchema.optional(),
  pageSize: z.union([
    z.literal('auto'),
    z.enum(['A4', 'A3', 'Letter', 'Tabloid']),
    z.object({ width: z.number().int().min(64).max(8192), height: z.number().int().min(64).max(8192), label: z.string().optional() })
  ]).default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('landscape'),
});

export const GetDiagramSchema = z.object({
  diagram: DiagramInputSchema,
});

export type CreateDiagramInput = z.infer<typeof CreateDiagramSchema>;
export type AddNodeInput = z.infer<typeof AddNodeSchema>;
export type AddEdgeInput = z.infer<typeof AddEdgeSchema>;
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;
export type DeleteNodeInput = z.infer<typeof DeleteNodeSchema>;
export type ApplyLayoutInput = z.infer<typeof ApplyLayoutSchema>;
export type RenderSvgInput = z.infer<typeof RenderSvgSchema>;
export type ExportPngInput = z.infer<typeof ExportPngSchema>;
export type ExportPdfInput = z.infer<typeof ExportPdfSchema>;
export type GetDiagramInput = z.infer<typeof GetDiagramSchema>;