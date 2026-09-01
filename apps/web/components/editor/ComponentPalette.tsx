'use client';

import React, { useState } from 'react';
import { Search, GripVertical, Plus, Bookmark, Trash2, FolderPlus } from 'lucide-react';
import { Button } from '@heroui/react';
import type { DiagramNode, NodeType, NodeShape, CustomCollection } from '@platform/diagram-schema';

const COMMON_NODES: { type: NodeType; shape?: NodeShape; label: string; category: string }[] = [
  { type: 'service', shape: 'rounded_card', label: 'Microservice', category: 'Compute' },
  { type: 'worker', shape: 'hexagon', label: 'Background worker', category: 'Compute' },
  { type: 'api_gateway', shape: 'rounded_card', label: 'API gateway', category: 'Network' },
  { type: 'load_balancer', shape: 'rounded_card', label: 'Load balancer', category: 'Network' },
  { type: 'database', shape: 'cylinder', label: 'SQL database', category: 'Storage' },
  { type: 'postgresql', shape: 'cylinder', label: 'PostgreSQL', category: 'Storage' },
  { type: 'cache', shape: 'cylinder', label: 'Cache (Redis)', category: 'Storage' },
  { type: 'object_storage', shape: 'rounded_card', label: 'Object storage (S3)', category: 'Storage' },
  { type: 'queue', shape: 'queue_buffer', label: 'Message queue', category: 'Messaging' },
  { type: 'kafka', shape: 'queue_buffer', label: 'Event stream', category: 'Messaging' },
  { type: 'user', shape: 'rounded_card', label: 'User / client', category: 'External' },
  { type: 'browser', shape: 'browser_window', label: 'Web browser', category: 'External' },
];

interface ComponentPaletteProps {
  onAddNode: (
    type: NodeType,
    shape?: NodeShape,
    initialData?: Partial<DiagramNode['data']>,
    initialStyle?: Partial<DiagramNode['style']>
  ) => void;
  collections?: CustomCollection[];
  onSaveToCollection?: (collectionId: string, name: string) => void;
  onCreateCollection?: (name: string) => void;
  onDeleteCollectionItem?: (collectionId: string, itemId: string) => void;
  selectedNode?: DiagramNode | null;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddNode,
  collections = [],
  onSaveToCollection,
  onCreateCollection,
  onDeleteCollectionItem,
  selectedNode,
}) => {
  const [query, setQuery] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: NodeType, shape?: NodeShape) => {
    event.dataTransfer.setData(
      'application/diagram-node',
      JSON.stringify({ type: nodeType, shape })
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  const categories = Array.from(new Set(COMMON_NODES.map((n) => n.category)));
  const filtered = !query
    ? null
    : COMMON_NODES.filter(
        (n) =>
          n.label.toLowerCase().includes(query.toLowerCase()) ||
          n.type.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-hairline)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 10px',
            height: 32,
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-raised)',
          }}
        >
          <Search size={13} style={{ color: 'var(--color-ink-3)' }} />
          <input
            type="text"
            placeholder="Search components…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-ink)',
              fontSize: 13,
              flex: 1,
              height: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        {collections.length > 0 && (
          <Section title="collections">
            {collections.map((col) => (
              <div key={col.id} style={{ marginBottom: 16 }}>
                <div
                  className="t-mono"
                  style={{
                    marginBottom: 4,
                    padding: '0 8px',
                    color: 'var(--color-ink-2)',
                  }}
                >
                  {col.name}
                </div>
                {col.items.length === 0 ? (
                  <div
                    className="t-mono"
                    style={{
                      padding: '0 8px',
                      color: 'var(--color-ink-3)',
                      fontSize: 10,
                    }}
                  >
                    empty
                  </div>
                ) : (
                  <div>
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, item.nodeTemplate?.type || 'service', item.nodeTemplate?.shape)
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'grab',
                          fontSize: 13,
                          color: 'var(--color-ink)',
                          transition: 'background-color 150ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-raised)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <GripVertical size={11} style={{ color: 'var(--color-ink-3)' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        {onDeleteCollectionItem && (
                          <Button
                            onPress={() => onDeleteCollectionItem(col.id, item.id)}
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            aria-label="Delete saved block"
                            style={{
                              background: 'transparent',
                              color: 'var(--color-ink-3)',
                              minWidth: 0,
                              width: 22,
                              height: 22,
                              padding: 0,
                            }}
                          >
                            <Trash2 size={11} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {filtered ? (
          <Section title="results">
            {filtered.length === 0 ? (
              <div className="t-mono" style={{ padding: '8px', color: 'var(--color-ink-3)' }}>
                no matches
              </div>
            ) : (
              filtered.map((node) => (
                <PaletteItem
                  key={node.type}
                  node={node}
                  onDragStart={onDragStart}
                />
              ))
            )}
          </Section>
        ) : (
          categories.map((category) => {
            const items = COMMON_NODES.filter((n) => n.category === category);
            return (
              <Section key={category} title={category}>
                {items.map((node) => (
                  <PaletteItem key={node.type} node={node} onDragStart={onDragStart} />
                ))}
              </Section>
            );
          })
        )}
      </div>

      <div
        style={{
          padding: 12,
          borderTop: '1px solid var(--color-hairline)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {selectedNode && onSaveToCollection && collections.length > 0 && (
          <Button
            onPress={() =>
              onSaveToCollection(collections[0].id, selectedNode.data?.title || 'Custom block')
            }
            variant="ghost"
            size="sm"
            style={{ width: '100%', height: 32, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Bookmark size={13} /> save to collection
          </Button>
        )}
        {onCreateCollection && (
          <Button
            onPress={() => {
              const name = window.prompt('Collection name?');
              if (name) onCreateCollection(name);
            }}
            variant="ghost"
            size="sm"
            style={{ width: '100%', height: 32, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <FolderPlus size={13} /> new collection
          </Button>
        )}
        <Button
          onPress={() => onAddNode('service', 'rounded_card', { title: 'Custom Service' })}
          variant="primary"
          size="sm"
          style={{
            width: '100%',
            height: 32,
            fontSize: 12,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          <Plus size={13} /> add custom node
        </Button>
      </div>
    </aside>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4
        className="t-mono"
        style={{
          margin: 0,
          padding: '0 8px 6px',
          color: 'var(--color-ink-3)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

function PaletteItem({
  node,
  onDragStart,
}: {
  node: typeof COMMON_NODES[number];
  onDragStart: (event: React.DragEvent, type: NodeType, shape?: NodeShape) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type, node.shape)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'grab',
        fontSize: 13,
        color: 'var(--color-ink)',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-raised)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <GripVertical size={11} style={{ color: 'var(--color-ink-3)' }} />
      <span style={{ flex: 1 }}>{node.label}</span>
      <span className="t-mono" style={{ fontSize: 10 }}>
        {node.type}
      </span>
    </div>
  );
}
