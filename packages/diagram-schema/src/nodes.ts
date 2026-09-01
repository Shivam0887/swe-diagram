import { z } from 'zod';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const PortPositionSchema = z.enum(['top', 'right', 'bottom', 'left']);
export const PortTypeSchema = z.enum(['source', 'target', 'bidirectional']);

export const PortSchema = z.object({
  id: z.string().min(1),
  position: PortPositionSchema,
  type: PortTypeSchema,
  label: z.string().optional(),
  offset: z.number().optional(),
});

export const NodeCategorySchema = z.enum([
  'client',
  'compute',
  'storage',
  'messaging',
  'cache',
  'network',
  'external',
  'security',
  'monitoring',
  'general',
]);

export const NodeTypeSchema = z.enum([
  'user',
  'browser',
  'mobile',
  'api_gateway',
  'load_balancer',
  'service',
  'worker',
  'server',
  'container',
  'database',
  'postgresql',
  'cache',
  'redis',
  'queue',
  'kafka',
  'object_storage',
  'cdn',
  'search',
  'cloud',
  'monitoring',
  'lock',
  'code',
  'custom',
]);

export const NodeShapeSchema = z.enum([
  'rounded_card',
  'cylinder',
  'queue_buffer',
  'pill',
  'cloud',
  'browser_window',
  'device_mobile',
  'hexagon',
  'diamond',
  'note',
  'text_only',
  // Polished architecture vocabulary — added 2026-09 for the
  // ByteByteGo-flavored visual system. Existing shapes keep their
  // old behaviour; new shapes get dedicated renderer branches.
  'bento_card',
  'data_cylinder',
  'event_stream',
  'serverless_function',
  'user_avatar',
  'tier_card',
  'gateway_ribbon',
]);

export const NodeStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  borderStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
  borderRadius: z.number().optional(),
  shadow: z.enum(['none', 'sm', 'md', 'lg', 'glow']).optional(),
  accentColor: z.string().optional(),
  accentPosition: z.enum(['left', 'top', 'none']).optional(),
  textColor: z.string().optional(),
  iconColor: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const NodeDataSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  icon: z.string().optional(),
  showIcon: z.boolean().optional(),
  role: NodeCategorySchema.optional(),
  pulsing: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  details: z.record(z.unknown()).optional(),
});

export const DiagramNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeSchema,
  shape: NodeShapeSchema.optional().default('rounded_card'),
  position: PointSchema,
  size: SizeSchema,
  data: NodeDataSchema,
  style: NodeStyleSchema.optional(),
  ports: z.array(PortSchema).optional(),
  groupId: z.string().optional(),
  zIndex: z.number().optional(),
  locked: z.boolean().optional(),
});
