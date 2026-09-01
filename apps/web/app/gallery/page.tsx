import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '../../components/chrome/Header';
import { Footer } from '../../components/chrome/Footer';
import { CursorGlow } from '../../components/chrome/CursorGlow';
import { FigureCaption } from '../../components/chrome/FigureCaption';
import { sampleDiagrams } from '@platform/diagram-schema';
import { renderDiagram } from '@platform/diagram-renderer';

const FILTERS = ['All', 'AWS', 'GCP', 'Microservices', 'Sequences', 'ER', 'Org charts', 'Flowcharts'];

// Derive a small set of curated "tag" categories from diagram metadata so
// the chips match what the gallery actually contains. If a diagram has
// `microservices` in its tags it shows under "Microservices" / "AWS".
function matchesFilter(tags: string[], filter: string): boolean {
  if (filter === 'All') return true;
  const f = filter.toLowerCase();
  if (f === 'aws') return tags.some((t) => ['aws', 'cloud', 'lambda', 's3', 'ec2'].includes(t));
  if (f === 'gcp') return tags.some((t) => ['gcp', 'google-cloud'].includes(t));
  if (f === 'microservices') return tags.some((t) => t.includes('microservice') || t.includes('service'));
  if (f === 'sequences') return tags.some((t) => t.includes('sequence') || t.includes('flow'));
  if (f === 'er') return tags.some((t) => t.includes('er') || t.includes('schema') || t.includes('database'));
  if (f === 'org charts') return tags.some((t) => t.includes('org') || t.includes('people') || t.includes('team'));
  if (f === 'flowcharts') return tags.some((t) => t.includes('flow') || t.includes('process'));
  return tags.includes(f);
}

export default function GalleryPage() {
  // Build gallery at request time using the existing sample set.
  // For a larger gallery this would be a database query; for the redesign
  // it seeds from sampleDiagrams (already in @platform/diagram-schema).
  const allEntries = Object.entries(sampleDiagrams).map(([id, doc]) => {
    const result = renderDiagram(doc, { width: 480, height: 320 });
    return {
      id,
      title: doc.metadata.title,
      description: doc.metadata.description ?? 'A canonical diagram rendered from the sample set.',
      nodes: doc.nodes.length,
      edges: doc.edges.length,
      theme: doc.theme,
      tags: doc.metadata.tags ?? [],
      svg: result.svg,
    };
  });

  // Duplicate sample set so the grid has enough material to feel like a real
  // gallery rather than two tiles. Same diagrams, themed variants.
  const themedVariants = ['editorial-dark', 'polished-dark'] as const;
  const expanded = [
    ...allEntries,
    ...allEntries.flatMap((entry, i) =>
      themedVariants.map((theme, j) => ({
        ...entry,
        id: `${entry.id}--${theme}`,
        title: entry.title,
        theme,
        // Re-render with the variant theme
        svg: renderDiagram(sampleDiagrams[entry.id], { width: 480, height: 320, theme }).svg,
      }))
    ),
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <CursorGlow />
      <Header active="gallery" />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Sub-header strip */}
        <section className="container" style={{ padding: '48px 24px 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <FigureCaption number="01" label="gallery" />
              <h1
                className="t-display"
                style={{
                  margin: '24px 0 0',
                  fontSize: 'clamp(48px, 7vw, 96px)',
                  maxWidth: 720,
                }}
              >
                Curated works.
              </h1>
              <p
                style={{
                  margin: '16px 0 0',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--color-ink-2)',
                  maxWidth: 560,
                }}
              >
                {expanded.length} diagrams from the community and the team. Fork
                one to the editor, or open the API to push your own.
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 48,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '24px 0',
              borderTop: '1px solid var(--color-hairline)',
              borderBottom: '1px solid var(--color-hairline)',
            }}
          >
            {FILTERS.map((f, i) => (
              <button key={f} className="chip" data-active={i === 0 ? 'true' : undefined}>
                {f}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span className="t-mono">{expanded.length} entries</span>
          </div>
        </section>

        {/* Grid */}
        <section className="container" style={{ padding: '32px 24px 96px' }}>
          <div
            style={{
              columnCount: 3,
              columnGap: 16,
            }}
            className="gallery-grid"
          >
            {expanded.map((entry) => (
              <GalleryTile key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 1100px) { .gallery-grid { column-count: 2 !important; } }
        @media (max-width: 640px)  { .gallery-grid { column-count: 1 !important; } }
      `}</style>
    </div>
  );
}

function GalleryTile({
  entry,
}: {
  entry: {
    id: string;
    title: string;
    description: string;
    nodes: number;
    edges: number;
    theme: string;
    tags: string[];
    svg: string;
  };
}) {
  return (
    <Link
      href={`/editor?doc=${entry.id}`}
      className="card card--hover"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        padding: 12,
        display: 'block',
        breakInside: 'avoid',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          aspectRatio: '4 / 3',
          background: 'var(--color-bg-sunken)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 12,
        }}
        dangerouslySetInnerHTML={{ __html: entry.svg }}
      />
      <div style={{ padding: '12px 4px 4px' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-ink)',
            marginBottom: 4,
          }}
        >
          {entry.title}
        </div>
        <div className="t-mono" style={{ color: 'var(--color-ink-2)' }}>
          {entry.nodes} nodes · {entry.theme}
        </div>
      </div>
    </Link>
  );
}
