import type { DiagramDocument } from '@platform/diagram-schema';
import { renderDiagram, type RenderOptions, type RenderResult } from '@platform/diagram-renderer';
import { computeRenderHash } from '@platform/diagram-core';

export class RenderService {
  private cache: Map<string, RenderResult> = new Map();

  render(doc: DiagramDocument, options: RenderOptions = {}): RenderResult {
    const hash = computeRenderHash(doc, { rendererVersion: '1.0.0' });
    const cacheKey = `${hash}_${options.theme ?? doc.theme}_${options.width ?? doc.metadata.width}_${options.height ?? doc.metadata.height}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = renderDiagram(doc, options);
    this.cache.set(cacheKey, result);
    return result;
  }
}

export const renderService = new RenderService();
