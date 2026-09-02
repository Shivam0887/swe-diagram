import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Header } from '../components/chrome/Header';
import { Footer } from '../components/chrome/Footer';
import { FigureCaption } from '../components/chrome/FigureCaption';
import { Meta } from '../components/chrome/Meta';

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
        {/* HERO — emphasis, balance, hierarchy, proportion, alignment
            The 7 principles are embodied in this single composition:
              • one accent (Ship.) on a quiet field → emphasis
              • text 480px / artifact 3:2 → asymmetric balance
              • display / h2 / body / mono → 4-tier hierarchy
              • identical 24px gutters on every block → rhythm
              • one palette, one radius scale → unity
              • 9vw / 5vw / 16px / 12px → proportion
              • a single left column, hairline on the margin → alignment
        */}
        <section
          className="container"
          style={{
            paddingTop: 96,
            paddingBottom: 96,
            position: 'relative',
          }}
        >
          {/* Left alignment hairline — visible evidence of the alignment grid */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 96,
              bottom: 96,
              left: 'calc(50% - 600px + 24px)',
              width: 1,
              background: 'var(--color-hairline)',
              opacity: 0.5,
            }}
            className="alignment-hairline"
          />

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
            <div style={{ maxWidth: 520 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: 'var(--color-ink)',
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

        {/* ANATOMY — the seven principles as a single side-by-side exhibit.
            No labels, no enumeration. Each row IS the principle:
              • TYPE SCALE → 6 sizes on a single baseline rhythm
              • COLOR LADDER → 60/30/10 weights reading unity
              • SPACING SCALE → 5 squares on the 4-px ladder
              • ALIGNMENT → one column hairline, one center hairline
            The reader sees the principle; nothing is written. */}
        <section
          className="container section"
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              marginBottom: 56,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <FigureCaption number="01" label="anatomy" />
            <span className="t-mono" style={{ color: 'var(--color-ink-3)' }}>
              7 principles · 1 page
            </span>
          </div>

          <div
            className="anatomy-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 1,
              background: 'var(--color-hairline)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {/* TYPE — proportion / hierarchy */}
            <AnatomyCell label="type">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 9, lineHeight: 1, color: 'var(--color-ink-3)' }}>Aa</span>
                <span style={{ fontSize: 13, lineHeight: 1, color: 'var(--color-ink-2)' }}>Aa</span>
                <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--color-ink)' }}>Aa</span>
                <span style={{ fontSize: 28, lineHeight: 1, color: 'var(--color-ink)' }}>Aa</span>
                <span style={{ fontSize: 44, lineHeight: 1, color: 'var(--color-ink)' }}>Aa</span>
                <span style={{ fontSize: 72, lineHeight: 0.9, color: 'var(--color-ink)' }}>Aa</span>
              </div>
            </AnatomyCell>

            {/* COLOR — unity / emphasis / 60-30-10 */}
            <AnatomyCell label="color">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ flex: 6, background: 'var(--color-bg)' }} />
                  <div style={{ flex: 3, background: 'var(--color-hairline)' }} />
                  <div style={{ flex: 1, background: 'var(--color-accent)' }} />
                </div>
                <div style={{ display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ flex: 1, background: 'var(--color-ink)' }} />
                  <div style={{ flex: 1, background: 'var(--color-ink-2)' }} />
                  <div style={{ flex: 1, background: 'var(--color-ink-3)' }} />
                  <div style={{ flex: 1, background: 'var(--color-hairline)' }} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 56,
                    borderRadius: 4,
                    background: 'var(--color-accent-soft)',
                    border: '1px solid var(--color-accent)',
                  }}
                >
                  <span style={{ fontSize: 18, color: 'var(--color-accent)' }}>10%</span>
                </div>
              </div>
            </AnatomyCell>

            {/* SPACING — rhythm / proportion */}
            <AnatomyCell label="space">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                {[4, 8, 16, 32, 64].map((s) => (
                  <div
                    key={s}
                    style={{
                      width: s,
                      height: s,
                      background: 'var(--color-hairline)',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </AnatomyCell>

            {/* ALIGNMENT — alignment / balance / white space */}
            <AnatomyCell label="grid">
              <div
                style={{
                  position: 'relative',
                  height: 112,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* The center column — one hairline */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--color-hairline-strong)',
                  }}
                />
                {/* The body column at 480px from the center */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 24,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--color-accent)',
                    opacity: 0.4,
                  }}
                />
                {/* Two stacked blocks of body text — visible left-alignment */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 180 }}>
                  <div style={{ height: 6, width: 64, background: 'var(--color-ink-3)', borderRadius: 2 }} />
                  <div style={{ height: 6, width: 140, background: 'var(--color-ink-3)', borderRadius: 2 }} />
                  <div style={{ height: 6, width: 96, background: 'var(--color-ink-3)', borderRadius: 2 }} />
                  <div style={{ height: 6, width: 120, background: 'var(--color-ink-3)', borderRadius: 2 }} />
                </div>
              </div>
            </AnatomyCell>
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
          .anatomy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .stack-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .alignment-hairline { display: none; }
        }
        @media (max-width: 640px) {
          .anatomy-grid { grid-template-columns: 1fr !important; }
          .stack-grid { grid-template-columns: 1fr !important; }
          .alignment-hairline { display: none; }
        }
      `}</style>
    </div>
  );
}

/**
 * One cell of the anatomy exhibit. Same padding, same surface, same
 * micro-label as every other cell on the page — that's the unity.
 */
function AnatomyCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 28,
        background: 'var(--color-bg-raised)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 200,
      }}
    >
      <div
        className="t-mono"
        style={{
          color: 'var(--color-ink-3)',
          textTransform: 'lowercase',
        }}
      >
        fig. {label}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</div>
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
