export function generateId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36).slice(-4);
  return `${prefix}-${timePart}${randomPart}`;
}

export function createNodeId(type: string): string {
  return generateId(`node-${type}`);
}

export function createEdgeId(sourceNodeId: string, targetNodeId: string): string {
  return `edge-${sourceNodeId}-${targetNodeId}-${Math.random().toString(36).substring(2, 6)}`;
}

export function createGroupId(): string {
  return generateId('group');
}

export function createAnnotationId(type: string): string {
  return generateId(`anno-${type}`);
}
