import type { DiagramDocument } from '@platform/diagram-schema';
import { resolveTheme } from '@platform/design-system';
import { renderBackground } from './renderers/renderBackground';
import { renderNodeSvg } from './renderers/renderNode';
import { renderEdgeSvg } from './renderers/renderEdge';
import { renderGroupSvg } from './renderers/renderGroup';
import { renderAnnotationSvg } from './renderers/renderAnnotation';

export type RenderOptions = {
  theme?: string;
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
  const width = options.width ?? doc.metadata.width ?? 1200;
  const height = options.height ?? doc.metadata.height ?? 800;

  const bgResult = renderBackground(doc.metadata.background, width, height, theme);

  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));

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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" data-schema-version="${doc.schemaVersion}" data-renderer-version="1.0.0" data-theme="${theme.id}">
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
