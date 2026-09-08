import type { DiagramDocument, DiagramNode, DiagramEdge, NodeType, ThemeId, NodeShape, Port, Point, Size } from '@platform/diagram-schema';
import { generateId } from '@platform/diagram-core';

export function createEmptyDiagram(params: {
  name: string;
  description?: string;
  theme?: ThemeId;
  width?: number;
  height?: number;
}): DiagramDocument {
  return {
    schemaVersion: '1.0',
    rendererVersion: '1.0.0',
    theme: params.theme ?? 'editorial-dark',
    metadata: {
      title: params.name,
      description: params.description,
      width: params.width ?? 1200,
      height: params.height ?? 800,
    },
    nodes: [],
    edges: [],
    groups: [],
    annotations: [],
    customCollections: [],
  };
}

export function addNodeToDiagram(doc: DiagramDocument, nodeSpec: {
  type: NodeType;
  title: string;
  subtitle?: string;
  position?: Point;
  size?: Size;
  shape?: NodeShape;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  style?: DiagramNode['style'];
  data?: DiagramNode['data'];
  groupId?: string;
  ports?: Port[];
}): DiagramDocument {
  const newNode: DiagramNode = {
    id: generateId('node'),
    type: nodeSpec.type,
    shape: nodeSpec.shape ?? inferShapeFromType(nodeSpec.type),
    position: nodeSpec.position ?? { x: 100, y: 100 },
    size: nodeSpec.size ?? inferSizeFromType(nodeSpec.type),
    data: {
      title: nodeSpec.title,
      subtitle: nodeSpec.subtitle,
      icon: nodeSpec.icon,
      badge: nodeSpec.badge,
      badgeColor: nodeSpec.badgeColor,
      ...nodeSpec.data,
    },
    style: nodeSpec.style,
    groupId: nodeSpec.groupId,
    ports: nodeSpec.ports,
    zIndex: 0,
    locked: false,
  };

  return {
    ...doc,
    nodes: [...doc.nodes, newNode],
    metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
  };
}

export function addEdgeToDiagram(doc: DiagramDocument, edgeSpec: {
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortId?: string;
  targetPortId?: string;
  routing?: DiagramEdge['routing'];
  style?: DiagramEdge['style'];
  markerStart?: DiagramEdge['markerStart'];
  markerEnd?: DiagramEdge['markerEnd'];
  label?: string;
  sublabel?: string;
  stepNumber?: number;
  color?: string;
  strokeWidth?: number;
  dashStyle?: DiagramEdge['style'];
  animated?: boolean;
  animationType?: DiagramEdge['data'] extends { animationType?: infer T } ? T : never;
  animationSpeed?: DiagramEdge['data'] extends { animationSpeed?: infer T } ? T : never;
  flowColor?: string;
  waypoints?: Point[];
  data?: DiagramEdge['data'];
}): DiagramDocument {
  const newEdge: DiagramEdge = {
    id: generateId('edge'),
    source: { nodeId: edgeSpec.sourceNodeId, portId: edgeSpec.sourcePortId },
    target: { nodeId: edgeSpec.targetNodeId, portId: edgeSpec.targetPortId },
    routing: edgeSpec.routing ?? 'orthogonal',
    style: edgeSpec.style ?? 'solid',
    markerStart: edgeSpec.markerStart ?? 'none',
    markerEnd: edgeSpec.markerEnd ?? 'arrow',
    waypoints: edgeSpec.waypoints,
    data: {
      label: edgeSpec.label,
      sublabel: edgeSpec.sublabel,
      stepNumber: edgeSpec.stepNumber,
      color: edgeSpec.color,
      strokeWidth: edgeSpec.strokeWidth,
      dashStyle: edgeSpec.dashStyle,
      animated: edgeSpec.animated,
      animationType: edgeSpec.animationType,
      animationSpeed: edgeSpec.animationSpeed,
      flowColor: edgeSpec.flowColor,
      ...edgeSpec.data,
    },
    zIndex: 0,
  };

  return {
    ...doc,
    edges: [...doc.edges, newEdge],
    metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
  };
}

export function updateNodeInDiagram(doc: DiagramDocument, nodeId: string, patches: Partial<DiagramNode>): DiagramDocument {
  const nodeIndex = doc.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) throw new Error(`Node not found: ${nodeId}`);
  
  const updatedNodes = [...doc.nodes];
  updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], ...patches };
  
  return { ...doc, nodes: updatedNodes, metadata: { ...doc.metadata, updatedAt: new Date().toISOString() } };
}

export function deleteNodeFromDiagram(doc: DiagramDocument, nodeId: string): DiagramDocument {
  return {
    ...doc,
    nodes: doc.nodes.filter(n => n.id !== nodeId),
    edges: doc.edges.filter(e => e.source.nodeId !== nodeId && e.target.nodeId !== nodeId),
    metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
  };
}

function inferShapeFromType(type: NodeType): NodeShape {
  const shapeMap: Record<NodeType, NodeShape> = {
    user: 'user_avatar',
    browser: 'browser_window',
    mobile: 'device_mobile',
    api_gateway: 'gateway_ribbon',
    load_balancer: 'hexagon',
    service: 'rounded_card',
    worker: 'serverless_function',
    server: 'rounded_card',
    container: 'bento_card',
    database: 'cylinder',
    postgresql: 'cylinder',
    cache: 'hexagon',
    redis: 'hexagon',
    queue: 'queue_buffer',
    kafka: 'event_stream',
    object_storage: 'data_cylinder',
    cdn: 'cloud',
    search: 'diamond',
    cloud: 'cloud',
    monitoring: 'tier_card',
    lock: 'hexagon',
    code: 'note',
    custom: 'rounded_card',
  };
  return shapeMap[type] ?? 'rounded_card';
}

function inferSizeFromType(type: NodeType): Size {
  const sizeMap: Partial<Record<NodeType, Size>> = {
    user: { width: 120, height: 120 },
    browser: { width: 200, height: 140 },
    mobile: { width: 100, height: 180 },
    database: { width: 140, height: 200 },
    queue: { width: 180, height: 100 },
    cloud: { width: 200, height: 120 },
  };
  return sizeMap[type] ?? { width: 180, height: 100 };
}

export function cloneDiagram(doc: DiagramDocument): DiagramDocument {
  return JSON.parse(JSON.stringify(doc));
}

export function mergeDiagrams(base: DiagramDocument, updates: Partial<DiagramDocument>): DiagramDocument {
  return {
    ...base,
    ...updates,
    nodes: updates.nodes ?? base.nodes,
    edges: updates.edges ?? base.edges,
    groups: updates.groups ?? base.groups,
    annotations: updates.annotations ?? base.annotations,
    customCollections: updates.customCollections ?? base.customCollections,
    metadata: { ...base.metadata, ...updates.metadata, updatedAt: new Date().toISOString() },
  };
}