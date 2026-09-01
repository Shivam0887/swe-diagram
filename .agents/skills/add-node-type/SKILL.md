---
name: add-node-type
description: Complete 10-step Definition of Done workflow for registering a new semantic node type across schema, icon library, layout, editor, SVG renderer, and testing suites.
---

# Skill: Add a New Semantic Node Type

Use this skill when adding a new architectural component (e.g., `kafka`, `database`, `api_gateway`, `redis`, `worker`) to the diagram platform.

Follow this 10-step Definition of Done workflow to ensure the node is fully integrated without breaking architecture boundaries.

---

## 10-Step Execution Workflow

### Step 1: Update Diagram Schema
In `packages/diagram-schema/src/nodes.ts`:
- Add the semantic identifier to the `NodeType` enum / union.
- Add any specific node data or metadata validation schema with Zod if needed.

```ts
export const NodeTypeSchema = z.enum([
  'user',
  'browser',
  'api_gateway',
  'service',
  'worker',
  'database',
  'cache',
  'queue',
  'kafka', // New node type
  // ...
]);
```

---

### Step 2: Register Icon in Icon Library
In `packages/icon-library/src/`:
- Create the SVG icon definition in `definitions/<name>.ts`.
- Register the icon in `registry/index.ts`.

```ts
import type { DiagramIconDefinition } from '../types';

export const KafkaIcon: DiagramIconDefinition = {
  name: 'kafka',
  category: 'messaging',
  viewBox: '0 0 24 24',
  paths: [
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm...',
  ],
};
```

---

### Step 3: Define Node Definition & Default Dimensions
In `packages/diagram-core/src/nodes/<name>.ts`:
- Create the `NodeDefinition` implementation.
- Specify standard default dimensions (width and height) adhering to design system tokens.

```ts
export const KafkaDefinition: NodeDefinition = {
  type: 'kafka',
  category: 'messaging',
  defaultSize: {
    width: 180,
    height: 72,
  },
  // ...
};
```

---

### Step 4: Define Port Configuration
In the `NodeDefinition`:
- Implement `getPorts(node: DiagramNode): Port[]`.
- Typical configurations: 4 cardinal connection ports (`top`, `right`, `bottom`, `left`) with semantic roles (`input`, `output`, `bidirectional`).

```ts
getPorts: (node) => [
  { id: `${node.id}-top`, position: 'top', type: 'target' },
  { id: `${node.id}-right`, position: 'right', type: 'source' },
  { id: `${node.id}-bottom`, position: 'bottom', type: 'source' },
  { id: `${node.id}-left`, position: 'left', type: 'target' },
],
```

---

### Step 5: Implement Text & Bounding Box Measurement
In the `NodeDefinition`:
- Implement `measure(data: NodeData, theme: Theme): Size`.
- Calculate dynamic container sizing based on title length, subtitle, badge presence, and icon offset.

---

### Step 6: Implement Editor Component (React Flow)
In `packages/diagram-editor/src/nodes/<Name>Node.tsx`:
- Build the interactive React component used inside React Flow canvas.
- Connect handles/ports to `@xyflow/react` `<Handle />` components.
- Use design tokens from `@platform/design-system` for padding, radius, and colors.

---

### Step 7: Implement Headless SVG Node Renderer
In `packages/diagram-renderer/src/nodes/render<Name>Svg.ts`:
- Render deterministic vector SVG markup string.
- Output clean `<g id="node-${node.id}" class="diagram-node node-${node.type}">`.
- Render background `<rect>` with theme-resolved corner radii, icon `<path>`, node title, subtitle, and badges.

```ts
export function renderKafkaSvg(node: DiagramNode, theme: ResolvedTheme): string {
  const colorRole = theme.nodes.messaging;
  return `
    <g id="node-${node.id}" class="diagram-node node-kafka" transform="translate(${node.position.x}, ${node.position.y})">
      <rect width="${node.size.width}" height="${node.size.height}" rx="${theme.radius.md}" fill="${colorRole.background}" stroke="${colorRole.border}" stroke-width="${theme.strokes.default}" />
      <!-- icon, label, and port markup -->
    </g>
  `;
}
```

---

### Step 8: Add Node Measurement Unit Tests (Optional / Deferred)
In `packages/diagram-core/test/nodes/<name>.test.ts`:
- (Deferred for now) Test that `measure()` computes correct dimensions for short labels, long labels, and multi-line titles.

---

### Step 9: Add Deterministic SVG Snapshot Test (Optional / Deferred)
In `packages/diagram-renderer/test/nodes/<name>.test.ts`:
- (Deferred for now) Render a fixture instance of the node with `educational-light` and `educational-dark` themes.
- (Deferred for now) Assert snapshot matches expected deterministic SVG output.

---

### Step 10: Register in Master Node Registry & Palette
- Add the definition to `nodeRegistry` in `packages/diagram-core/src/registry.ts`.
- Add to the Editor component palette in `apps/web/components/editor/palette/`.
