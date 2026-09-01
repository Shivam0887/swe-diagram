import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Header } from '../components/chrome/Header';
import { Footer } from '../components/chrome/Footer';
import { FigureCaption } from '../components/chrome/FigureCaption';
import { Meta } from '../components/chrome/Meta';

/**
 * The seven principles of design composition. Each entry pairs a number
 * (the mono accent on each card), a title, and a one-sentence body that
 * the homepage applies to a diagram platform.
 */
const PRINCIPLES = [
  {
    n: '01',
    title: 'Emphasis',
    body: 'One accent. One focal point per screen. The rest of the canvas is silent so the eye lands where it should.',
  },
  {
    n: '02',
    title: 'Balance',
    body: 'Symmetric structure, asymmetric weight. Headers anchor the left; visual artifacts anchor the right.',
  },
  {
    n: '03',
    title: 'Hierarchy',
    body: 'Four type tiers, no in-between. Display, heading, body, mono — every glyph on the page knows its level.',
  },
  {
    n: '04',
    title: 'Rhythm',
    body: 'A 4-px spacing scale, a 96-px section pad, a single 24-px grid gap. Repetition is the cheapest kind of unity.',
  },
  {
    n: '05',
    title: 'Unity',
    body: 'Every surface reads from the same tokens. Light the page from a single 60-30-10 palette and the seams disappear.',
  },
  {
    n: '06',
    title: 'Proportion',
    body: 'Hero title scales 9vw; section heads scale 5vw; the visual artifact sits at a strict 3:2 aspect ratio.',
  },
  {
    n: '07',
    title: 'White space',
    body: 'Empty area is not wasted. Margins are part of the message; padding is part of the structure.',
  },
];

/**
 * The platform stack, top to bottom: from a prompt to a shipped diagram.
 * Each step is a one-liner; the visual is a typographic card, not an SVG.
 */
const STACK = [
  { n: '01', label: 'Prompt', body: 'Natural-language intent. The agent reads it.' },
  { n: '02', label: 'Draft', body: 'Typed primitives. Nodes, edges, groups, annotations.' },
  { n: '03', label: 'IR', body: 'Canonical, Zod-validated, versioned, hashable.' },
  { n: '04', label: 'Render', body: 'Deterministic SVG. Byte-exact across machines.' },
  { n: '05', label: 'Export', body: 'SVG, PNG, PDF. Same source, same bytes, every time.' },
  { n: '06', label: 'Ship', body: 'CI, CDN, fork, variant. Render once, ship everywhere.' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO — emphasis, balance, hierarchy */}
        <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="enter">
            <Meta
              items={[
                { label: 'composer-driven', accent: true },
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
            Compose.
            <br />
            Compile.
            <br />
            <span className="t-accent">Ship.</span>
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
                An IR-first diagram platform. Prompt an architecture; the
                agent composes a canonical DiagramDocument; you ship the
                same source as SVG, PNG, or PDF — deterministic,
                versioned, hashable.
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

            {/* Visual artifact — a CSS-only geometric composition, not a
                live render. Three nested rounded squares on the 30 tier,
                one accent dot at the geometric center, the 10% talking
                through one point of emphasis. */}
            <Composition />
          </div>
        </section>

        {/* PRINCIPLES — emphasis, rhythm, proportion */}
        <section className="container section">
          <div style={{ marginBottom: 56, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <FigureCaption number="01" label="composition" />
            <span className="t-mono" style={{ color: 'var(--color-ink-3)' }}>
              7 principles · 1 palette
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 1,
              background: 'var(--color-hairline)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
            className="principles-grid"
          >
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.n}
                style={{
                  padding: 28,
                  background: 'var(--color-bg-raised)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 200,
                }}
              >
                <div
                  className="t-mono"
                  style={{
                    color: i === 4 ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    textTransform: 'lowercase',
                  }}
                >
                  {p.n} / {p.title.toLowerCase()}
                </div>
                <h3
                  className="t-h2"
                  style={{ margin: 0, fontSize: 20 }}
                >
                  {p.title}.
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STACK — rhythm, unity */}
        <section className="container section">
          <div style={{ marginBottom: 48, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <FigureCaption number="02" label="the stack" />
            <span className="t-mono" style={{ color: 'var(--color-ink-3)' }}>
              one document · three outputs
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
            }}
            className="stack-grid"
          >
            {STACK.map((s) => (
              <div
                key={s.n}
                className="card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  className="t-mono"
                  style={{
                    color: 'var(--color-ink-3)',
                    textTransform: 'lowercase',
                  }}
                >
                  {s.n} · {s.label.toLowerCase()}
                </div>
                <div
                  className="t-h2"
                  style={{ margin: 0, fontSize: 18 }}
                >
                  {s.label}.
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTRACT — contrast, hierarchy */}
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

        {/* CTA — emphasis, white space */}
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
              Start composing.
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

      <style>{`
        @media (max-width: 1100px) {
          .principles-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .stack-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .principles-grid { grid-template-columns: 1fr !important; }
          .stack-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/**
 * Hero visual artifact. Three nested rounded squares, hairline strokes on
 * the 30 tier, one accent dot at the geometric center. No external
 * assets, no JS — just CSS variables and absolute positioning.
 */
function Composition() {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-hairline)',
        background: 'var(--color-bg-raised)',
        padding: 16,
        overflow: 'hidden',
        aspectRatio: '3 / 2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="t-mono"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'var(--color-ink-3)',
        }}
      >
        fig. 01 / artifact
      </div>
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span className="live-dot" aria-hidden />
        <span className="t-mono" style={{ color: 'var(--color-ink-2)' }}>composed</span>
      </div>
      <div
        style={{
          position: 'relative',
          width: '70%',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer square — 30 tier */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid var(--color-hairline-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        />
        {/* Middle square */}
        <div
          style={{
            position: 'absolute',
            inset: '14%',
            border: '1px solid var(--color-hairline-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        />
        {/* Inner square */}
        <div
          style={{
            position: 'absolute',
            inset: '32%',
            border: '1px solid var(--color-hairline-strong)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        {/* The 10% — a single accent dot at the center */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 0 6px var(--color-accent-soft)',
          }}
        />
        {/* Crosshairs on the 30 tier */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--color-hairline)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'var(--color-hairline)',
          }}
        />
      </div>
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
