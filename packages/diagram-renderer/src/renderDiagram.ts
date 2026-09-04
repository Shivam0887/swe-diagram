import type { CanvasBackground, DiagramDocument } from '@platform/diagram-schema';
import { resolveTheme } from '@platform/design-system';
import { renderBackground } from './renderers/renderBackground';
import { renderNodeSvg } from './renderers/renderNode';
import { renderEdgeSvg } from './renderers/renderEdge';
import { renderGroupSvg } from './renderers/renderGroup';
import { renderAnnotationSvg } from './renderers/renderAnnotation';
import { computeContentBounds } from './bounds';
import { escapeXml } from './utils/sanitize';

/**
 * Per-export background override. The export modal and the API let
 * users pick one of these:
 *
 *   - `'theme'` (default): use `doc.metadata.background` as configured
 *     on the document. The renderer falls back to the theme's default
 *     grid pattern when the metadata has no background.
 *   - `'none'`: skip the background layer entirely. The SVG inherits
 *     its host's backdrop and a rasterized PNG keeps the alpha
 *     channel.
 *   - A `CanvasBackground` object: render exactly this background
 *     (`grid` | `dots` | `solid`) with the supplied options, ignoring
 *     `doc.metadata.background`. This is the per-export override that
 *     lets users choose, e.g., a transparent doc into a solid-white
 *     PNG without editing the document.
 */
export type BackgroundOption = 'theme' | 'none' | CanvasBackground;

/**
 * Fixed page-size presets the export modal offers. Each entry is the
 * pixel dimensions of the exported canvas; the diagram is centered
 * inside the canvas with the chosen background filling the rest.
 *
 * `'auto'` is the special "fit to content" mode — the canvas matches
 * the diagram's bbox (the prior default). Use a fixed preset when
 * the export target needs a known size, e.g. a slide deck (16:9
 * 1920×1080) or a Twitter card (1.91:1 1200×628). The `label` is
 * optional and only used for display in the picker; the actual
 * canvas size is driven by `width` and `height`.
 */
export type PageSize =
  | 'auto'
  | { width: number; height: number; label?: string };

export const PAGE_SIZE_PRESETS: PageSize[] = [
  'auto',
  { width: 1920, height: 1080, label: '1920×1080 · 16:9 slide' },
  { width: 1280, height: 720, label: '1280×720 · 16:9 HD' },
  { width: 1200, height: 628, label: '1200×628 · social card' },
  { width: 1080, height: 1080, label: '1080×1080 · square' },
];

export type RenderOptions = {
  theme?: string;
  /**
   * Per-export background override. See `BackgroundOption` for the
   * accepted shapes. Default behavior: use the document's
   * `metadata.background` (falling back to the theme's default grid).
   */
  background?: BackgroundOption;
  /**
   * Fixed canvas size preset. When set to anything other than
   * `'auto'`, the SVG canvas is sized to the preset's width/height
   * and the diagram's bbox is centered inside it (with a
   * `<g transform="translate(...)">` wrapper, so coordinates inside
   * the diagram remain unchanged). The background fills the entire
   * canvas. This is the right choice for slide-deck / social-card
   * exports where the target needs a known page size.
   *
   * Default: `'auto'` — canvas matches the diagram's bbox + 24-px
   * padding. No centering, no extra padding.
   */
  pageSize?: PageSize;
  /**
   * Backwards-compatible alias for `background: 'none'`. Prefer the
   * `background` field for new code; this remains so existing callers
   * keep working.
   */
  transparentBackground?: boolean;
  /**
   * @deprecated Use `pageSize` instead. The `width`/`height` pair
   * still works but only as a low-level escape hatch: when both are
   * set, the canvas is exactly that size, the diagram sits at its
   * natural origin (so a doc at x=20, y=20 will appear in the top-left
   * rather than centered). The new `pageSize` option centers content
   * and is the recommended API.
   */
  width?: number;
  height?: number;
};

export type RenderResult = {
  svg: string;
  width: number;
  height: number;
};

export function renderDiagram(doc: DiagramDocument, options: RenderOptions = {}): RenderResult {
  const theme = resolveTheme(options.theme ?? doc.theme);

  // Compute the bbox of all visible content. We use it in two ways:
  //   - In `'auto'` mode, the canvas size matches the bbox + padding
  //     so nothing is clipped and there's no empty area.
  //   - In a fixed `pageSize`, the bbox tells us the translation
  //     needed to center the content inside the fixed canvas.
  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));
  const contentBounds = computeContentBounds(doc, nodeMap);

  // Resolved page size. `width`/`height` (the legacy API) takes
  // priority so existing callers keep working, then `pageSize`, then
  // the default `'auto'`.
  const resolvedPageSize: PageSize = (() => {
    if (options.width !== undefined && options.height !== undefined) {
      return { width: options.width, height: options.height, label: 'custom' };
    }
    return options.pageSize ?? 'auto';
  })();

  let canvasWidth: number;
  let canvasHeight: number;
  let viewBoxX: number;
  let viewBoxY: number;
  let contentOffsetX: number; // translation applied to <g id="layer-*"> wrappers
  let contentOffsetY: number;

  if (resolvedPageSize === 'auto') {
    // Auto-fit: the canvas is the bbox + 24-px padding, with the
    // viewBox starting at the bbox origin so content sits at its
    // natural coordinates. There is no offset translate, and the
    // background rect is placed at the viewBox origin (the fix in
    // 74b3a1b).
    if (contentBounds.width > 0 && contentBounds.height > 0) {
      viewBoxX = contentBounds.x;
      viewBoxY = contentBounds.y;
      canvasWidth = Math.ceil(contentBounds.width);
      canvasHeight = Math.ceil(contentBounds.height);
    } else {
      // Empty document — fall back to metadata so the SVG still
      // has a sensible size when previewed.
      canvasWidth = doc.metadata.width ?? 1200;
      canvasHeight = doc.metadata.height ?? 800;
      viewBoxX = 0;
      viewBoxY = 0;
    }
    contentOffsetX = 0;
    contentOffsetY = 0;
  } else {
    // Fixed page size. The canvas is the preset dimensions with the
    // viewBox starting at (0, 0) — the bg rect is then a clean
    // (0, 0, width, height) and tiles naturally. The content is
    // drawn at its natural coordinates inside a translate group, so
    // node positions in the IR are unchanged. The translation is
    // the offset needed to center the bbox inside the canvas.
    canvasWidth = resolvedPageSize.width;
    canvasHeight = resolvedPageSize.height;
    viewBoxX = 0;
    viewBoxY = 0;
    if (contentBounds.width > 0 && contentBounds.height > 0) {
      contentOffsetX = Math.round((canvasWidth - contentBounds.width) / 2) - contentBounds.x;
      contentOffsetY = Math.round((canvasHeight - contentBounds.height) / 2) - contentBounds.y;
    } else {
      contentOffsetX = 0;
      contentOffsetY = 0;
    }
  }

  // Resolve the background. `transparentBackground: true` is the
  // legacy alias for `background: 'none'`; both produce an empty
  // bg layer (the layer element is still emitted so the layer order
  // is consistent across all exports).
  const resolvedBackground: CanvasBackground | undefined = (() => {
    if (options.background === 'none' || options.transparentBackground) return undefined;
    if (options.background && options.background !== 'theme') return options.background;
    return doc.metadata.background;
  })();
  const bgResult = resolvedBackground
    ? renderBackground(
        resolvedBackground,
        { viewBoxX, viewBoxY, width: canvasWidth, height: canvasHeight },
        theme
      )
    : { defs: '', svg: '' };

  const groupsSvg = (doc.groups ?? []).map((g) => renderGroupSvg(g, theme)).join('\n      ');
  const edgesSvg = (doc.edges ?? []).map((e) => renderEdgeSvg(e, nodeMap, theme)).join('\n      ');
  const nodesSvg = (doc.nodes ?? []).map((n) => renderNodeSvg(n, theme)).join('\n      ');
  const annotationsSvg = (doc.annotations ?? []).map((a) => renderAnnotationSvg(a, theme)).join('\n      ');

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

  // The content layer wrapper applies the centering translate only
  // when we have a fixed page size. In `'auto'` mode contentOffset
  // is 0, so the wrapper is a no-op pass-through.
  const contentTransform =
    contentOffsetX === 0 && contentOffsetY === 0
      ? ''
      : ` transform="translate(${contentOffsetX} ${contentOffsetY})"`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}" data-schema-version="${escapeXml(doc.schemaVersion)}" data-renderer-version="1.0.0" data-theme="${escapeXml(theme.id)}">
  ${defs}
  <g id="layer-background">
    ${bgResult.svg}
  </g>
  <g id="layer-content"${contentTransform}>
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
  </g>
</svg>
  `.trim();

  return { svg, width: canvasWidth, height: canvasHeight };
}
