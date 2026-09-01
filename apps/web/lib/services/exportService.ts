import type { DiagramDocument } from '@platform/diagram-schema';
import { exportToSvg, exportToPngBuffer, type PngExportOptions } from '@platform/export';

export class ExportService {
  svg(doc: DiagramDocument, options?: { theme?: string }): string {
    return exportToSvg(doc, options);
  }

  async png(doc: DiagramDocument, options: PngExportOptions = {}): Promise<Buffer> {
    return await exportToPngBuffer(doc, options);
  }
}

export const exportService = new ExportService();
