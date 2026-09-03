import type { DiagramAnnotation, DiagramDocument, DiagramEdge, DiagramGroup, DiagramNode, Point } from '@platform/diagram-schema';

/**
 * Axis-aligned bounding box. `x`/`y` are the top-left corner.
 */
export type BBox = { x: number; y: number; width: number; height: number };

/**
 * Default padding (in SVG user units) added uniformly to the four sides
 * of the computed bbox. 24px keeps a visible breathing room without
 * producing noticeable white space on most diagrams.
 */
const DEFAULT_PADDING = 24;

/**
 * Annotations don't carry an explicit size in all cases, so we model
 * them with a known envelope. These numbers are conservative — they
 * guarantee that the rendered glyph (including its label, callout
 * body, or text run) sits inside the bbox.
 */
const STEP_ANNOTATION_ENVELOPE = { width: 220, height: 60 };
const TEXT_ANNOTATION_ENVELOPE_PER_LINE = 18; // 14px font, line-height ~1.3

/**
 * Compute the bounding box of all visible content in a DiagramDocument.
 *
 * Sources considered (in priority order):
 *   - Groups: `position` to `position + size`
 *   - Nodes: `position` to `position + size`
 *   - Edges: union of `waypoints` if explicit (else source/target
 *     node midpoints, already inside node bboxes)
 *   - Annotations: explicit `size` when present, otherwise a known
 *     envelope per annotation type
 *
 * Returns a bbox padded on all four sides by `options.padding`
 * (default 24). When the document is empty, returns `{0, 0, 0, 0}`.
 */
export function computeContentBounds(
  doc: DiagramDocument,
  nodeMap: Map<string, DiagramNode>,
  options: { padding?: number } = {}
): BBox {
  const padding = options.padding ?? DEFAULT_PADDING;
  const groups = doc.groups ?? [];
  const edges = doc.edges ?? [];
  const annotations = doc.annotations ?? [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const extend = (x: number, y: number): void => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  for (const g of groups) {
    extend(g.position.x, g.position.y);
    extend(g.position.x + g.size.width, g.position.y + g.size.height);
  }

  for (const n of doc.nodes) {
    extend(n.position.x, n.position.y);
    extend(n.position.x + n.size.width, n.position.y + n.size.height);
  }

  for (const e of edges) {
    const pts = edgeBboxPoints(e, nodeMap);
    for (const p of pts) extend(p.x, p.y);
  }

  for (const a of annotations) {
    const env = annotationEnvelope(a);
    extend(env.x, env.y);
    extend(env.x + env.width, env.y + env.height);
  }

  if (!Number.isFinite(minX)) {
    // Empty document — return a zero-bbox at the origin. The caller
    // decides what to do (typically fall back to a default canvas).
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Apply uniform padding. The `+ padding` and `- padding` cancel out
  // for the size fields (width = (maxX - minX) + 2*padding).
  const x = minX - padding;
  const y = minY - padding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return { x, y, width, height };
}

/**
 * Compute the world-space points that contribute to an edge's bbox.
 * If explicit waypoints are present, use them. Otherwise, derive
 * a 4-point L route from the source/target node midpoints — the same
 * shape the renderer will draw. This guarantees the bbox always
 * encloses the rendered stroke.
 */
function edgeBboxPoints(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>): Point[] {
  if (edge.waypoints && edge.waypoints.length >= 2) {
    return edge.waypoints;
  }
  const src = nodeMap.get(edge.source.nodeId);
  const tgt = nodeMap.get(edge.target.nodeId);
  if (!src || !tgt) return [];
  const srcCx = src.position.x + src.size.width / 2;
  const srcCy = src.position.y + src.size.height / 2;
  const tgtCx = tgt.position.x + tgt.size.width / 2;
  const tgtCy = tgt.position.y + tgt.size.height / 2;
  if (Math.abs(tgtCy - srcCy) < 8) {
    return [
      { x: srcCx + src.size.width / 2, y: srcCy },
      { x: tgtCx - tgt.size.width / 2, y: tgtCy },
    ];
  }
  const srcExit = { x: srcCx + src.size.width / 2, y: srcCy };
  const tgtEntry = { x: tgtCx - tgt.size.width / 2, y: tgtCy };
  const midX = (srcExit.x + tgtEntry.x) / 2;
  return [srcExit, { x: midX, y: srcExit.y }, { x: midX, y: tgtEntry.y }, tgtEntry];
}

/**
 * Conservative envelope (top-left + size) for an annotation. We use
 * enve­lopes rather than precise glyph metrics because we don't want
 * to re-implement text shaping here — the goal is "the bbox encloses
 * what the renderer draws" with a small, predictable safety margin.
 */
function annotationEnvelope(a: DiagramAnnotation): BBox {
  switch (a.type) {
    case 'callout': {
      const width = a.size?.width ?? 220;
      const height = a.size?.height ?? 80;
      return { x: a.position.x, y: a.position.y, width, height };
    }
    case 'highlight': {
      return { x: a.position.x, y: a.position.y, width: a.size.width, height: a.size.height };
    }
    case 'step': {
      // 28-px disc + a 14-px label pill extending to its right.
      return {
        x: a.position.x,
        y: a.position.y,
        width: STEP_ANNOTATION_ENVELOPE.width,
        height: STEP_ANNOTATION_ENVELOPE.height,
      };
    }
    case 'text': {
      // One anchor at (x, y); the glyph extends right and down. We
      // estimate a single line at the configured (or default 14) font
      // size; multi-line content is rare and the safety margin is
      // already generous.
      const fontSize = a.fontSize ?? 14;
      const lineHeight = fontSize * 1.3;
      // Estimate width by character count: 0.55em per char is a
      // serviceable average for sans-serif body text.
      const charWidth = fontSize * 0.55;
      const estWidth = Math.max(40, a.content.length * charWidth);
      return {
        x: a.position.x,
        y: a.position.y,
        width: estWidth,
        height: lineHeight + TEXT_ANNOTATION_ENVELOPE_PER_LINE,
      };
    }
    default:
      // The discriminated union is exhaustive, so this branch is
      // unreachable. Return a zero-bbox at the origin to be safe.
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}
