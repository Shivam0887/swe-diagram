import type { DiagramDocument } from '../types';

/**
 * Polished sample diagrams — the "ByteByteGo-flavored" reference set.
 *
 * These three diagrams are hand-tuned to exercise the new visual system:
 * bento cards, data cylinders, event streams, serverless functions, user
 * avatars, tier cards, gateway ribbons, and the colored architecture icon
 * pack. They are reference examples, not derivative works of any specific
 * creator — all node arrangements, labels, and edge semantics are
 * authored fresh.
 */

// ─────────────────────────────────────────────────────────────────────────
// 1. AWS Three-Tier with ElastiCache
// ─────────────────────────────────────────────────────────────────────────

export const awsThreeTierElastiCache: DiagramDocument = {
  schemaVersion: '1.0',
  rendererVersion: '1.0.0',
  theme: 'polished-dark',
  metadata: {
    title: 'AWS Three-Tier with ElastiCache',
    description: 'A classic three-tier web architecture on AWS with a managed Redis read cache.',
    width: 1320,
    height: 760,
    background: { type: 'grid', gridSize: 24 },
    author: 'platform / reference',
    tags: ['aws', 'three-tier', 'elasticache', 'rds', 'reference'],
  },
  nodes: [
    // Tier 1 — Clients
    {
      id: 'node-client',
      type: 'user',
      shape: 'user_avatar',
      position: { x: 60, y: 320 },
      size: { width: 170, height: 96 },
      data: { title: 'Customer', subtitle: 'Web / Mobile', role: 'client', icon: 'user_colored' },
    },

    // Tier 2 — Edge / routing
    {
      id: 'node-cdn',
      type: 'cdn',
      shape: 'bento_card',
      position: { x: 290, y: 200 },
      size: { width: 200, height: 92 },
      data: { title: 'CloudFront', subtitle: 'Global Edge Cache', badge: 'CDN', role: 'network', icon: 'globe_colored' },
    },
    {
      id: 'node-alb',
      type: 'load_balancer',
      shape: 'bento_card',
      position: { x: 290, y: 410 },
      size: { width: 200, height: 92 },
      data: { title: 'Application LB', subtitle: 'Layer-7 Routing', badge: 'ALB', role: 'network', icon: 'load_balancer_colored' },
    },

    // Tier 3 — Application services
    {
      id: 'node-api-gateway',
      type: 'api_gateway',
      shape: 'gateway_ribbon',
      position: { x: 550, y: 200 },
      size: { width: 220, height: 92 },
      data: { title: 'API Gateway', subtitle: 'Auth + Rate Limit', badge: 'Kong', role: 'network', icon: 'gateway_colored', pulsing: true },
    },
    {
      id: 'node-order',
      type: 'service',
      shape: 'bento_card',
      position: { x: 550, y: 330 },
      size: { width: 200, height: 92 },
      data: { title: 'Order Service', subtitle: 'Go / gRPC', badge: 'Go', role: 'compute', icon: 'compute_service' },
    },
    {
      id: 'node-catalog',
      type: 'service',
      shape: 'bento_card',
      position: { x: 550, y: 460 },
      size: { width: 200, height: 92 },
      data: { title: 'Catalog Service', subtitle: 'Python / FastAPI', badge: 'Py', role: 'compute', icon: 'compute_service' },
    },

    // Tier 4 — Async / worker
    {
      id: 'node-queue',
      type: 'kafka',
      shape: 'event_stream',
      position: { x: 820, y: 130 },
      size: { width: 220, height: 88 },
      data: {
        title: 'Event Bus',
        subtitle: 'MSK (Kafka)',
        badge: 'Kafka',
        role: 'messaging',
        icon: 'event_stream',
        tags: ['orders', 'inventory', 'audit'],
      },
    },
    {
      id: 'node-worker',
      type: 'worker',
      shape: 'bento_card',
      position: { x: 820, y: 260 },
      size: { width: 200, height: 92 },
      data: { title: 'Fulfillment Worker', subtitle: 'Consumer', badge: 'ECS', role: 'compute', icon: 'cog' },
    },

    // Tier 5 — Data
    {
      id: 'node-redis',
      type: 'redis',
      shape: 'data_cylinder',
      position: { x: 820, y: 400 },
      size: { width: 168, height: 110 },
      data: { title: 'ElastiCache', subtitle: 'Redis / Read Cache', badge: 'Redis', role: 'cache', icon: 'cache_colored' },
    },
    {
      id: 'node-rds',
      type: 'postgresql',
      shape: 'data_cylinder',
      position: { x: 1010, y: 400 },
      size: { width: 168, height: 110 },
      data: { title: 'RDS Primary', subtitle: 'PostgreSQL 16', badge: 'PG', role: 'storage', icon: 'sql_db' },
    },
    {
      id: 'node-replica',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 1200, y: 400 },
      size: { width: 100, height: 110 },
      data: { title: 'Replica', subtitle: 'Read-only', role: 'storage', icon: 'sql_db' },
    },
    {
      id: 'node-s3',
      type: 'object_storage',
      shape: 'bento_card',
      position: { x: 820, y: 560 },
      size: { width: 200, height: 92 },
      data: { title: 'S3', subtitle: 'Product Images', badge: 'S3', role: 'storage', icon: 'bucket' },
    },
  ],
  edges: [
    { id: 'e1', source: { nodeId: 'node-client' }, target: { nodeId: 'node-cdn' }, routing: 'orthogonal', data: { label: 'HTTPS', stepNumber: 1, animated: true, flowColor: '#5EEAD4' } },
    { id: 'e2', source: { nodeId: 'node-cdn' }, target: { nodeId: 'node-alb' }, routing: 'orthogonal', data: { label: 'origin', stepNumber: 2, animated: true, flowColor: '#5EEAD4' } },
    { id: 'e3', source: { nodeId: 'node-alb' }, target: { nodeId: 'node-api-gateway' }, routing: 'orthogonal', data: { label: 'forward', stepNumber: 3, animated: true, flowColor: '#FF5A1F' } },
    { id: 'e4', source: { nodeId: 'node-api-gateway' }, target: { nodeId: 'node-order' }, routing: 'orthogonal', data: { label: 'POST /orders', animated: true, flowColor: '#FF5A1F' } },
    { id: 'e5', source: { nodeId: 'node-api-gateway' }, target: { nodeId: 'node-catalog' }, routing: 'orthogonal', data: { label: 'GET /catalog', animated: true, flowColor: '#FF5A1F' } },
    { id: 'e6', source: { nodeId: 'node-order' }, target: { nodeId: 'node-redis' }, routing: 'orthogonal', data: { label: 'read cache', animated: true, flowColor: '#5EEAD4' } },
    { id: 'e7', source: { nodeId: 'node-order' }, target: { nodeId: 'node-rds' }, routing: 'orthogonal', data: { label: 'write tx', stepNumber: 4, animated: true, flowColor: '#E8C580' } },
    { id: 'e8', source: { nodeId: 'node-order' }, target: { nodeId: 'node-queue' }, routing: 'orthogonal', data: { label: 'publish', stepNumber: 5, animated: true, flowColor: '#E8C580' } },
    { id: 'e9', source: { nodeId: 'node-queue' }, target: { nodeId: 'node-worker' }, routing: 'orthogonal', data: { label: 'consume', animated: true, flowColor: '#E8C580' } },
    { id: 'e10', source: { nodeId: 'node-catalog' }, target: { nodeId: 'node-s3' }, routing: 'orthogonal', data: { label: 'assets', animated: true, flowColor: '#A5B4FC' } },
    { id: 'e11', source: { nodeId: 'node-rds' }, target: { nodeId: 'node-replica' }, routing: 'orthogonal', data: { label: 'replicate', animated: true, flowColor: '#5EEAD4' } },
  ],
  groups: [
    { id: 'g-edge', title: 'EDGE', subtitle: 'Global edge and routing', position: { x: 280, y: 170 }, size: { width: 220, height: 360 }, style: 'swimlane' },
    { id: 'g-app', title: 'APPLICATION', subtitle: 'Stateless service tier', position: { x: 540, y: 170 }, size: { width: 230, height: 400 }, style: 'container' },
    { id: 'g-data', title: 'PERSISTENCE & ASYNC', subtitle: 'Managed data services', position: { x: 810, y: 100 }, size: { width: 500, height: 570 }, style: 'boundary' },
  ],
  annotations: [
    {
      id: 'a-step-1',
      type: 'callout',
      position: { x: 60, y: 80 },
      size: { width: 240, height: 70 },
      title: 'Read path',
      text: 'CDN → ALB → API Gateway → Service → Cache → DB. Hot reads never reach primary.',
      variant: 'tip',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// 2. Kafka Exactly-Once Semantics
// ─────────────────────────────────────────────────────────────────────────

export const kafkaExactlyOnce: DiagramDocument = {
  schemaVersion: '1.0',
  rendererVersion: '1.0.0',
  theme: 'polished-dark',
  metadata: {
    title: 'Kafka Exactly-Once Semantics',
    description: 'Idempotent producer + transactional reads with consumer offset commits in the same transaction.',
    width: 1320,
    height: 720,
    background: { type: 'grid', gridSize: 24 },
    author: 'platform / reference',
    tags: ['kafka', 'streaming', 'exactly-once', 'reference'],
  },
  nodes: [
    {
      id: 'node-producer',
      type: 'service',
      shape: 'bento_card',
      position: { x: 60, y: 200 },
      size: { width: 220, height: 92 },
      data: { title: 'Order Producer', subtitle: 'Idempotent', badge: 'Go', role: 'compute', icon: 'compute_service' },
    },
    {
      id: 'node-pid',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 60, y: 380 },
      size: { width: 220, height: 110 },
      data: { title: 'Producer ID State', subtitle: 'Sequence Tracking', badge: 'Internal', role: 'storage', icon: 'key_value' },
    },
    {
      id: 'node-kafka',
      type: 'kafka',
      shape: 'event_stream',
      position: { x: 380, y: 290 },
      size: { width: 260, height: 110 },
      data: {
        title: 'Kafka Cluster',
        subtitle: '3× Partitions',
        badge: 'Kafka',
        role: 'messaging',
        icon: 'event_stream',
        tags: ['orders.0', 'orders.1', 'orders.2'],
      },
    },
    {
      id: 'node-tx',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 380, y: 460 },
      size: { width: 260, height: 110 },
      data: { title: '__consumer_offsets', subtitle: 'Transactional Log', role: 'storage', icon: 'key_value' },
    },
    {
      id: 'node-consumer',
      type: 'service',
      shape: 'bento_card',
      position: { x: 740, y: 200 },
      size: { width: 220, height: 92 },
      data: { title: 'Order Consumer', subtitle: 'Read-Process-Write', badge: 'Java', role: 'compute', icon: 'compute_service' },
    },
    {
      id: 'node-outbox',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 740, y: 400 },
      size: { width: 220, height: 110 },
      data: { title: 'Outbox Table', subtitle: 'PostgreSQL', badge: 'PG', role: 'storage', icon: 'sql_db' },
    },
    {
      id: 'node-downstream',
      type: 'worker',
      shape: 'bento_card',
      position: { x: 1040, y: 290 },
      size: { width: 220, height: 92 },
      data: { title: 'Downstream', subtitle: 'Inventory + Email', badge: 'Workers', role: 'compute', icon: 'cog' },
    },
  ],
  edges: [
    { id: 'e1', source: { nodeId: 'node-producer' }, target: { nodeId: 'node-kafka' }, routing: 'orthogonal', data: { label: 'send(records)', stepNumber: 1, animated: true, flowColor: '#FF5A1F' } },
    { id: 'e2', source: { nodeId: 'node-pid' }, target: { nodeId: 'node-producer' }, routing: 'orthogonal', data: { label: 'PID + epoch', animated: true, flowColor: '#5EEAD4' } },
    { id: 'e3', source: { nodeId: 'node-kafka' }, target: { nodeId: 'node-consumer' }, routing: 'orthogonal', data: { label: 'poll()', stepNumber: 2, animated: true, flowColor: '#E8C580' } },
    { id: 'e4', source: { nodeId: 'node-consumer' }, target: { nodeId: 'node-outbox' }, routing: 'orthogonal', data: { label: 'BEGIN TX', stepNumber: 3, animated: true, flowColor: '#A5B4FC' } },
    { id: 'e5', source: { nodeId: 'node-consumer' }, target: { nodeId: 'node-tx' }, routing: 'orthogonal', data: { label: 'commit offsets', stepNumber: 4, animated: true, flowColor: '#A5B4FC' } },
    { id: 'e6', source: { nodeId: 'node-outbox' }, target: { nodeId: 'node-downstream' }, routing: 'orthogonal', data: { label: 'read outbox', stepNumber: 5, animated: true, flowColor: '#E8C580' } },
  ],
  groups: [
    { id: 'g-prod', title: 'PRODUCER', subtitle: 'Idempotent + transactional', position: { x: 50, y: 170 }, size: { width: 240, height: 350 }, style: 'container' },
    { id: 'g-broker', title: 'BROKERS', subtitle: 'Partitioned commit log', position: { x: 370, y: 260 }, size: { width: 280, height: 340 }, style: 'swimlane' },
    { id: 'g-cons', title: 'CONSUMER', subtitle: 'Read-process-write in a single transaction', position: { x: 730, y: 170 }, size: { width: 240, height: 370 }, style: 'container' },
  ],
  annotations: [
    {
      id: 'a-1',
      type: 'callout',
      position: { x: 60, y: 60 },
      size: { width: 280, height: 80 },
      title: 'Atomicity guarantee',
      text: 'Consumer offset commit + business write succeed together or roll back together — no duplicates, no gaps.',
      variant: 'info',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// 3. CQRS + Event Sourcing
// ─────────────────────────────────────────────────────────────────────────

export const cqrsEventSourcing: DiagramDocument = {
  schemaVersion: '1.0',
  rendererVersion: '1.0.0',
  theme: 'polished-dark',
  metadata: {
    title: 'CQRS with Event Sourcing',
    description: 'A write path commits events to a log; read models project those events into queryable views.',
    width: 1320,
    height: 760,
    background: { type: 'grid', gridSize: 24 },
    author: 'platform / reference',
    tags: ['cqrs', 'event-sourcing', 'kafka', 'elasticsearch', 'reference'],
  },
  nodes: [
    // Write path
    {
      id: 'node-client',
      type: 'user',
      shape: 'user_avatar',
      position: { x: 60, y: 320 },
      size: { width: 170, height: 96 },
      data: { title: 'Operator', subtitle: 'Admin Console', role: 'client', icon: 'user_colored' },
    },
    {
      id: 'node-cmd',
      type: 'api_gateway',
      shape: 'gateway_ribbon',
      position: { x: 290, y: 320 },
      size: { width: 220, height: 92 },
      data: { title: 'Command API', subtitle: 'Validates + dispatches', badge: 'gRPC', role: 'network', icon: 'gateway_colored' },
    },
    {
      id: 'node-aggregate',
      type: 'service',
      shape: 'bento_card',
      position: { x: 560, y: 200 },
      size: { width: 220, height: 92 },
      data: { title: 'Aggregate', subtitle: 'Order / Account', badge: 'Domain', role: 'compute', icon: 'compute_service' },
    },
    {
      id: 'node-eventlog',
      type: 'kafka',
      shape: 'event_stream',
      position: { x: 560, y: 340 },
      size: { width: 220, height: 110 },
      data: {
        title: 'Event Log',
        subtitle: 'Append-only',
        badge: 'Kafka',
        role: 'messaging',
        icon: 'event_stream',
        tags: ['OrderCreated', 'OrderPaid', 'OrderShipped'],
      },
    },
    {
      id: 'node-snapshots',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 560, y: 500 },
      size: { width: 220, height: 110 },
      data: { title: 'Snapshot Store', subtitle: 'Aggregate State', badge: 'PG', role: 'storage', icon: 'sql_db' },
    },

    // Read path
    {
      id: 'node-projector',
      type: 'worker',
      shape: 'bento_card',
      position: { x: 850, y: 200 },
      size: { width: 220, height: 92 },
      data: { title: 'Projection Worker', subtitle: 'Builds read model', badge: 'Stream', role: 'compute', icon: 'cog' },
    },
    {
      id: 'node-search',
      type: 'search',
      shape: 'data_cylinder',
      position: { x: 1100, y: 200 },
      size: { width: 180, height: 110 },
      data: { title: 'Search Index', subtitle: 'OpenSearch', badge: 'OS', role: 'storage', icon: 'search_index' },
    },
    {
      id: 'node-readmodel',
      type: 'database',
      shape: 'data_cylinder',
      position: { x: 1100, y: 360 },
      size: { width: 180, height: 110 },
      data: { title: 'Read DB', subtitle: 'Materialized View', badge: 'PG', role: 'storage', icon: 'sql_db' },
    },
    {
      id: 'node-query',
      type: 'api_gateway',
      shape: 'gateway_ribbon',
      position: { x: 850, y: 410 },
      size: { width: 220, height: 92 },
      data: { title: 'Query API', subtitle: 'Reads from view', badge: 'REST', role: 'network', icon: 'gateway_colored' },
    },
  ],
  edges: [
    { id: 'e1', source: { nodeId: 'node-client' }, target: { nodeId: 'node-cmd' }, routing: 'orthogonal', data: { label: 'command', stepNumber: 1, animated: true, flowColor: '#FF5A1F' } },
    { id: 'e2', source: { nodeId: 'node-cmd' }, target: { nodeId: 'node-aggregate' }, routing: 'orthogonal', data: { label: 'dispatch', animated: true, flowColor: '#FF5A1F' } },
    { id: 'e3', source: { nodeId: 'node-aggregate' }, target: { nodeId: 'node-eventlog' }, routing: 'orthogonal', data: { label: 'emit', stepNumber: 2, animated: true, flowColor: '#E8C580' } },
    { id: 'e4', source: { nodeId: 'node-aggregate' }, target: { nodeId: 'node-snapshots' }, routing: 'orthogonal', data: { label: 'snapshot', animated: true, flowColor: '#5EEAD4' } },
    { id: 'e5', source: { nodeId: 'node-eventlog' }, target: { nodeId: 'node-projector' }, routing: 'orthogonal', data: { label: 'subscribe', stepNumber: 3, animated: true, flowColor: '#E8C580' } },
    { id: 'e6', source: { nodeId: 'node-projector' }, target: { nodeId: 'node-search' }, routing: 'orthogonal', data: { label: 'index', animated: true, flowColor: '#5EEAD4' } },
    { id: 'e7', source: { nodeId: 'node-projector' }, target: { nodeId: 'node-readmodel' }, routing: 'orthogonal', data: { label: 'update', animated: true, flowColor: '#5EEAD4' } },
    { id: 'e8', source: { nodeId: 'node-client' }, target: { nodeId: 'node-query' }, routing: 'orthogonal', data: { label: 'query', animated: true, flowColor: '#FF5A1F' } },
    { id: 'e9', source: { nodeId: 'node-query' }, target: { nodeId: 'node-search' }, routing: 'orthogonal', data: { label: 'GET /search', animated: true, flowColor: '#A5B4FC' } },
    { id: 'e10', source: { nodeId: 'node-query' }, target: { nodeId: 'node-readmodel' }, routing: 'orthogonal', data: { label: 'GET /view', animated: true, flowColor: '#A5B4FC' } },
  ],
  groups: [
    { id: 'g-write', title: 'WRITE SIDE', subtitle: 'Commands and event log', position: { x: 280, y: 170 }, size: { width: 510, height: 470 }, style: 'container' },
    { id: 'g-read', title: 'READ SIDE', subtitle: 'Materialized projections', position: { x: 840, y: 170 }, size: { width: 460, height: 330 }, style: 'swimlane' },
  ],
  annotations: [
    {
      id: 'a-1',
      type: 'callout',
      position: { x: 60, y: 60 },
      size: { width: 280, height: 80 },
      title: 'Event log is the source of truth',
      text: 'The read models are derived. Rebuild any view from scratch by replaying the log.',
      variant: 'tip',
    },
  ],
};
