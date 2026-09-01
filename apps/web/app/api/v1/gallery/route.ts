import { NextResponse } from 'next/server';
import { sampleDiagrams } from '@platform/diagram-schema';
import { renderDiagram } from '@platform/diagram-renderer';
import { DEFAULT_DESCRIPTION, type GalleryEntry } from '../../../../lib/gallery/list';

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * Returns the full gallery: every sample diagram with a pre-rendered SVG
 * thumbnail. Server-side rendered once at build time.
 */
export function GET() {
  const entries: GalleryEntry[] = Object.entries(sampleDiagrams).map(([id, doc]) => {
    const result = renderDiagram(doc, { width: 480, height: 320 });
    return {
      id,
      title: doc.metadata.title,
      description: doc.metadata.description ?? DEFAULT_DESCRIPTION,
      nodes: doc.nodes.length,
      edges: doc.edges.length,
      theme: doc.theme,
      tags: doc.metadata.tags ?? [],
      author: doc.metadata.author ?? 'agentic / diagrams',
      svg: result.svg,
      width: result.width,
      height: result.height,
    };
  });

  return NextResponse.json({ data: entries, count: entries.length });
}
