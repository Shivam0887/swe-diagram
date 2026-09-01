---
name: diagram-layout-routing
description: Procedural workflow for running automatic graph layout with ELK.js, port assignment, orthogonal connector routing, and route post-processing.
---

# Skill: Diagram Layout & Connector Routing

Use this skill when implementing, debugging, or extending the graph layout engine and connector routing algorithms in `@platform/diagram-layout`.

---

## 1. Layout Engine Pipeline

```text
Diagram Document
      ↓
Convert to ELK Graph Structure
      ↓
Execute ELK.js Layout (Layered / Hierarchical)
      ↓
Extract Raw Coordinates & Waypoints
      ↓
Apply Platform Post-Processing (Route Cleanup & Spacing)
      ↓
Return Normalized LayoutResult (Geometry Only)
```

---

## 2. ELK Graph Transformation

In `packages/diagram-layout/src/elk/adapter.ts`:
- Map `DiagramNode` instances to ELK nodes with measured `width` and `height`.
- Map `DiagramEdge` instances to ELK edges, attaching source and target port IDs.
- Configure ELK layout options:
  - `elk.algorithm`: `'layered'`
  - `elk.direction`: `'RIGHT'` (for horizontal) or `'DOWN'` (for vertical)
  - `elk.spacing.nodeNode`: `48`
  - `elk.spacing.edgeNode`: `32`
  - `elk.layered.spacing.edgeEdge`: `20`
  - `elk.padding`: `[top=32, left=32, bottom=32, right=32]`

```ts
import ELK from 'elkjs';
import type { ElkNode } from 'elkjs';
import type { DiagramDocument } from '@platform/diagram-schema';

const elk = new ELK();

export async function computeElkLayout(doc: DiagramDocument, options: LayoutOptions): Promise<ElkNode> {
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options.direction === 'horizontal' ? 'RIGHT' : 'DOWN',
      'elk.spacing.nodeNode': '48',
      'elk.layered.spacing.nodeNodeBetweenLayers': '64',
    },
    children: doc.nodes.map((node) => ({
      id: node.id,
      width: node.size.width,
      height: node.size.height,
      ports: (node.ports ?? []).map((port) => ({
        id: port.id,
        properties: { 'port.side': port.position.toUpperCase() },
      })),
    })),
    edges: doc.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source.portId ?? edge.source.nodeId],
      targets: [edge.target.portId ?? edge.target.nodeId],
    })),
  };

  return await elk.layout(elkGraph);
}
```

---

## 3. Connector Routing Post-Processing

Raw ELK waypoint outputs often produce visual artifacts (stair-stepping or redundant tiny bends).
In `packages/diagram-layout/src/routing/cleanRoute.ts`:

1. **Collinear Point Merging**: Remove intermediate waypoints that fall on the same straight line segment.
2. **Tiny Segment Elimination**: If a segment is shorter than minimum clearance (e.g. `< 8px`), snap points to form a clean right angle.
3. **Corner Radius Smoothing**: When generating SVG path strings (`M ... L ... Q ...`), convert sharp 90-degree orthogonal corners into rounded fillet corners (`radius: 8px`).
4. **Label Clearance**: Compute midpoint along the longest segment of the route and ensure bounding box clearance for edge labels.

```ts
export function generateOrthogonalPath(points: Point[], cornerRadius = 8): string {
  if (points.length < 2) return '';
  // Convert cleaned points to SVG path with rounded fillet corners
  // 'M start.x start.y L ... Q ... L end.x end.y'
}
```

---

## 4. Performance Guardrails

- **Never Trigger ELK on Continuous Drag**: During interactive node dragging, simply update the dragged node position locally and compute direct geometric connector endpoints.
- **Run Layout in Web Worker / Headless Queue**: For diagrams with `> 50` nodes, offload ELK computation to a worker thread to keep the main editor thread responsive at 60 FPS.
