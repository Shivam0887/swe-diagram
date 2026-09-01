import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs';
import type { DiagramDocument } from '@platform/diagram-schema';
import type { LayoutOptions, LayoutResult } from '../types';
import { generateOrthogonalPoints } from '../routing/cleanRoute';
import { generateFilletOrthogonalPath } from '../routing/filletPath';

const elk = new ELK();

export async function computeElkLayout(
  doc: DiagramDocument,
  options: LayoutOptions = {}
): Promise<LayoutResult> {
  const isHorizontal = (options.direction ?? 'horizontal') === 'horizontal';
  const nodeSpacing = options.nodeSpacing ?? 48;
  const layerSpacing = options.layerSpacing ?? 64;

  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': isHorizontal ? 'RIGHT' : 'DOWN',
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
      'elk.spacing.edgeNode': '32',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
    },
    children: doc.nodes.map((node) => ({
      id: node.id,
      width: node.size.width,
      height: node.size.height,
    })),
    edges: doc.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source.nodeId],
      targets: [edge.target.nodeId],
    })),
  };

  try {
    const layouted = await elk.layout(elkGraph);
    const nodeMap = new Map<string, { x: number; y: number; width: number; height: number }>();

    const nodesResult = (layouted.children ?? []).map((c) => {
      const pos = { x: c.x ?? 0, y: c.y ?? 0 };
      const size = { width: c.width ?? 160, height: c.height ?? 76 };
      nodeMap.set(c.id, { ...pos, ...size });
      return { id: c.id, position: pos, size };
    });

    const edgesResult = doc.edges.map((edge) => {
      const sourceNode = nodeMap.get(edge.source.nodeId);
      const targetNode = nodeMap.get(edge.target.nodeId);

      if (!sourceNode || !targetNode) {
        return { id: edge.id, waypoints: edge.waypoints ?? [] };
      }

      // Compute connection points from source right/bottom to target left/top
      const sourcePoint = isHorizontal
        ? { x: sourceNode.x + sourceNode.width, y: sourceNode.y + sourceNode.height / 2 }
        : { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height };

      const targetPoint = isHorizontal
        ? { x: targetNode.x, y: targetNode.y + targetNode.height / 2 }
        : { x: targetNode.x + targetNode.width / 2, y: targetNode.y };

      const waypoints = generateOrthogonalPoints(
        sourcePoint,
        targetPoint,
        isHorizontal ? 'horizontal' : 'vertical'
      );
      const pathData = generateFilletOrthogonalPath(waypoints, 10);

      return {
        id: edge.id,
        waypoints,
        pathData,
      };
    });

    return {
      nodes: nodesResult,
      edges: edgesResult,
      width: Math.max(layouted.width ?? 1000, 1000),
      height: Math.max(layouted.height ?? 600, 600),
    };
  } catch (error) {
    console.error('ELK Layout computation fallback:', error);
    // Fallback: preserve original positions
    return {
      nodes: doc.nodes.map((n) => ({ id: n.id, position: n.position, size: n.size })),
      edges: doc.edges.map((e) => ({ id: e.id, waypoints: e.waypoints ?? [] })),
      width: doc.metadata.width,
      height: doc.metadata.height,
    };
  }
}

export async function applyLayoutToDocument(
  doc: DiagramDocument,
  options: LayoutOptions = {}
): Promise<DiagramDocument> {
  const result = await computeElkLayout(doc, options);

  const updatedNodes = doc.nodes.map((n) => {
    const layoutNode = result.nodes.find((ln) => ln.id === n.id);
    if (!layoutNode) return n;
    return { ...n, position: layoutNode.position, size: layoutNode.size };
  });

  const updatedEdges = doc.edges.map((e) => {
    const layoutEdge = result.edges.find((le) => le.id === e.id);
    if (!layoutEdge) return e;
    return { ...e, waypoints: layoutEdge.waypoints };
  });

  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      width: Math.max(result.width + 80, doc.metadata.width),
      height: Math.max(result.height + 80, doc.metadata.height),
    },
    nodes: updatedNodes,
    edges: updatedEdges,
  };
}
