import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Header } from '../components/chrome/Header';
import { Footer } from '../components/chrome/Footer';
import { CursorGlow } from '../components/chrome/CursorGlow';
import { FigureCaption } from '../components/chrome/FigureCaption';
import { Meta } from '../components/chrome/Meta';
import { sampleDiagrams } from '@platform/diagram-schema';
import { renderDiagram } from '@platform/diagram-renderer';

const STEPS = [
  {
    n: '01',
    title: 'Prompt',
    body: 'Describe the system in natural language. A three-tier checkout, a Kafka fan-out, a rate-limiter with Redis. The agent drafts an initial topology from a canonical schema.',
  },
  {
    n: '02',
    title: 'Draft',
    body: 'Every node, edge, and group is a typed primitive. The agent iterates by issuing commands against the same IR you would. Undo and redo apply to its changes too.',
  },
  {
    n: '03',
    title: 'Ship',
    body: 'The same document compiles to SVG, PNG, and PDF — deterministic, byte-exact, hashable. Render in CI, ship to a CDN, or fork to a new variant.',
  },
];

const INTEGRATIONS = [
  'Next.js', 'Vercel', 'Cursor', 'Claude Code', 'VS Code', 'Figma',
  'React Flow', 'ELK.js', 'Sharp', 'PostgreSQL', 'BullMQ', 'Drizzle',
];

export default function HomePage() {
  // Pre-render three sample diagrams server-side for the gallery preview
  const sampleKeys = Object.keys(sampleDiagrams).slice(0, 3);
  const previews = sampleKeys.map((key) => {
    const doc = sampleDiagrams[key];
    const result = renderDiagram(doc, { width: 480, height: 320 });
    return {
      key,
      title: doc.metadata.title,
      description: doc.metadata.description,
      nodes: doc.nodes.length,
      theme: doc.theme,
      svg: result.svg,
    };
  });

  // One hero diagram, large
  const heroDoc = sampleDiagrams['microservices-ecommerce'];
  const heroRender = renderDiagram(heroDoc, { width: 720, height: 480 });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <CursorGlow />
      <Header />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO */}
        <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="enter">
            <Meta
              items={[
                { label: 'compiler-driven', accent: true },
                'open source',
                'v0.42.1',
                'canonical 1.0',
              ]}
            />
          </div>

          <h1
            className="t-display enter enter-delay-1"
            style={{
              margin: '32px 0 0',
              fontSize: 'clamp(64px, 9vw, 144px)',
              maxWidth: 1100,
            }}
          >
            Diagrams
            <br />
            that think.
          </h1>

          <div
            className="enter enter-delay-2"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
              gap: 64,
              marginTop: 56,
              alignItems: 'end',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: 'var(--color-ink)',
                  maxWidth: 520,
                }}
              >
                An IR-first diagram platform. Prompt an architecture, watch agents
                compose it against a canonical schema, and ship the same document
                as SVG, PNG, or PDF — deterministic, versioned, and hashable.
              </p>
              <div
                style={{
                  marginTop: 32,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <Link href="/editor" className="btn btn--primary">
                  Open editor <ArrowRight size={16} />
                </Link>
                <Link href="/api-docs" className="btn btn--ghost">
                  Read the API
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn--link"
                  style={{ marginLeft: 4 }}
                >
                  <Github size={14} /> Star on GitHub
                </Link>
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-hairline)',
                background: 'var(--color-bg-raised)',
                padding: 16,
                overflow: 'hidden',
              }}
            >
              <div
                className="t-mono"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span className="live-dot" aria-hidden />
                <span style={{ color: 'var(--color-ink)' }}>LIVE</span>
                <span style={{ color: 'var(--color-ink-3)' }}>·</span>
                <span>rendering sample</span>
              </div>
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-sunken)',
                  border: '1px solid var(--color-hairline)',
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: heroRender.svg }}
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container section">
          <div style={{ marginBottom: 56 }}>
            <FigureCaption number="01" label="how it works" />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1,
              background: 'var(--color-hairline)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  padding: 32,
                  background: 'var(--color-bg-raised)',
                }}
              >
                <div
                  className="t-mono"
                  style={{
                    marginBottom: 24,
                    color: 'var(--color-accent)',
                    textTransform: 'lowercase',
                  }}
                >
                  {s.n} / {s.title.toLowerCase()}
                </div>
                <h3
                  className="t-h2"
                  style={{ margin: 0, marginBottom: 12, fontSize: 22 }}
                >
                  {s.title}.
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY PREVIEW */}
        <section className="container section">
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 32,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <FigureCaption number="02" label="from the gallery" />
            <Link href="/gallery" className="btn--link">
              Browse the gallery <ArrowRight size={14} className="arrow" />
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            {previews.map((p) => (
              <Link
                key={p.key}
                href={`/editor?doc=${p.key}`}
                className="card card--hover"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
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
                  dangerouslySetInnerHTML={{ __html: p.svg }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 4 }}>
                    {p.title}
                  </div>
                  <div className="t-mono" style={{ color: 'var(--color-ink-2)' }}>
                    {p.nodes} nodes · {p.theme}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* API CONTRACT */}
        <section className="container section">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
              gap: 64,
              alignItems: 'start',
            }}
          >
            <div>
              <FigureCaption number="03" label="the contract" />
              <h2
                className="t-display"
                style={{
                  margin: '24px 0 16px',
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  maxWidth: 460,
                }}
              >
                Zod-validated.
                <br />
                <span style={{ color: 'var(--color-ink-2)' }}>Migration-safe.</span>
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--color-ink-2)',
                  maxWidth: 440,
                }}
              >
                The renderer never sees React Flow state. The database never
                sees a stringified SVG. Every artifact round-trips through the
                canonical IR — validated, versioned, hashable.
              </p>
            </div>
            <CodeBlock />
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="container" style={{ padding: '64px 0 0' }}>
          <div
            className="t-mono"
            style={{
              textAlign: 'center',
              color: 'var(--color-ink-3)',
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 10,
            }}
          >
            fits into your stack
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {INTEGRATIONS.map((name) => (
              <span key={name} className="chip" style={{ cursor: 'default' }}>
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container" style={{ padding: '128px 24px 0' }}>
          <div
            style={{
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(48px, 8vw, 96px) clamp(32px, 6vw, 64px)',
              background: 'var(--color-bg-raised)',
              textAlign: 'center',
            }}
          >
            <h2
              className="t-display"
              style={{
                margin: 0,
                fontSize: 'clamp(40px, 6vw, 72px)',
              }}
            >
              Start compiling.
            </h2>
            <p
              style={{
                margin: '24px auto 0',
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--color-ink-2)',
                maxWidth: 480,
              }}
            >
              Open the editor, save your first canonical DiagramDocument, then
              call the same payload against the render API.
            </p>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Link href="/editor" className="btn btn--primary">
                Open editor <ArrowRight size={16} />
              </Link>
              <Link href="/api-docs" className="btn btn--ghost">
                Read the API
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CodeBlock() {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-bg-raised)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div
        className="t-mono"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-hairline)',
          color: 'var(--color-ink-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ color: 'var(--color-accent)' }}>POST</span>
        <span>/api/v1/render</span>
        <span style={{ marginLeft: 'auto', color: 'var(--color-ink-3)' }}>200 · svg</span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '20px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--color-ink-2)',
          overflow: 'auto',
        }}
      >
{`{
  "document": {
    "schemaVersion": "1.0",
    "theme": "editorial-dark",
    "nodes": [
      { "id": "gw",  "type": "api_gateway" },
      { "id": "ord", "type": "service" },
      { "id": "pg",  "type": "database" }
    ],
    "edges": [
      { "source": "gw",  "target": "ord" },
      { "source": "ord", "target": "pg"  }
    ]
  }
}`}
      </pre>
    </div>
  );
}
