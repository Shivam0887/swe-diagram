import { z } from 'zod';
import { PointSchema } from './nodes';

export const EdgeRoutingSchema = z.enum(['orthogonal', 'curved', 'straight', 'step']);
export const EdgeMarkerSchema = z.enum(['arrow', 'dot', 'diamond', 'none']);
export const EdgeStyleSchema = z.enum(['solid', 'dashed', 'dotted']);
export const EdgeAnimationTypeSchema = z.enum(['particles', 'dash_flow', 'pulse']);
export const EdgeAnimationSpeedSchema = z.enum(['slow', 'normal', 'fast']);

export const EdgeEndpointSchema = z.object({
  nodeId: z.string().min(1),
  portId: z.string().optional(),
});

export const EdgeDataSchema = z.object({
  label: z.string().optional(),
  sublabel: z.string().optional(),
  stepNumber: z.number().int().positive().optional(),
  color: z.string().optional(),
  strokeWidth: z.number().positive().optional(),
  animated: z.boolean().optional(),
  animationType: EdgeAnimationTypeSchema.optional().default('particles'),
  animationSpeed: EdgeAnimationSpeedSchema.optional().default('normal'),
  flowColor: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export const DiagramEdgeSchema = z.object({
  id: z.string().min(1),
  source: EdgeEndpointSchema,
  target: EdgeEndpointSchema,
  routing: EdgeRoutingSchema.optional().default('orthogonal'),
  style: EdgeStyleSchema.optional().default('solid'),
  markerStart: EdgeMarkerSchema.optional().default('none'),
  markerEnd: EdgeMarkerSchema.optional().default('arrow'),
  waypoints: z.array(PointSchema).optional(),
  data: EdgeDataSchema.optional(),
  zIndex: z.number().optional(),
});
