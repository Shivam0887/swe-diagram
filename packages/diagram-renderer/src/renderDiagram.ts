import type { DiagramDocument } from '@platform/diagram-schema';
import { resolveTheme } from '@platform/design-system';
import { renderBackground } from './renderers/renderBackground';
import { renderNodeSvg } from './renderers/renderNode';
import { renderEdgeSvg } from './renderers/renderEdge';
import { renderGroupSvg } from './renderers/renderGroup';
import { renderAnnotationSvg } from './renderers/renderAnnotation';
import { computeContentBounds } from './bounds';
import { escapeXml } from './utils/sanitize';

export type RenderOptions = {
  theme?: string;
  /**
   * If set, the renderer uses these dimensions for the canvas instead
   * of the content bbox. Use this to force a fixed-size export. When
   * omitted, the SVG auto-fits to the bounding box of all nodes,
   * groups, edges, and annotations (with 24px padding).
   */
  width?: number;
  height?: number;
  /**
   * When true, no background rect is painted. The resulting SVG has
   * no fill underneath the diagram, and a rasterized PNG keeps the
   * alpha channel. Default: false (paint the configured bg).
   */
  transparentBackground?: boolean;
};

export type RenderResult = {
  svg: string;
  width: number;
  height: number;
};

export function renderDiagram(doc: DiagramDocument, options: RenderOptions = {}): RenderResult {
  const theme = resolveTheme(options.theme ?? doc.theme);

  // Compute the bbox of all visible content. When the caller doesn't
  // pin a width/height, the SVG canvas is sized to fit the bbox so
  // there's no white space and nothing is clipped.
  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));
  const contentBounds = computeContentBounds(doc, nodeMap);

  let width: number;
  let height: number;
  let viewBoxX: number;
  let viewBoxY: number;
  if (options.width !== undefined && options.height !== undefined) {
    // Explicit fixed canvas — used by callers that want a known size
    // (e.g. legacy exports). The bbox still informs the viewBox so
    // content sits inside the visible area; if the content overflows,
    // we grow the canvas to fit.
    width = options.width;
    height = options.height;
    if (contentBounds.width > 0 && contentBounds.height > 0) {
      viewBoxX = Math.min(0, contentBounds.x);
      viewBoxY = Math.min(0, contentBounds.y);
      width = Math.max(width, Math.ceil(contentBounds.x + contentBounds.width));
      height = Math.max(height, Math.ceil(contentBounds.y + contentBounds.height));
    } else {
      viewBoxX = 0;
      viewBoxY = 0;
    }
  } else {
    // Auto-fit. The bbox already includes the 24-px padding, so the
    // viewBox matches the canvas dimensions exactly. When the
    // document is empty we fall back to the metadata dimensions so
    // the SVG still has a sensible size.
    if (contentBounds.width > 0 && contentBounds.height > 0) {
      viewBoxX = contentBounds.x;
      viewBoxY = contentBounds.y;
      width = Math.ceil(contentBounds.width);
      height = Math.ceil(contentBounds.height);
    } else {
      width = doc.metadata.width ?? 1200;
      height = doc.metadata.height ?? 800;
      viewBoxX = 0;
      viewBoxY = 0;
    }
  }

  // Background layer. When `transparentBackground` is true we skip
  // the rect entirely; the SVG inherits its host's backdrop. The
  // layer is still emitted (empty) so the layer ordering — bg →
  // groups → edges → nodes → annotations — stays consistent across
  // all exports and the schema is uniform.
  const bgResult = options.transparentBackground
    ? { defs: '', svg: '' }
    : renderBackground(doc.metadata.background, width, height, theme);

  const groupsSvg = (doc.groups ?? []).map((g) => renderGroupSvg(g, theme)).join('\n    ');
  const edgesSvg = (doc.edges ?? []).map((e) => renderEdgeSvg(e, nodeMap, theme)).join('\n    ');
  const nodesSvg = (doc.nodes ?? []).map((n) => renderNodeSvg(n, theme)).join('\n    ');
  const annotationsSvg = (doc.annotations ?? []).map((a) => renderAnnotationSvg(a, theme)).join('\n    ');

  const defs = `
    <defs>
      ${bgResult.defs}
      <marker id="marker-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${theme.edges.arrowFill}" />
      </marker>
      <marker id="marker-arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="${theme.edges.arrowFill}" />
      </marker>
    </defs>
  `.trim();

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}" width="${width}" height="${height}" data-schema-version="${escapeXml(doc.schemaVersion)}" data-renderer-version="1.0.0" data-theme="${escapeXml(theme.id)}">
  ${defs}
  <g id="layer-background">
    ${bgResult.svg}
  </g>
  <g id="layer-groups">
    ${groupsSvg}
  </g>
  <g id="layer-edges">
    ${edgesSvg}
  </g>
  <g id="layer-nodes">
    ${nodesSvg}
  </g>
  <g id="layer-annotations">
    ${annotationsSvg}
  </g>
</svg>
  `.trim();

  return { svg, width, height };
}
