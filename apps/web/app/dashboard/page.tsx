'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Layout,
  Clock,
  Trash2,
  Eye,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  X,
  FileCode2,
  BookOpen,
} from 'lucide-react';
import { Header } from '../../components/chrome/Header';
import { Footer } from '../../components/chrome/Footer';
import { Meta } from '../../components/chrome/Meta';
import type { ProjectRecord, DiagramRecord } from '@platform/db';

type DiagramMap = Record<string, DiagramRecord[]>;

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [diagrams, setDiagrams] = useState<DiagramMap>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/projects');
      const body = await res.json();
      setProjects(body.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadDiagramsFor = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/v1/diagrams?projectId=${projectId}`);
    const body = await res.json();
    setDiagrams((prev) => ({ ...prev, [projectId]: body.data ?? [] }));
  }, []);

  const toggleProject = useCallback(
    async (projectId: string) => {
      const isOpen = !expanded[projectId];
      setExpanded((prev) => ({ ...prev, [projectId]: isOpen }));
      if (isOpen && !diagrams[projectId]) {
        await loadDiagramsFor(projectId);
      }
    },
    [expanded, diagrams, loadDiagramsFor]
  );

  const handleDeleteDiagram = useCallback(async (projectId: string, diagramId: string) => {
    if (!confirm('Delete this diagram? This action is irreversible.')) return;
    await fetch(`/api/v1/diagrams/${diagramId}`, { method: 'DELETE' });
    setDiagrams((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] ?? []).filter((d) => d.id !== diagramId),
    }));
  }, []);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (
        !confirm(
          'Delete this project and every diagram in it? This action is irreversible.'
        )
      ) {
        return;
      }
      await fetch(`/api/v1/projects/${projectId}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setDiagrams((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    },
    []
  );

  const handleNewProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setCreateError('Name is required');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create project (${res.status})`);
      }
      const body = await res.json();
      const project: ProjectRecord | undefined = body?.data;
      if (!project) {
        throw new Error('Server returned no project');
      }
      // Immediately create a starter diagram and route the user to the editor.
      const emptyDoc = {
        schemaVersion: '1.0',
        rendererVersion: '1.0.0',
        theme: 'editorial-dark',
        nodes: [],
        edges: [],
        groups: [],
        annotations: [],
        metadata: { title: 'Untitled', description: '', width: 1280, height: 800, tags: [] },
      };
      const diagramRes = await fetch(`/api/v1/projects/${project.id}/diagrams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled', document: emptyDoc }),
      });
      if (!diagramRes.ok) {
        // Project was created; surface the error but still navigate — the
        // user can hit "New diagram" inside the project.
        setCreateError('Project created, but failed to create a starter diagram.');
        setNewProjectOpen(false);
        setNewProjectName('');
        await loadProjects();
        return;
      }
      const diagramBody = await diagramRes.json();
      const diagram: DiagramRecord | undefined = diagramBody?.data;
      setNewProjectOpen(false);
      setNewProjectName('');
      if (diagram) {
        router.push(`/editor?projectId=${project.id}&diagramId=${diagram.id}`);
      } else {
        router.push(`/dashboard`);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }, [newProjectName, router, loadProjects]);

  const totalDiagrams = Object.values(diagrams).reduce((acc, list) => acc + list.length, 0);
  const filtered = projects.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header active="dashboard" rightSlot={null} />

      <main>
        <section className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
          {/* Status strip */}
          <div
            style={{
              paddingBottom: 24,
              borderBottom: '1px solid var(--color-hairline)',
              marginBottom: 48,
            }}
          >
            <Meta
              items={[
                { label: 'online', accent: true },
                'global',
                'v0.42.1',
                `${projects.length} projects · ${totalDiagrams || '…'} documents`,
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
                Your projects.
              </h1>
              <p
                style={{
                  marginTop: 16,
                  color: 'var(--color-ink-2)',
                  fontSize: 15,
                  maxWidth: 520,
                }}
              >
                Persisted canonical Diagram IR documents. Grouped by project.
                Edit, render, export — never the React Flow state.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewProjectOpen(true);
                setCreateError(null);
              }}
              className="btn btn--primary"
            >
              <Plus size={15} /> New project
            </button>
          </div>

          {/* Search */}
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
                placeholder="Search projects…"
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
              {filtered.length} of {projects.length} projects
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
            {loading ? (
              <div
                className="t-mono"
                style={{
                  padding: 48,
                  textAlign: 'center',
                  color: 'var(--color-ink-3)',
                }}
              >
                loading projects…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div
                  className="t-mono"
                  style={{ color: 'var(--color-ink-3)', marginBottom: 12 }}
                >
                  no projects · empty result set
                </div>
                <button
                  type="button"
                  onClick={() => setNewProjectOpen(true)}
                  className="btn--link"
                  style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  $ new project →
                </button>
              </div>
            ) : (
              filtered.map((project, i) => {
                const isOpen = !!expanded[project.id];
                const list = diagrams[project.id];
                return (
                  <div
                    key={project.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                    }}
                  >
                    <ProjectRow
                      project={project}
                      isOpen={isOpen}
                      diagramCount={list?.length}
                      onToggle={() => toggleProject(project.id)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                    {isOpen && (
                      <DiagramList
                        projectId={project.id}
                        items={list}
                        onDelete={(diagramId) => handleDeleteDiagram(project.id, diagramId)}
                      />
                    )}
                  </div>
                );
              })
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
              <h3 className="t-h2" style={{ margin: '12px 0 4px', fontSize: 16 }}>
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
              <h3 className="t-h2" style={{ margin: '12px 0 4px', fontSize: 16 }}>
                Schema 1.0
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--color-ink-2)',
                  lineHeight: 1.6,
                }}
              >
                Zod-validated canonical IR. Migration-safe. Backward-compatible minor
                bumps. Hashable render output.
              </p>
            </div>
          </div>
        </section>
      </main>

      {newProjectOpen && (
        <NewProjectModal
          name={newProjectName}
          onNameChange={setNewProjectName}
          onClose={() => {
            setNewProjectOpen(false);
            setNewProjectName('');
            setCreateError(null);
          }}
          onSubmit={handleNewProject}
          creating={creating}
          error={createError}
        />
      )}

      <Footer />
    </div>
  );
}

function ProjectRow({
  project,
  isOpen,
  diagramCount,
  onToggle,
  onDelete,
}: {
  project: ProjectRecord;
  isOpen: boolean;
  diagramCount?: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 2.5fr 1fr 1fr 0.8fr 80px',
        padding: '14px 16px',
        alignItems: 'center',
        gap: 12,
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-sunken)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse' : 'Expand'}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-ink-2)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
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
          {project.name}
        </div>
        {project.description && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.description}
          </div>
        )}
      </div>
      <div
        className="t-mono"
        style={{ color: 'var(--color-ink-2)', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {project.id.slice(0, 14)}…
      </div>
      <div className="t-mono" style={{ color: 'var(--color-ink-2)' }}>
        {diagramCount === undefined ? '—' : `${diagramCount} diagram${diagramCount === 1 ? '' : 's'}`}
      </div>
      <div
        className="t-mono"
        style={{ color: 'var(--color-ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <Clock size={11} />
        {new Date(project.updatedAt).toLocaleDateString()}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete project"
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
  );
}

function DiagramList({
  projectId,
  items,
  onDelete,
}: {
  projectId: string;
  items?: DiagramRecord[];
  onDelete: (id: string) => void;
}) {
  if (!items) {
    return (
      <div
        className="t-mono"
        style={{
          padding: 24,
          paddingLeft: 60,
          color: 'var(--color-ink-3)',
          borderTop: '1px solid var(--color-hairline)',
          background: 'var(--color-bg-sunken)',
        }}
      >
        loading diagrams…
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          paddingLeft: 60,
          color: 'var(--color-ink-3)',
          fontSize: 13,
          borderTop: '1px solid var(--color-hairline)',
          background: 'var(--color-bg-sunken)',
        }}
      >
        no diagrams in this project yet
      </div>
    );
  }
  return (
    <div
      style={{
        borderTop: '1px solid var(--color-hairline)',
        background: 'var(--color-bg-sunken)',
      }}
    >
      {items.map((d, i) => (
        <div
          key={d.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 2.5fr 1fr 1fr 0.8fr 80px',
            padding: '12px 16px',
            paddingLeft: 24,
            borderBottom:
              i < items.length - 1 ? '1px solid var(--color-hairline)' : 'none',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            className="t-mono"
            style={{ color: 'var(--color-ink-3)', paddingLeft: 24 }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {d.name}
            </div>
            {d.description && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-ink-3)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.description}
              </div>
            )}
          </div>
          <div
            className="t-mono"
            style={{ color: 'var(--color-ink-2)', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {d.id.slice(0, 14)}…
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
              {d.document.theme}
            </span>
          </div>
          <div
            className="t-mono"
            style={{ color: 'var(--color-ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Layout size={11} /> {d.document.nodes.length}
          </div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            <a
              href={`/api/v1/diagrams/${d.id}/render?format=svg`}
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
              }}
            >
              <Eye size={13} />
            </a>
            <Link
              href={`/editor?projectId=${projectId}&diagramId=${d.id}`}
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
              type="button"
              onClick={() => onDelete(d.id)}
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
      ))}
    </div>
  );
}

function NewProjectModal({
  name,
  onNameChange,
  onClose,
  onSubmit,
  creating,
  error,
}: {
  name: string;
  onNameChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  creating: boolean;
  error: string | null;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(14, 14, 16, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: 'min(420px, 92vw)',
          padding: 24,
          background: 'var(--color-bg-raised)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3 className="t-h2" style={{ margin: 0, fontSize: 18 }}>
            New project
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-ink-2)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
        <label
          className="t-mono"
          style={{ display: 'block', marginBottom: 8, color: 'var(--color-ink-3)' }}
        >
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          placeholder="e.g. E-commerce platform"
          className="input"
          style={{ width: '100%' }}
        />
        {error && (
          <div
            className="t-mono"
            style={{ marginTop: 12, color: 'var(--color-accent)' }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn--ghost btn--sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={creating}
            className="btn btn--primary btn--sm"
          >
            {creating ? 'creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
