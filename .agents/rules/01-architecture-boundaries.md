---
name: architecture-boundaries
description: Enforce strict separation between Diagram IR, React Flow editor adapters, headless SVG renderers, and REST domain services.
trigger: always_on
---

# Rule: Architecture Boundaries & Decoupling

## Core Directives

1. **Diagram IR is Canonical**:
   - The document format defined in `@platform/diagram-schema` (`DiagramDocument`, `DiagramNode`, `DiagramEdge`, `DiagramGroup`, `DiagramAnnotation`) is the single source of truth.
   - External APIs, persistence layers, export tools, and AI generation engines must only consume and produce this canonical IR.

2. **React Flow is Only an Editor Adapter**:
   - `@xyflow/react` is strictly an editing UI dependency inside `@platform/diagram-editor` and `apps/web`.
   - Never expose `@xyflow/react` types or internal node/edge structures outside `@platform/diagram-editor`.
   - The React Flow canvas must convert `DiagramDocument -> ReactFlowAdapter.toReactFlow()` for editing, and dispatch `DiagramCommand` actions to mutate the canonical document.

3. **Headless SVG Renderer Independence**:
   - `@platform/diagram-renderer` must execute headlessly in Node.js server environments without DOM polyfills, browser windows, or React Flow.
   - All text measurement must be done using deterministic font metrics (via `fontkit` or pre-measured font metric tables).
   - Rendered SVG must contain stable, deterministic DOM element IDs (e.g. `node-<id>`, `edge-<id>`) without editor selection handles or temporary UI overlays.

4. **Service Layer Centralization**:
   - Next.js Route Handlers (`apps/web/app/api/...`) must never execute business logic or direct database queries inline.
   - All operations must route through domain services (`DiagramService`, `DiagramVersionService`, `LayoutService`, `RenderService`, `ExportService`).
   - The interactive web editor and the external REST API must invoke the exact same domain service methods.

5. **Layout Calculation vs Visual Appearance**:
   - `@platform/diagram-layout` takes a `DiagramDocument` and calculates node coordinates, port positions, and edge waypoint paths (`LayoutResult`).
   - The layout engine does not determine colors, strokes, typography, or rendering tags.
   - The layout engine must never be executed synchronously on every pointer drag event; position offsets are applied directly during drag, and global layout is executed on request.
