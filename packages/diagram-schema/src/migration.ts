import type { DiagramDocument } from './types';
import { validateDiagramDocument } from './document';

export function migrateDocument(rawDoc: unknown, targetVersion = '1.0'): DiagramDocument {
  if (typeof rawDoc !== 'object' || rawDoc === null) {
    throw new Error('Invalid document: Expected an object');
  }

  const doc = rawDoc as Record<string, unknown>;
  const currentVersion = (doc.schemaVersion as string) || '1.0';

  if (currentVersion === targetVersion) {
    const validated = validateDiagramDocument(doc);
    if (!validated.success) {
      const errorMsg = validated.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Document validation failed: ${errorMsg}`);
    }
    return validated.data;
  }

  // Future version migrations can be chained sequentially:
  // if (currentVersion === '0.9') { doc = migrate09To10(doc); }
  const validated = validateDiagramDocument(doc);
  if (!validated.success) {
    throw new Error('Document validation failed after migration');
  }
  return validated.data;
}
