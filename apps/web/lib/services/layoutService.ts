import type { DiagramDocument } from '@platform/diagram-schema';
import { applyLayoutToDocument, type LayoutOptions } from '@platform/diagram-layout';

export class LayoutService {
  async layout(doc: DiagramDocument, options: LayoutOptions = {}): Promise<DiagramDocument> {
    return await applyLayoutToDocument(doc, options);
  }
}

export const layoutService = new LayoutService();
