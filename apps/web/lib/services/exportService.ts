import type { DiagramDocument } from '@platform/diagram-schema';
import { exportToSvg, exportToPngBuffer, type PngExportOptions } from '@platform/export';
import type { BackgroundOption } from '@platform/diagram-renderer';

/**
 * Common options shared by both export paths.
 *
 * - `background` overrides `doc.metadata.background` for this export.
 *   Use `'none'` to render without a backdrop, `'theme'` to fall
 *   through to the document default, or pass a `CanvasBackground`
 *   object (grid/dots/solid) to override per-export — e.g. render a
 *   transparent doc onto a solid-white PNG.
 * - `transparentBackground` is the legacy alias for `background: 'none'`;
 *   kept so existing callers keep working.
 * - The bbox is auto-fit by default in `renderDiagram`, so callers
 *   don't have to pass `width`/`height`.
 */
export type ExportOptions = {
  theme?: string;
  background?: BackgroundOption;
  transparentBackground?: boolean;
};

export class ExportService {
  svg(doc: DiagramDocument, options: ExportOptions = {}): string {
    return exportToSvg(doc, options);
  }

  async png(doc: DiagramDocument, options: PngExportOptions = {}): Promise<Buffer> {
    return await exportToPngBuffer(doc, options);
  }
}

export const exportService = new ExportService();
