import { sampleDiagrams, type DiagramDocument, type ThemeId } from '@platform/diagram-schema';

export const DEFAULT_DESCRIPTION = 'A canonical diagram rendered from the sample set.';

export type GalleryEntry = {
  id: string;
  title: string;
  description: string;
  nodes: number;
  edges: number;
  theme: ThemeId;
  tags: string[];
  author: string;
  svg: string;
  width: number;
  height: number;
};

export type GalleryListItem = Omit<GalleryEntry, 'svg' | 'width' | 'height'>;

/**
 * Subset of GalleryEntry without the SVG body — for callers that just
 * want metadata (the editor's "load template" selector, for example).
 */
export function getGalleryList(): GalleryListItem[] {
  return Object.entries(sampleDiagrams).map(([id, doc]: [string, DiagramDocument]) => ({
    id,
    title: doc.metadata.title,
    description: doc.metadata.description ?? DEFAULT_DESCRIPTION,
    nodes: doc.nodes.length,
    edges: doc.edges.length,
    theme: doc.theme,
    tags: doc.metadata.tags ?? [],
    author: doc.metadata.author ?? 'agentic / diagrams',
  }));
}
