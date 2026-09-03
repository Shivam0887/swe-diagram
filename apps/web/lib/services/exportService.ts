import type { DiagramDocument } from '@platform/diagram-schema';
import { exportToSvg, exportToPngBuffer, type PngExportOptions } from '@platform/export';

/**
 * Common options shared by both export paths. The `transparentBackground`
 * flag drops the grid/solid background and lets the host backdrop
 * (browser, slide deck, design tool) show through; the bbox is
 * auto-fit by default in `renderDiagram`, so callers don't have to
 * pass `width`/`height`.
 */
type ExportOptions = {
  theme?: string;
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
