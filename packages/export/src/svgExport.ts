import type { DiagramDocument } from '@platform/diagram-schema';
import { renderDiagram, type RenderOptions } from '@platform/diagram-renderer';

/**
 * Render a DiagramDocument to a standalone SVG string with the XML
 * prolog. `options` is forwarded verbatim to `renderDiagram`, so
 * callers can request `transparentBackground: true` or pin a fixed
 * `width`/`height`.
 */
export function exportToSvg(doc: DiagramDocument, options: RenderOptions = {}): string {
  const result = renderDiagram(doc, options);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}`;
}
