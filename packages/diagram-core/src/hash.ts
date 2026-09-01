import type { DiagramDocument } from '@platform/diagram-schema';

export function computeRenderHash(
  doc: DiagramDocument,
  options?: { rendererVersion?: string; fontVersion?: string }
): string {
  const payload = {
    doc,
    theme: doc.theme,
    rendererVersion: options?.rendererVersion ?? doc.rendererVersion ?? '1.0.0',
    fontVersion: options?.fontVersion ?? '1.0.0',
  };

  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}
