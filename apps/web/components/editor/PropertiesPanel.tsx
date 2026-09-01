'use client';

import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Type,
  Layers,
  Image as ImageIcon,
  Hash,
  Check,
} from 'lucide-react';
import { Chip } from '@heroui/react';
import type {
  DiagramNode,
  DiagramEdge,
  NodeShape,
  EdgeAnimationSpeed,
  EdgeRouting,
  EdgeStyle,
} from '@platform/diagram-schema';
import { iconRegistry, getLucideIcon, getTablerIcon, IconShapes } from '@platform/icon-library';
import { IconPickerModal } from './IconPickerModal';

const NODE_SHAPES: { id: NodeShape; label: string }[] = [
  { id: 'rounded_card', label: 'Rounded card' },
  { id: 'cylinder', label: 'Database cylinder' },
  { id: 'queue_buffer', label: 'Queue buffer' },
  { id: 'pill', label: 'Pill / capsule' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'browser_window', label: 'Browser window' },
  { id: 'device_mobile', label: 'Mobile device' },
  { id: 'hexagon', label: 'Hexagon worker' },
  { id: 'diamond', label: 'Decision diamond' },
  { id: 'note', label: 'Sticky note' },
  { id: 'text_only', label: 'Text only' },
];

const PRESET_COLORS = ['#0B0B0C', '#131315', '#E8E2D5', '#FF5A1F', '#8C8A85', '#4A4944', '#26262A'];

interface PropertiesPanelProps {
  selectedNode: DiagramNode | null;
  selectedEdge: DiagramEdge | null;
  onUpdateNode: (id: string, updates: Partial<DiagramNode>) => void;
  onUpdateEdge: (id: string, updates: Partial<DiagramEdge>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
}) => {
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  let body: React.ReactNode = (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--color-bg)',
        borderLeft: '1px solid var(--color-hairline)',
        padding: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'var(--color-ink-3)',
          textAlign: 'center',
        }}
      >
        Select a node or edge to edit its properties.
      </p>
    </aside>
  );

  if (selectedNode) {
    body = (
      <NodeProperties
        node={selectedNode}
        onUpdate={onUpdateNode}
        onOpenIcon={() => setIsIconModalOpen(true)}
      />
    );
  } else if (selectedEdge) {
    body = <EdgeProperties edge={selectedEdge} onUpdate={onUpdateEdge} />;
  }

  return (
    <>
      {body}
      {selectedNode && (
        <IconPickerModal
          isOpen={isIconModalOpen}
          selectedIcon={selectedNode.data.icon}
          onSelect={(iconName) =>
            onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, icon: iconName } })
          }
          onClose={() => setIsIconModalOpen(false)}
        />
      )}
    </>
  );
}

function NodeProperties({
  node,
  onUpdate,
  onOpenIcon,
}: {
  node: DiagramNode;
  onUpdate: (id: string, updates: Partial<DiagramNode>) => void;
  onOpenIcon: () => void;
}) {
  const currentShape: NodeShape = node.shape ?? 'rounded_card';
  const style = node.style ?? {};
  const iconDef = node.data.icon ? iconRegistry[node.data.icon] : null;

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--color-bg)',
        borderLeft: '1px solid var(--color-hairline)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SectionTitle title="Node" tag={node.type} />

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BareField label="Shape" icon={<Layers size={11} />}>
          <select
            value={currentShape}
            onChange={(e) => onUpdate(node.id, { shape: e.target.value as NodeShape })}
            style={selectStyle}
          >
            {NODE_SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </BareField>

        <BareField label="Vector icon" icon={<ImageIcon size={11} />}>
          <button
            onClick={onOpenIcon}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--color-hairline)',
              color: 'var(--color-ink)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {iconDef && iconDef.nodes && iconDef.nodes.length > 0 ? (
                iconDef.source === 'lucide' && getLucideIcon(iconDef.name) ? (
                  React.createElement(getLucideIcon(iconDef.name)!, {
                    size: 12,
                    color: 'var(--color-ink-2)',
                  })
                ) : iconDef.source === 'tabler' && getTablerIcon(iconDef.name) ? (
                  React.createElement(getTablerIcon(iconDef.name)!, {
                    size: 12,
                    color: 'var(--color-ink-2)',
                    stroke: 1.5,
                  })
                ) : (
                  <svg viewBox={iconDef.viewBox || '0 0 24 24'} style={{ width: 12, height: 12, fill: 'var(--color-ink-2)' }}>
                    <IconShapes def={iconDef} currentColor={false} />
                  </svg>
                )
              ) : (
                <ImageIcon size={11} style={{ color: 'var(--color-ink-3)' }} />
              )}
            </div>
            <span style={{ flex: 1 }}>{node.data.icon || 'select icon'}</span>
            <span style={{ color: 'var(--color-accent)', fontSize: 12 }}>browse →</span>
          </button>
        </BareField>

        <Divider />

        <BareField label="Title" icon={<Type size={11} />}>
          <input
            type="text"
            value={node.data.title || ''}
            onChange={(e) => onUpdate(node.id, { data: { ...node.data, title: e.target.value } })}
            placeholder="Primary label"
            style={inputBareStyle}
          />
        </BareField>
        <BareField label="Subtitle">
          <input
            type="text"
            value={node.data.subtitle || ''}
            onChange={(e) => onUpdate(node.id, { data: { ...node.data, subtitle: e.target.value } })}
            placeholder="Go, gRPC, :8080"
            style={inputBareStyle}
          />
        </BareField>
        <BareField label="Badge">
          <input
            type="text"
            value={node.data.badge || ''}
            onChange={(e) => onUpdate(node.id, { data: { ...node.data, badge: e.target.value } })}
            placeholder="v2.0 / HA / leader"
            style={inputBareStyle}
          />
        </BareField>

        <Divider />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={12} style={{ color: 'var(--color-ink-2)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Live status pulse</span>
          </div>
          <input
            type="checkbox"
            checked={!!node.data.pulsing}
            onChange={(e) => onUpdate(node.id, { data: { ...node.data, pulsing: e.target.checked } })}
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </div>

        <Divider />

        <BareField label="Color" icon={<Hash size={11} />}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => onUpdate(node.id, { style: { ...style, backgroundColor: c } })}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: c,
                  border:
                    style.backgroundColor === c
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {style.backgroundColor === c && <Check size={10} style={{ color: '#0B0B0C', strokeWidth: 4 }} />}
              </button>
            ))}
          </div>
          <ColorRow
            label="border"
            value={style.borderColor || '#E8E2D5'}
            onChange={(v) => onUpdate(node.id, { style: { ...style, borderColor: v } })}
          />
        </BareField>

        <Divider />

        <BareField label={`Corner radius · ${style.borderRadius ?? 8}px`}>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={style.borderRadius ?? 8}
            onChange={(e) =>
              onUpdate(node.id, { style: { ...style, borderRadius: parseInt(e.target.value, 10) } })
            }
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </BareField>
      </div>
    </aside>
  );
}

function EdgeProperties({
  edge,
  onUpdate,
}: {
  edge: DiagramEdge;
  onUpdate: (id: string, updates: Partial<DiagramEdge>) => void;
}) {
  const data = edge.data ?? {};
  const routing: EdgeRouting = edge.routing ?? 'orthogonal';
  const edgeStyle: EdgeStyle = edge.style ?? 'solid';

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--color-bg)',
        borderLeft: '1px solid var(--color-hairline)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SectionTitle title="Edge" tag={edge.id.slice(0, 16)} />

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            background: 'var(--color-bg-raised)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={12} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Live particle flow</span>
          </div>
          <input
            type="checkbox"
            checked={!!data.animated}
            onChange={(e) => onUpdate(edge.id, { data: { ...data, animated: e.target.checked } })}
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </div>

        {data.animated && (
          <>
            <BareField label="Speed">
              <select
                value={data.animationSpeed || 'normal'}
                onChange={(e) =>
                  onUpdate(edge.id, { data: { ...data, animationSpeed: e.target.value as EdgeAnimationSpeed } })
                }
                style={selectStyle}
              >
                <option value="slow">slow · 3.5s</option>
                <option value="normal">normal · 2.2s</option>
                <option value="fast">fast · 1.2s</option>
              </select>
            </BareField>
            <ColorRow
              label="particle"
              value={data.flowColor || '#FF5A1F'}
              onChange={(v) => onUpdate(edge.id, { data: { ...data, flowColor: v } })}
            />
          </>
        )}

        <Divider />

        <BareField label="Routing">
          <select
            value={routing}
            onChange={(e) => onUpdate(edge.id, { routing: e.target.value as EdgeRouting })}
            style={selectStyle}
          >
            <option value="orthogonal">fillet orthogonal</option>
            <option value="curved">bezier curve</option>
            <option value="step">step orthogonal</option>
            <option value="straight">straight</option>
          </select>
        </BareField>

        <BareField label="Stroke style">
          <select
            value={edgeStyle}
            onChange={(e) => onUpdate(edge.id, { style: e.target.value as EdgeStyle })}
            style={selectStyle}
          >
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
          </select>
        </BareField>

        <Divider />

        <BareField label="Label">
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdate(edge.id, { data: { ...data, label: e.target.value } })}
            placeholder="HTTPS / REST / gRPC"
            style={inputBareStyle}
          />
        </BareField>

        <BareField label="Step number">
          <input
            type="number"
            value={data.stepNumber !== undefined ? String(data.stepNumber) : ''}
            onChange={(e) =>
              onUpdate(edge.id, {
                data: { ...data, stepNumber: e.target.value === '' ? undefined : Number(e.target.value) },
              })
            }
            placeholder="1, 2, 3…"
            style={inputBareStyle}
          />
        </BareField>

        <Divider />

        <ColorRow
          label="stroke"
          value={data.color || '#8C8A85'}
          onChange={(v) => onUpdate(edge.id, { data: { ...data, color: v } })}
        />
      </div>
    </aside>
  );
}

function SectionTitle({ title, tag }: { title: string; tag: string }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-ink)',
        }}
      >
        {title}
      </h3>
      <Chip
        size="sm"
        variant="soft"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          height: 18,
          padding: '0 6px',
          background: 'transparent',
          color: 'var(--color-ink-3)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 4,
        }}
      >
        {tag}
      </Chip>
    </div>
  );
}

function BareField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        className="t-mono"
        style={{
          color: 'var(--color-ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-hairline)' }} />;
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <BareField label={label}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 0',
          borderBottom: '1px solid var(--color-hairline)',
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 20,
            height: 20,
            background: 'transparent',
            border: '1px solid var(--color-hairline)',
            borderRadius: 4,
            cursor: 'pointer',
            padding: 0,
          }}
        />
        <span className="t-mono" style={{ fontSize: 11, color: 'var(--color-ink-2)' }}>
          {value.toUpperCase()}
        </span>
      </div>
    </BareField>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 4px',
  background: 'transparent',
  color: 'var(--color-ink)',
  border: 'none',
  borderBottom: '1px solid var(--color-hairline)',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  borderRadius: 0,
};

const inputBareStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  padding: '6px 0',
  border: 'none',
  borderBottom: '1px solid var(--color-hairline)',
  outline: 'none',
  borderRadius: 0,
};
