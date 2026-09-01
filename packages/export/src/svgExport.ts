import type { DiagramDocument } from '@platform/diagram-schema';
import { renderDiagram, type RenderOptions } from '@platform/diagram-renderer';

export function exportToSvg(doc: DiagramDocument, options: RenderOptions = {}): string {
  const result = renderDiagram(doc, options);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}`;
}
