import type { DiagramDocument, DiagramNode, DiagramEdge } from '@platform/diagram-schema';
import { applyLayoutToDocument } from '@platform/diagram-layout';

export class AiGeneratorService {
  async generateFromPrompt(prompt: string, theme = 'polished-dark'): Promise<DiagramDocument> {
    const lower = prompt.toLowerCase();

    // Semantic architecture compiler based on prompt keywords
    let title = 'Custom Architecture System';
    let nodes: DiagramNode[] = [];
    let edges: DiagramEdge[] = [];

    if (lower.includes('stream') || lower.includes('video') || lower.includes('kafka') || lower.includes('event')) {
      title = 'Event-Driven Streaming & Media Processing';
      nodes = [
        {
          id: 'node-client',
          type: 'browser',
          position: { x: 80, y: 220 },
          size: { width: 150, height: 72 },
          data: { title: 'Web / Mobile Client', subtitle: 'Video Ingestion', role: 'client', icon: 'browser' },
        },
        {
          id: 'node-cdn',
          type: 'cdn',
          position: { x: 300, y: 220 },
          size: { width: 160, height: 76 },
          data: { title: 'Edge CDN', subtitle: 'Global Ingestion', role: 'network', icon: 'cdn' },
        },
        {
          id: 'node-gateway',
          type: 'api_gateway',
          position: { x: 520, y: 220 },
          size: { width: 180, height: 80 },
          data: { title: 'Ingestion Gateway', subtitle: 'Chunked Uploads', role: 'network', icon: 'api_gateway' },
        },
        {
          id: 'node-kafka',
          type: 'kafka',
          position: { x: 770, y: 220 },
          size: { width: 170, height: 72 },
          data: { title: 'Kafka Stream', subtitle: 'Raw Upload Events', role: 'messaging', icon: 'kafka' },
        },
        {
          id: 'node-worker',
          type: 'worker',
          position: { x: 1010, y: 150 },
          size: { width: 170, height: 72 },
          data: { title: 'Transcoder Worker', subtitle: 'HLS / DASH Formats', role: 'compute', icon: 'worker' },
        },
        {
          id: 'node-s3',
          type: 'object_storage',
          position: { x: 1010, y: 300 },
          size: { width: 170, height: 76 },
          data: { title: 'S3 Storage', subtitle: 'Media & Segments', role: 'storage', icon: 'object_storage' },
        },
      ];
      edges = [
        { id: 'e1', source: { nodeId: 'node-client' }, target: { nodeId: 'node-cdn' }, data: { label: 'Upload Stream' } },
        { id: 'e2', source: { nodeId: 'node-cdn' }, target: { nodeId: 'node-gateway' }, data: { label: 'Forward' } },
        { id: 'e3', source: { nodeId: 'node-gateway' }, target: { nodeId: 'node-kafka' }, data: { label: 'Publish Event' } },
        { id: 'e4', source: { nodeId: 'node-kafka' }, target: { nodeId: 'node-worker' }, data: { label: 'Consume' } },
        { id: 'e5', source: { nodeId: 'node-worker' }, target: { nodeId: 'node-s3' }, data: { label: 'Store Output' } },
      ];
    } else if (lower.includes('auth') || lower.includes('url') || lower.includes('rate') || lower.includes('cache')) {
      title = 'Distributed Caching & Auth Architecture';
      nodes = [
        {
          id: 'node-user',
          type: 'user',
          position: { x: 80, y: 200 },
          size: { width: 140, height: 72 },
          data: { title: 'Client Apps', subtitle: 'Public Requests', role: 'client', icon: 'user' },
        },
        {
          id: 'node-lb',
          type: 'load_balancer',
          position: { x: 300, y: 200 },
          size: { width: 170, height: 76 },
          data: { title: 'Load Balancer', subtitle: 'TLS Termination', role: 'network', icon: 'load_balancer' },
        },
        {
          id: 'node-auth',
          type: 'service',
          position: { x: 540, y: 120 },
          size: { width: 180, height: 76 },
          data: { title: 'Auth Service', subtitle: 'OAuth2 / JWT', role: 'compute', icon: 'service' },
        },
        {
          id: 'node-app',
          type: 'service',
          position: { x: 540, y: 280 },
          size: { width: 180, height: 76 },
          data: { title: 'Core API Server', subtitle: 'REST Endpoints', role: 'compute', icon: 'service' },
        },
        {
          id: 'node-redis',
          type: 'redis',
          position: { x: 800, y: 120 },
          size: { width: 160, height: 72 },
          data: { title: 'Redis Cache', subtitle: 'Session & Quotas', role: 'cache', icon: 'redis' },
        },
        {
          id: 'node-db',
          type: 'postgresql',
          position: { x: 800, y: 280 },
          size: { width: 170, height: 76 },
          data: { title: 'Primary DB', subtitle: 'User & Business Data', role: 'storage', icon: 'postgresql' },
        },
      ];
      edges = [
        { id: 'e1', source: { nodeId: 'node-user' }, target: { nodeId: 'node-lb' }, data: { label: 'HTTPS' } },
        { id: 'e2', source: { nodeId: 'node-lb' }, target: { nodeId: 'node-auth' }, data: { label: 'Validate Token' } },
        { id: 'e3', source: { nodeId: 'node-lb' }, target: { nodeId: 'node-app' }, data: { label: 'Authorized' } },
        { id: 'e4', source: { nodeId: 'node-auth' }, target: { nodeId: 'node-redis' }, data: { label: 'Session Check' } },
        { id: 'e5', source: { nodeId: 'node-app' }, target: { nodeId: 'node-redis' }, data: { label: 'Read Cache' } },
        { id: 'e6', source: { nodeId: 'node-app' }, target: { nodeId: 'node-db' }, data: { label: 'Persist' } },
      ];
    } else {
      title = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
      nodes = [
        {
          id: 'node-client',
          type: 'browser',
          position: { x: 80, y: 220 },
          size: { width: 150, height: 72 },
          data: { title: 'Client App', subtitle: 'Web / Mobile UI', role: 'client', icon: 'browser' },
        },
        {
          id: 'node-gateway',
          type: 'api_gateway',
          position: { x: 320, y: 220 },
          size: { width: 180, height: 80 },
          data: { title: 'API Gateway', subtitle: 'Routing & Rate Limiting', role: 'network', icon: 'api_gateway' },
        },
        {
          id: 'node-service',
          type: 'service',
          position: { x: 580, y: 220 },
          size: { width: 180, height: 76 },
          data: { title: 'Backend Service', subtitle: 'Core Logic', role: 'compute', icon: 'service' },
        },
        {
          id: 'node-db',
          type: 'postgresql',
          position: { x: 840, y: 220 },
          size: { width: 170, height: 76 },
          data: { title: 'PostgreSQL DB', subtitle: 'Persistent Store', role: 'storage', icon: 'postgresql' },
        },
      ];
      edges = [
        { id: 'e1', source: { nodeId: 'node-client' }, target: { nodeId: 'node-gateway' }, data: { label: 'Request' } },
        { id: 'e2', source: { nodeId: 'node-gateway' }, target: { nodeId: 'node-service' }, data: { label: 'Route' } },
        { id: 'e3', source: { nodeId: 'node-service' }, target: { nodeId: 'node-db' }, data: { label: 'Query / Commit' } },
      ];
    }

    const initialDoc: DiagramDocument = {
      schemaVersion: '1.0',
      rendererVersion: '1.0.0',
      theme: (theme as any) ?? 'polished-dark',
      metadata: {
        title,
        description: `Generated architecture diagram for prompt: "${prompt}"`,
        width: 1250,
        height: 700,
        background: { type: 'grid', gridSize: 24 },
        author: 'AI Architectural Generator',
      },
      nodes,
      edges,
      groups: [],
      annotations: [],
    };

    return await applyLayoutToDocument(initialDoc, { direction: 'horizontal', nodeSpacing: 56 });
  }
}

export const aiGeneratorService = new AiGeneratorService();
