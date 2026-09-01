'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Layout, Clock, Trash2, Eye, ArrowUpRight, BookOpen, FileCode2 } from 'lucide-react';
import { Header } from '../../components/chrome/Header';
import { Footer } from '../../components/chrome/Footer';
import { Meta } from '../../components/chrome/Meta';
import type { DiagramRecord } from '@platform/db';

export default function DashboardPage() {
  const [diagrams, setDiagrams] = useState<DiagramRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/v1/diagrams')
      .then((res) => res.json())
      .then((res) => {
        setDiagrams(res.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this diagram? This action is irreversible.')) return;
    try {
      await fetch(`/api/v1/diagrams/${id}`, { method: 'DELETE' });
      setDiagrams((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = diagrams.filter(
    (d) =>
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header active="editor" rightSlot={null} />

      <main>
        <section className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
          {/* Status strip */}
          <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--color-hairline)', marginBottom: 48 }}>
            <Meta
              items={[
                { label: 'online', accent: true },
                'global',
                'v0.42.1',
                `${diagrams.length} documents`,
                'canonical 1.0',
              ]}
            />
          </div>

          {/* Heading row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <h1
                className="t-display"
                style={{ margin: 0, fontSize: 'clamp(40px, 6vw, 72px)' }}
              >
                Your diagrams.
              </h1>
              <p
                style={{
                  marginTop: 16,
                  color: 'var(--color-ink-2)',
                  fontSize: 15,
                  maxWidth: 520,
                }}
              >
                Persisted canonical Diagram IR documents. Edit, render, export — never the React Flow state.
              </p>
            </div>
            <Link href="/editor" className="btn btn--primary">
              <Plus size={15} /> New diagram
            </Link>
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                height: 36,
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-raised)',
                flex: '1 1 280px',
                maxWidth: 360,
              }}
            >
              <Search size={13} style={{ color: 'var(--color-ink-3)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search diagrams…"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-ink)',
                  fontSize: 14,
                  flex: 1,
                  height: '100%',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>
            <span className="t-mono" style={{ marginLeft: 'auto' }}>
              {filtered.length} of {diagrams.length} entries
            </span>
          </div>

          {/* List */}
          <div
            style={{
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'var(--color-bg-raised)',
            }}
          >
            <div
              className="t-mono"
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2.5fr 1fr 1fr 0.8fr 0.8fr 80px',
                padding: '10px 16px',
                color: 'var(--color-ink-3)',
                borderBottom: '1px solid var(--color-hairline)',
                background: 'var(--color-bg-sunken)',
                alignItems: 'center',
                gap: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: 10,
              }}
            >
              <span></span>
              <span>name</span>
              <span>id</span>
              <span>theme</span>
              <span>nodes</span>
              <span>updated</span>
              <span style={{ textAlign: 'right' }}>act</span>
            </div>

            {loading ? (
              <div
                className="t-mono"
                style={{ padding: 48, textAlign: 'center', color: 'var(--color-ink-3)' }}
              >
                loading diagrams…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div className="t-mono" style={{ color: 'var(--color-ink-3)', marginBottom: 12 }}>
                  no diagrams · empty result set
                </div>
                <Link
                  href="/editor"
                  className="btn--link"
                  style={{ color: 'var(--color-accent)' }}
                >
                  $ new diagram → /editor
                </Link>
              </div>
            ) : (
              filtered.map((diag, i) => (
                <div
                  key={diag.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 2.5fr 1fr 1fr 0.8fr 0.8fr 80px',
                    padding: '14px 16px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-sunken)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="t-mono" style={{ color: 'var(--color-ink-3)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {diag.name}
                    </div>
                    {diag.description && (
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--color-ink-3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {diag.description}
                      </div>
                    )}
                  </div>
                  <div
                    className="t-mono"
                    style={{ color: 'var(--color-ink-2)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {diag.id.slice(0, 14)}…
                  </div>
                  <div>
                    <span
                      className="t-mono"
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        border: '1px solid var(--color-hairline)',
                        borderRadius: 4,
                      }}
                    >
                      {diag.document.theme}
                    </span>
                  </div>
                  <div
                    className="t-mono"
                    style={{ color: 'var(--color-ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Layout size={11} /> {diag.document.nodes.length}
                  </div>
                  <div
                    className="t-mono"
                    style={{ color: 'var(--color-ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Clock size={11} />
                    {new Date(diag.updatedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <a
                      href={`/api/v1/diagrams/${diag.id}/render?format=svg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View SVG"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        color: 'var(--color-ink-2)',
                        textDecoration: 'none',
                        transition: 'color 150ms ease, background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ink-2)')}
                    >
                      <Eye size={13} />
                    </a>
                    <Link
                      href="/editor"
                      aria-label="Open in editor"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        color: 'var(--color-ink-2)',
                        textDecoration: 'none',
                      }}
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(diag.id)}
                      aria-label="Delete"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        color: 'var(--color-ink-2)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick start cards */}
          <div
            style={{
              marginTop: 48,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            <div className="card" style={{ padding: 24 }}>
              <FileCode2 size={16} style={{ color: 'var(--color-accent)' }} />
              <h3
                className="t-h2"
                style={{ margin: '12px 0 4px', fontSize: 16 }}
              >
                From the CLI
              </h3>
              <pre
                className="t-mono"
                style={{
                  margin: '12px 0 0',
                  padding: 12,
                  background: 'var(--color-bg-sunken)',
                  color: 'var(--color-ink-2)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 11,
                  overflow: 'auto',
                }}
              >
{`curl -X POST \\
  /api/v1/render \\
  -d @diagram.json`}
              </pre>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
              <h3
                className="t-h2"
                style={{ margin: '12px 0 4px', fontSize: 16 }}
              >
                Schema 1.0
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
                Zod-validated canonical IR. Migration-safe. Backward-compatible minor bumps. Hashable render output.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
