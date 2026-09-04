---
name: svg-renderer-pipeline
description: Architecture and implementation guide for the deterministic, headless SVG renderer, server-side font measurement, and Sharp PNG export pipeline.
---

# Skill: Headless SVG Renderer & Export Pipeline

Use this skill when developing, testing, or optimizing the headless vector SVG rendering engine in `@platform/diagram-renderer` and the export pipeline in `@platform/export`.

---

## 1. Renderer Architecture & Constraints

```text
Diagram IR
      ↓
Normalize Document & Resolve Theme
      ↓
Measure Typography (Fontkit Metrics)
      ↓
Assemble SVG Render Tree:
 ├── Background Layer
 ├── Groups Layer (Containers / Boundaries)
 ├── Edge Shadows & Connector Paths Layer
 ├── Nodes Layer (Rectangles, Badges, Icons)
 └── Annotations Layer (Steps, Callouts, Notes)
      ↓
Deterministic String Serialization (<svg ...>...</svg>)
      ↓
Export Direct SVG OR Sharp Rasterization (PNG/PDF)
```

### Critical Rules:
- **No Browser Globals**: Must execute cleanly in Node.js serverless functions and BullMQ workers without `window`, `document`, or DOM shims.
- **No React Flow Imports**: The renderer must never import `@xyflow/react`.
- **Stable IDs**: Every rendered element must have an immutable ID (e.g. `node-<id>`, `edge-<id>`) to support snapshot tests, DOM inspection, and CSS animation tracks.
- **No Editor Overlays**: Never render selection handles, resize grips, or temporary canvas indicators in the final SVG output.

---

## 2. Server-Side Text Measurement with Fontkit

In `packages/diagram-renderer/src/text/measure.ts`:
- Use `fontkit` with bundled font files (e.g., Inter, Outfit, JetBrains Mono) to deterministically calculate text layout on the server.

```ts
import fontkit from 'fontkit';

export interface TextMetrics {
  width: number;
  height: number;
  lines: string[];
  lineHeight: number;
}

export function measureText(
  text: string,
  fontSize: number,
  fontWeight: number,
  maxWidth?: number
): TextMetrics {
  // Compute deterministic bounding box and line-wrapping
}
```

---

## 3. Layering & SVG Tree Assembly

In `packages/diagram-renderer/src/renderDiagram.ts`:

```ts
import type { DiagramDocument } from '@platform/diagram-schema';
import type { RenderOptions, RenderResult } from './types';
import { resolveTheme } from '@platform/design-system';

export function renderDiagram(
  doc: DiagramDocument,
  options?: RenderOptions
): RenderResult {
  const theme = resolveTheme(options?.theme ?? doc.theme);
  const width = options?.width ?? doc.metadata.width;
  const height = options?.height ?? doc.metadata.height;

  const bgSvg = renderBackground(
    doc.metadata.background,
    { viewBoxX, viewBoxY, width, height },
    theme
  );
  const groupsSvg = doc.groups.map((g) => renderGroupSvg(g, theme)).join('\n');
  const edgesSvg = doc.edges.map((e) => renderEdgeSvg(e, theme)).join('\n');
  const nodesSvg = doc.nodes.map((n) => renderNodeSvg(n, theme)).join('\n');
  const annotationsSvg = doc.annotations.map((a) => renderAnnotationSvg(a, theme)).join('\n');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" data-renderer-version="1.0.0">
  <defs>
    ${renderMarkersAndGradients(theme)}
  </defs>
  <g id="layer-background">${bgSvg}</g>
  <g id="layer-groups">${groupsSvg}</g>
  <g id="layer-edges">${edgesSvg}</g>
  <g id="layer-nodes">${nodesSvg}</g>
  <g id="layer-annotations">${annotationsSvg}</g>
</svg>
  `.trim();

  return { svg, width, height };
}
```

---

## 4. PNG & PDF Rasterization with Sharp

In `packages/export/src/rasterize.ts`:
- Convert rendered SVG string into high-density PNG buffer with configurable scaling factor (`scale: 1`, `scale: 2` for Retina).

```ts
import sharp from 'sharp';

export async function exportToPng(svgString: string, scale = 2): Promise<Buffer> {
  const svgBuffer = Buffer.from(svgString);
  return await sharp(svgBuffer, { density: 72 * scale })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();
}
```

---

## 5. Security & Sanitization

- Sanitize all text content and URLs: escape XML special characters (`<`, `>`, `&`, `"`, `'`).
- Reject inline `<script>` tags, event handlers (`onclick`, `onload`), or `javascript:` URI schemes in user-supplied data or custom icons.
