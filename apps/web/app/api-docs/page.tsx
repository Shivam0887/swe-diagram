'use client';

import React, { useState } from 'react';
import { sampleDiagrams } from '@platform/diagram-schema';
import { Send, Copy, Check, Terminal, KeyRound, Sparkles, ArrowUpRight } from 'lucide-react';
import { Header } from '../../components/chrome/Header';
import { Footer } from '../../components/chrome/Footer';

type EndpointDef = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  defaultBody?: string;
};

const ENDPOINTS: EndpointDef[] = [
  {
    method: 'POST',
    path: '/api/v1/render',
    title: 'Render Diagram → SVG',
    description: 'Accepts canonical Diagram IR JSON and returns deterministic SVG vector output.',
    defaultBody: JSON.stringify(
      { document: sampleDiagrams['aws-three-tier-elasticache'], theme: 'polished-dark' },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/v1/layout',
    title: 'Auto Layout (ELK)',
    description: 'Computes layered orthogonal coordinates and waypoints for any Diagram IR.',
    defaultBody: JSON.stringify(
      { document: sampleDiagrams['microservices-ecommerce'], direction: 'horizontal', nodeSpacing: 56 },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/v1/generate',
    title: 'AI Architecture Generator',
    description: 'Compiles natural language architectural prompts into canonical Diagram IR.',
    defaultBody: JSON.stringify(
      { prompt: 'Real-time event streaming pipeline with Kafka, Redis cache, and S3 object storage', theme: 'polished-dark' },
      null,
      2
    ),
  },
  { method: 'GET', path: '/api/v1/diagrams', title: 'List Stored Diagrams', description: 'Retrieves all persisted diagrams in the database.' },
  {
    method: 'POST',
    path: '/api/v1/diagrams',
    title: 'Create Diagram Record',
    description: 'Validates and saves a new DiagramDocument into the persistence repository.',
    defaultBody: JSON.stringify(
      { name: 'Distributed Rate Limiting Cluster', description: 'Redis token bucket rate limiter architecture', document: sampleDiagrams['caching-rate-limiter'] },
      null,
      2
    ),
  },
];

const METHOD_COLOR: Record<string, string> = {
  GET: 'var(--bp-ink-1)',
  POST: 'var(--bp-accent)',
  PUT: 'var(--bp-ink-1)',
  DELETE: 'var(--bp-ink-1)',
};

export default function ApiPlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody ?? '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseOutput, setResponseOutput] = useState<string>('');
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody ?? '');
    setResponseStatus(null);
    setResponseOutput('');
    setRenderedSvg(null);
    setResponseTime(null);
  };

  const handleExecute = async () => {
    try {
      setIsLoading(true);
      setResponseStatus(null);
      setResponseOutput('');
      setRenderedSvg(null);
      setResponseTime(null);

      const t0 = performance.now();

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (selectedEndpoint.method !== 'GET' && requestBody) options.body = requestBody;

      const res = await fetch(selectedEndpoint.path, options);
      const dt = performance.now() - t0;
      setResponseTime(Math.round(dt));
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponseOutput(JSON.stringify(json, null, 2));
        if (json.data?.svg) setRenderedSvg(json.data.svg);
      } else {
        const text = await res.text();
        setResponseOutput(text);
        if (text.startsWith('<svg')) setRenderedSvg(text);
      }
    } catch (err) {
      setResponseOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Header active="api" />
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <aside
          style={{
            width: 300,
            flexShrink: 0,
            background: 'color-mix(in srgb, var(--bp-bg-0) 70%, transparent)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid var(--bp-hairline)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bp-hairline)', background: 'var(--bp-bg-2)' }}>
            <div className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)' }}>
              rest endpoints · v1
            </div>
            <div className="bp-mono" style={{ fontSize: 11, color: 'var(--bp-ink-1)', marginTop: 4 }}>
              {ENDPOINTS.length} operations
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: isSelected ? 'var(--bp-bg-2)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--bp-accent)' : 'var(--bp-hairline)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="bp-mono"
                      style={{ fontSize: 10, color: METHOD_COLOR[ep.method], fontWeight: 500, width: 44 }}
                    >
                      {ep.method}
                    </span>
                    <span className="bp-mono" style={{ fontSize: 12, fontWeight: 500, color: isSelected ? 'var(--bp-ink-0)' : 'var(--bp-ink-1)' }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--bp-ink-2)', paddingLeft: 44, lineHeight: 1.4 }}>
                    {ep.title}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--bp-hairline)', background: 'var(--bp-bg-2)' }}>
            <div className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)', marginBottom: 4 }}>
              auth · bearer
            </div>
            <div
              className="bp-mono"
              style={{
                fontSize: 10,
                color: 'var(--bp-ink-1)',
                padding: '6px 8px',
                background: 'var(--bp-bg-1)',
                border: '1px solid var(--bp-hairline)',
                borderRadius: 6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <KeyRound size={9} style={{ display: 'inline-block', marginRight: 4, color: 'var(--bp-accent)' }} />
              dc_••••••••••••••••
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--bp-hairline)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              background: 'var(--bp-bg-2)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)', marginBottom: 6 }}>fig. 0.2 · api playground</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <span className="bp-mono" style={{ fontSize: 14, color: METHOD_COLOR[selectedEndpoint.method] }}>{selectedEndpoint.method}</span>
                <span className="bp-mono" style={{ fontSize: 18, fontWeight: 500, color: 'var(--bp-ink-0)' }}>{selectedEndpoint.path}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--bp-ink-1)' }}>{selectedEndpoint.description}</p>
            </div>
            <button onClick={handleExecute} className="btn btn--primary btn--sm">
              <Send size={13} />
              {isLoading ? 'executing' : 'send request'}
            </button>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--bp-hairline)', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--bp-hairline)',
                  background: 'var(--bp-bg-2)',
                }}
              >
                <div className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Terminal size={11} /> request · json
                </div>
                {selectedEndpoint.method !== 'GET' && (
                  <span className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)' }}>
                    {requestBody.length} bytes
                  </span>
                )}
              </div>
              {selectedEndpoint.method === 'GET' ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                    color: 'var(--bp-ink-2)',
                    padding: 24,
                  }}
                >
                  <Terminal size={28} style={{ opacity: 0.3 }} />
                  <div className="bp-mono" style={{ fontSize: 11 }}>GET · no request body</div>
                </div>
              ) : (
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  spellCheck={false}
                  className="bp-mono"
                  style={{
                    flex: 1,
                    padding: 16,
                    background: 'var(--bp-bg-1)',
                    border: 'none',
                    color: 'var(--bp-ink-0)',
                    fontSize: 12,
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--bp-hairline)',
                  background: 'var(--bp-bg-2)',
                }}
              >
                <div className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={11} /> response
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {responseStatus !== null && (
                    <span
                      className="bp-mono"
                      style={{
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 3,
                        background: responseStatus < 300 ? 'var(--bp-accent-soft)' : 'rgba(0,0,0,0.2)',
                        color: responseStatus < 300 ? 'var(--bp-accent)' : 'var(--bp-ink-1)',
                        border: '1px solid',
                        borderColor: responseStatus < 300 ? 'var(--bp-accent)' : 'var(--bp-hairline)',
                      }}
                    >
                      {responseStatus}
                    </span>
                  )}
                  {responseTime !== null && (
                    <span className="bp-mono" style={{ fontSize: 10, color: 'var(--bp-ink-2)' }}>{responseTime}ms</span>
                  )}
                  {responseOutput && (
                    <button onClick={copyOutput} className="bp-btn-icon" style={{ width: 22, height: 22 }}>
                      {copied ? <Check size={11} style={{ color: 'var(--bp-accent)' }} /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {responseStatus === null ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 8,
                      color: 'var(--bp-ink-2)',
                    }}
                  >
                    <div className="bp-mono" style={{ fontSize: 11 }}>awaiting request…</div>
                    <div className="bp-mono" style={{ fontSize: 10, opacity: 0.6 }}>↳ click "send request" to compile</div>
                  </div>
                ) : (
                  <>
                    {renderedSvg && (
                      <div
                        style={{
                          padding: 16,
                          background: 'var(--color-bg-raised)',
                          border: '1px solid var(--color-hairline)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          maxHeight: 320,
                          overflow: 'hidden',
                        }}
                        dangerouslySetInnerHTML={{ __html: renderedSvg }}
                      />
                    )}
                    <pre
                      className="bp-mono"
                      style={{
                        margin: 0,
                        padding: 14,
                        background: '#000',
                        color: '#FAFAFA',
                        border: '1px solid var(--bp-hairline)',
                        borderRadius: 8,
                        fontSize: 11,
                        lineHeight: 1.6,
                        overflow: 'auto',
                        maxHeight: 360,
                      }}
                    >
                      {responseOutput}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
