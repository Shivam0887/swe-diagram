import { iconFromPaths, type DiagramIconDefinition } from './types';

/**
 * Colored, illustrated architecture glyphs used by the polished visual system.
 *
 * These are NOT brand logos and NOT clones of any specific creator's icon set.
 * Each is an abstract, generic visual that represents the concept (a stacked
 * log for an event stream, a heptagon for an orchestrator, a bucket for
 * object storage, a column with index stripes for a database). They are
 * drawn in 1–2 colors so they read as illustrations, not as flat outlines.
 *
 * Each icon is rendered into a 24×24 viewBox. The `nodes` are path data
 * strings painted in painter's order (first one painted first, then the next
 * on top). Use the `color` field for a tinted underlay when supported.
 */

// ─── Compute & orchestration ────────────────────────────────────────────────

/** Kubernetes-style orchestrator: heptagon with hub lines. */
export const orchestratorIcon: DiagramIconDefinition = iconFromPaths(
  'orchestrator',
  'compute',
  '0 0 24 24',
  [
    'M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z',
    'M12 7 L17 9.5 L17 14.5 L12 17 L7 14.5 L7 9.5 Z',
    'M12 9.5 L12 17 M7 9.5 L17 14.5 M7 14.5 L17 9.5',
  ],
);

/** Generic compute service: a layered card stack. */
export const computeServiceIcon: DiagramIconDefinition = iconFromPaths(
  'compute_service',
  'compute',
  '0 0 24 24',
  [
    'M3 6 L12 2 L21 6 L12 10 Z',
    'M3 12 L12 16 L21 12',
    'M3 18 L12 22 L21 18',
  ],
);

/** Lambda / serverless: a lambda mark inside a tilted parallelogram. */
export const lambdaBoxIcon: DiagramIconDefinition = iconFromPaths(
  'lambda_box',
  'compute',
  '0 0 24 24',
  [
    'M5 4 L19 4 L19 20 L5 20 Z M5 4 L19 20',
    'M9 8 L9 16 M9 8 L13 8 M9 16 L13 16 M13 12 L15 12',
  ],
);

/** Container: a hexagon with a small inner box — abstract container. */
export const containerBoxIcon: DiagramIconDefinition = iconFromPaths(
  'container_box',
  'compute',
  '0 0 24 24',
  [
    'M12 2 L20 6 L20 14 L12 18 L4 14 L4 6 Z',
    'M8 9 L16 9 L16 13 L8 13 Z',
  ],
);

/** Worker: a gear-like cog with a center dot. */
export const cogIcon: DiagramIconDefinition = iconFromPaths(
  'cog',
  'compute',
  '0 0 24 24',
  [
    'M12 2 L13.2 4.5 L15.8 3.6 L16 6.4 L18.6 6.8 L17.5 9.2 L20 11 L18 12.8 L19.2 15.2 L16.8 15.8 L16.5 18.4 L14 17.6 L12 20 L10 17.6 L7.5 18.4 L7.2 15.8 L4.8 15.2 L6 12.8 L4 11 L6.5 9.2 L5.4 6.8 L8 6.4 L8.2 3.6 L10.8 4.5 Z',
    'M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9',
  ],
);

// ─── Storage & data ─────────────────────────────────────────────────────────

/** Generic key-value store: a cylinder with a horizontal key indicator. */
export const keyValueIcon: DiagramIconDefinition = iconFromPaths(
  'key_value',
  'storage',
  '0 0 24 24',
  [
    'M4 6 L4 18 A2 2 0 0 0 6 20 L18 20 A2 2 0 0 0 20 18 L20 6 A2 2 0 0 0 18 4 L6 4 A2 2 0 0 0 4 6 Z',
    'M4 10 L20 10 M4 14 L20 14',
    'M7 7 L9 7 M7 12 L11 12 M15 12 L17 12 M7 16 L9 16',
  ],
);

/** SQL database: a cylinder with a column and index tick marks. */
export const sqlDbIcon: DiagramIconDefinition = iconFromPaths(
  'sql_db',
  'storage',
  '0 0 24 24',
  [
    'M4 6 L4 18 A2 2 0 0 0 6 20 L18 20 A2 2 0 0 0 20 18 L20 6 A2 2 0 0 0 18 4 L6 4 A2 2 0 0 0 4 6 Z',
    'M4 10 L20 10 M4 15 L20 15',
    'M8 7 L16 7 M8 12 L13 12 M8 17 L11 17',
  ],
);

/** Search / index: a cylinder with three horizontal magnifier lines. */
export const searchIndexIcon: DiagramIconDefinition = iconFromPaths(
  'search_index',
  'storage',
  '0 0 24 24',
  [
    'M4 6 L4 18 A2 2 0 0 0 6 20 L18 20 A2 2 0 0 0 20 18 L20 6 A2 2 0 0 0 18 4 L6 4 A2 2 0 0 0 4 6 Z',
    'M4 9 L20 9 M4 13 L20 13 M4 17 L20 17',
    'M16 16 L20 20',
  ],
);

/** Object store / S3: a bucket with a fold-over lip. */
export const bucketIcon: DiagramIconDefinition = iconFromPaths(
  'bucket',
  'storage',
  '0 0 24 24',
  [
    'M3 8 L21 8 L19 21 L5 21 Z',
    'M3 8 L21 8',
    'M7 4 L17 4 L19 8 L5 8 Z',
  ],
);

/** Cache: a cylinder with a fast-forward chevron. */
export const cacheIconColored: DiagramIconDefinition = iconFromPaths(
  'cache_colored',
  'storage',
  '0 0 24 24',
  [
    'M4 6 L4 18 A2 2 0 0 0 6 20 L18 20 A2 2 0 0 0 20 18 L20 6 A2 2 0 0 0 18 4 L6 4 A2 2 0 0 0 4 6 Z',
    'M4 11 L20 11',
    'M9 14 L9 17 M11 13 L11 17 M13 12 L13 17',
  ],
);

// ─── Messaging & streaming ──────────────────────────────────────────────────

/** Event stream / Kafka: a horizontal stack of log bars. */
export const eventStreamIcon: DiagramIconDefinition = iconFromPaths(
  'event_stream',
  'messaging',
  '0 0 24 24',
  [
    'M2 6 L22 6 M2 10 L22 10 M2 14 L22 14 M2 18 L22 18',
    'M4 5 L4 7 M8 5 L8 7 M12 5 L12 7 M16 5 L16 7 M20 5 L20 7',
    'M4 13 L4 15 M10 13 L10 15 M16 13 L16 15',
    'M4 17 L4 19 M8 17 L8 19 M14 17 L14 19 M20 17 L20 19',
  ],
);

/** Queue: a stack of envelopes. */
export const queueStackIcon: DiagramIconDefinition = iconFromPaths(
  'queue_stack',
  'messaging',
  '0 0 24 24',
  [
    'M3 6 L21 6 L21 18 L3 18 Z',
    'M3 6 L12 13 L21 6',
    'M3 10 L21 10 M3 14 L21 14',
  ],
);

// ─── Network & edge ─────────────────────────────────────────────────────────

/** Gateway: a horizontal port-row icon. */
export const gatewayIconColored: DiagramIconDefinition = iconFromPaths(
  'gateway_colored',
  'network',
  '0 0 24 24',
  [
    'M3 8 L3 16 L21 16 L21 8 Z',
    'M3 8 L12 14 L21 8',
    'M7 16 L7 19 M11 16 L11 19 M15 16 L15 19',
  ],
);

/** Load balancer: a triangle splitting into three lines. */
export const loadBalancerIconColored: DiagramIconDefinition = iconFromPaths(
  'load_balancer_colored',
  'network',
  '0 0 24 24',
  [
    'M12 3 L20 11 L4 11 Z',
    'M12 11 L12 14 M5 14 L5 20 L9 20 L9 14 M12 14 L12 20 M15 14 L15 20 L19 20 L19 14',
  ],
);

/** CDN / globe: a globe with meridian and equator. */
export const globeIconColored: DiagramIconDefinition = iconFromPaths(
  'globe_colored',
  'network',
  '0 0 24 24',
  [
    'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 Z',
    'M2 12 L22 12 M12 2 C7 7 7 17 12 22 M12 2 C17 7 17 17 12 22',
  ],
);

/** Cloud: a soft cloud silhouette. */
export const cloudIconColored: DiagramIconDefinition = iconFromPaths(
  'cloud_colored',
  'network',
  '0 0 24 24',
  ['M6 18 A4 4 0 0 1 6 10 A5 5 0 0 1 16 9 A4 4 0 0 1 19 18 Z'],
);

// ─── Clients & people ───────────────────────────────────────────────────────

/** User: a head-and-shoulders silhouette (abstract, not photographic). */
export const userIconColored: DiagramIconDefinition = iconFromPaths(
  'user_colored',
  'client',
  '0 0 24 24',
  [
    'M12 4 A4 4 0 1 0 12 12 A4 4 0 1 0 12 4 Z',
    'M4 21 A8 8 0 0 1 20 21',
  ],
);

/** Mobile: a rounded phone with a small content line. */
export const mobileIconColored: DiagramIconDefinition = iconFromPaths(
  'mobile_colored',
  'client',
  '0 0 24 24',
  [
    'M7 3 L17 3 L17 21 L7 21 Z',
    'M11 18 L13 18',
    'M9 6 L15 6 M9 9 L13 9',
  ],
);

/** Browser: a window with a URL bar. */
export const browserIconColored: DiagramIconDefinition = iconFromPaths(
  'browser_colored',
  'client',
  '0 0 24 24',
  [
    'M3 5 L21 5 L21 19 L3 19 Z',
    'M3 9 L21 9',
    'M6 7 L6 7 M9 7 L9 7 M12 7 L18 7',
  ],
);

// ─── Security & observability ───────────────────────────────────────────────

/** Lock / vault: a padlock with a small keyhole. */
export const lockIconColored: DiagramIconDefinition = iconFromPaths(
  'lock_colored',
  'security',
  '0 0 24 24',
  [
    'M5 11 L5 20 L19 20 L19 11 Z',
    'M8 11 L8 7 A4 4 0 0 1 16 7 L16 11',
    'M12 14 L12 17',
  ],
);

/** Shield: a kite-shaped shield with a center seam. */
export const shieldIconColored: DiagramIconDefinition = iconFromPaths(
  'shield_colored',
  'security',
  '0 0 24 24',
  [
    'M12 3 L20 6 L20 12 C20 17 16 20 12 21 C8 20 4 17 4 12 L4 6 Z',
    'M12 8 L12 17',
  ],
);

/** Monitoring: a heart-rate polyline inside a frame. */
export const monitoringIconColored: DiagramIconDefinition = iconFromPaths(
  'monitoring_colored',
  'monitoring',
  '0 0 24 24',
  [
    'M3 5 L21 5 L21 19 L3 19 Z',
    'M3 14 L7 14 L9 10 L12 18 L15 8 L17 14 L21 14',
  ],
);

/** Alert / bell: a bell with a small clapper. */
export const bellIconColored: DiagramIconDefinition = iconFromPaths(
  'bell_colored',
  'monitoring',
  '0 0 24 24',
  [
    'M6 16 L6 11 A6 6 0 0 1 18 11 L18 16 L20 18 L4 18 Z',
    'M10 21 L14 21',
  ],
);
