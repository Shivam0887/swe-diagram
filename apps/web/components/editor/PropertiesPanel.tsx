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
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Chip, Select, ListBox } from '@heroui/react';
import type {
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  GroupStyle,
  NodeShape,
  EdgeAnimationSpeed,
  EdgeAnimationType,
  EdgeRouting,
  EdgeStyle,
} from '@platform/diagram-schema';
import { iconRegistry, getLucideIcon, getTablerIcon, IconShapes } from '@platform/icon-library';
import { IconPickerModal } from './IconPickerModal';

// Polished shapes (the "Bento" visual system) come first — those are the
// renders the user actually sees. Legacy shapes (cylinder, queue_buffer,
// browser_window, device_mobile, cloud) are kept for backward compatibility
// with existing sample diagrams but are presented in a separate section.
const POLISHED_NODE_SHAPES: { id: NodeShape; label: string }[] = [
  { id: 'bento_card', label: 'Bento card' },
  { id: 'data_cylinder', label: 'Data cylinder' },
  { id: 'event_stream', label: 'Event stream' },
  { id: 'serverless_function', label: 'Serverless function' },
  { id: 'user_avatar', label: 'User avatar' },
  { id: 'tier_card', label: 'Tier card' },
  { id: 'gateway_ribbon', label: 'Gateway ribbon' },
];

const LEGACY_NODE_SHAPES: { id: NodeShape; label: string }[] = [
  { id: 'rounded_card', label: 'Rounded card' },
  { id: 'cylinder', label: 'Database cylinder' },
  { id: 'queue_buffer', label: 'Queue buffer' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'browser_window', label: 'Browser window' },
  { id: 'device_mobile', label: 'Mobile device' },
  { id: 'pill', label: 'Pill / capsule' },
  { id: 'hexagon', label: 'Hexagon worker' },
  { id: 'diamond', label: 'Decision diamond' },
  { id: 'note', label: 'Sticky note' },
  { id: 'text_only', label: 'Text only' },
];

const NODE_SHAPES: { id: NodeShape; label: string }[] = [
  ...POLISHED_NODE_SHAPES,
  ...LEGACY_NODE_SHAPES,
];

const PRESET_COLORS = ['#0B0B0C', '#131315', '#E8E2D5', '#FF5A1F', '#8C8A85', '#4A4944', '#26262A'];

interface PropertiesPanelProps {
  selectedNode: DiagramNode | null;
  selectedEdge: DiagramEdge | null;
  selectedGroup?: DiagramGroup | null;
  onUpdateNode: (id: string, updates: Partial<DiagramNode>) => void;
  onUpdateEdge: (id: string, updates: Partial<DiagramEdge>) => void;
  onUpdateGroup?: (id: string, updates: Partial<DiagramGroup>) => void;
  /**
   * Hard-delete the currently-selected element. Wired to the trash button
   * in the panel header — pressing Backspace/Delete on the keyboard
   * is also handled at the page level.
   */
  onDelete?: (kind: 'node' | 'edge' | 'group') => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  selectedGroup,
  onUpdateNode,
  onUpdateEdge,
  onUpdateGroup,
  onDelete,
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
        onDelete={onDelete ? () => onDelete('node') : undefined}
      />
    );
  } else if (selectedEdge) {
    body = (
      <EdgeProperties
        edge={selectedEdge}
        onUpdate={onUpdateEdge}
        onDelete={onDelete ? () => onDelete('edge') : undefined}
      />
    );
  } else if (selectedGroup && onUpdateGroup) {
    body = (
      <GroupProperties
        group={selectedGroup}
        onUpdate={onUpdateGroup}
        onDelete={onDelete ? () => onDelete('group') : undefined}
      />
    );
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
  onDelete,
}: {
  node: DiagramNode;
  onUpdate: (id: string, updates: Partial<DiagramNode>) => void;
  onOpenIcon: () => void;
  onDelete?: () => void;
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
      <SectionTitle title="Node" tag={node.type} onDelete={onDelete} />

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BareField label="Shape" icon={<Layers size={11} />}>
          <BareSelect
            ariaLabel="Node shape"
            value={currentShape}
            onChange={(v) => onUpdate(node.id, { shape: v as NodeShape })}
            sections={[
              { label: 'Polished', options: POLISHED_NODE_SHAPES },
              { label: 'Legacy', options: LEGACY_NODE_SHAPES },
            ]}
          />
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
              {iconDef && iconDef.source === 'lucide' && getLucideIcon(iconDef.name) ? (
                React.createElement(getLucideIcon(iconDef.name)!, {
                  size: 12,
                  color: 'var(--color-ink-2)',
                })
              ) : iconDef && iconDef.source === 'tabler' && getTablerIcon(iconDef.name) ? (
                React.createElement(getTablerIcon(iconDef.name)!, {
                  size: 12,
                  color: 'var(--color-ink-2)',
                  stroke: 1.5,
                })
              ) : iconDef && iconDef.nodes && iconDef.nodes.length > 0 ? (
                <svg viewBox={iconDef.viewBox || '0 0 24 24'} style={{ width: 12, height: 12, fill: 'var(--color-ink-2)' }}>
                  <IconShapes def={iconDef} currentColor={false} />
                </svg>
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
  onDelete,
}: {
  edge: DiagramEdge;
  onUpdate: (id: string, updates: Partial<DiagramEdge>) => void;
  onDelete?: () => void;
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
      <SectionTitle title="Edge" tag={edge.id.slice(0, 16)} onDelete={onDelete} />

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
            <BareField label="Animation">
              <BareSelect
                ariaLabel="Animation type"
                value={data.animationType || 'particles'}
                onChange={(v) =>
                  onUpdate(edge.id, { data: { ...data, animationType: v as EdgeAnimationType } })
                }
                options={[
                  { id: 'particles', label: 'particles · dot flow' },
                  { id: 'dash_flow', label: 'dash flow · marching ants' },
                  { id: 'pulse', label: 'pulse · rhythmic stroke' },
                ]}
              />
            </BareField>
            <BareField label="Speed">
              <BareSelect
                ariaLabel="Animation speed"
                value={data.animationSpeed || 'normal'}
                onChange={(v) =>
                  onUpdate(edge.id, { data: { ...data, animationSpeed: v as EdgeAnimationSpeed } })
                }
                options={[
                  { id: 'slow', label: 'slow · 3.5s' },
                  { id: 'normal', label: 'normal · 2.2s' },
                  { id: 'fast', label: 'fast · 1.2s' },
                ]}
              />
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
          <BareSelect
            ariaLabel="Edge routing"
            value={routing}
            onChange={(v) => onUpdate(edge.id, { routing: v as EdgeRouting })}
            options={[
              { id: 'orthogonal', label: 'fillet orthogonal' },
              { id: 'curved', label: 'bezier curve' },
              { id: 'step', label: 'step orthogonal' },
              { id: 'straight', label: 'straight' },
            ]}
          />
        </BareField>

        <BareField label="Stroke style">
          <BareSelect
            ariaLabel="Stroke style"
            value={edgeStyle}
            onChange={(v) => onUpdate(edge.id, { style: v as EdgeStyle })}
            options={[
              { id: 'solid', label: 'solid' },
              { id: 'dashed', label: 'dashed' },
              { id: 'dotted', label: 'dotted' },
            ]}
          />
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.stepNumber !== undefined ? String(data.stepNumber) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              onUpdate(edge.id, {
                data: { ...data, stepNumber: raw === '' ? undefined : Number(raw) },
              });
            }}
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

function SectionTitle({ title, tag, onDelete }: { title: string; tag: string; onDelete?: () => void }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-ink)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
        {onDelete && (
          <button
            onClick={onDelete}
            title="Delete (Del)"
            aria-label="Delete"
            style={{
              width: 26,
              height: 26,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--color-hairline)',
              borderRadius: 6,
              color: 'var(--color-ink-3)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 150ms ease, border-color 150ms ease, background-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-ink-3)';
              e.currentTarget.style.borderColor = 'var(--color-hairline)';
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
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

/**
 * Bare-styled HeroUI Select that matches the editor's hairline-underline
 * look. Replaces the native `<select>` so the dropdown options get a
 * proper dark-themed popover and styled list rows.
 *
 * Accepts either a flat `options` list or a `sections` list for grouped
 * dropdowns (used by Shape to separate polished from legacy shapes).
 */
type BareSelectOption = { id: string; label: string };
type BareSelectSection = { label: string; options: BareSelectOption[] };

// Shared class strings used by HeroUI 3.2 components. Their typings only
// accept `className`, so we concatenate the Tailwind v4 important-modifier
// utilities into a single string rather than passing the `classNames` map.
const TRIGGER_CLASS =
  '!h-8 !bg-transparent !border-0 !border-b !border-b-[var(--color-hairline)] !rounded-none !px-1 !shadow-none data-[hover=true]:!bg-transparent';
const VALUE_CLASS = '!text-[13px] !font-sans !text-[var(--color-ink)]';
const POPOVER_CLASS =
  '!bg-[var(--color-bg-raised)] !border !border-[var(--color-hairline)] !rounded-md';
const LISTBOX_CLASS = '!p-1 !bg-transparent';
const ITEM_CLASS =
  '!rounded-sm !text-[13px] !text-[var(--color-ink)] data-[hover=true]:!bg-[var(--color-bg)] data-[hover=true]:!text-[var(--color-ink)] data-[selected=true]:!text-[var(--color-accent)]';
const SECTION_HEADING_CLASS =
  '!text-[10px] !uppercase !tracking-[0.06em] !font-mono !text-[var(--color-ink-3)] !px-2 !pt-2 !pb-1';

function BareSelect({
  value,
  onChange,
  options,
  sections,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  options?: BareSelectOption[];
  sections?: BareSelectSection[];
  placeholder?: string;
  ariaLabel?: string;
}) {
  // Build a flat list of options for the popover rows.
  const flatOptions: BareSelectOption[] = options ?? (sections ? sections.flatMap((s) => s.options) : []);

  // HeroUI's TS surface for Select/ListBox/ListBoxItem/ListBoxSection in
  // 3.2.4 only exposes `className` and a few other primitive props, so we
  // cast through `any` to keep the styling we want without losing the
  // composition API.
  const SelectAny = Select as any;
  const TriggerAny = (Select as any).Trigger;
  const ValueAny = (Select as any).Value;
  const IndicatorAny = (Select as any).Indicator;
  const PopoverAny = (Select as any).Popover;
  const ListBoxAny = ListBox as any;
  const SectionAny = (ListBox as any).Section;
  const ItemAny = (ListBox as any).Item;

  return (
    <SelectAny
      aria-label={ariaLabel}
      selectedKey={value}
      onSelectionChange={(keys: unknown) => {
        if (keys == null) return;
        let next: string | undefined;
        if (typeof keys === 'string') next = keys;
        else if (typeof (keys as { has?: unknown }).has === 'function') {
          // HeroUI passes a `Selection` (a Set-like) for single mode.
          const setLike = keys as Set<string>;
          const first = setLike.values().next().value as string | undefined;
          next = first;
        }
        if (next && next !== value) onChange(next);
      }}
    >
      <TriggerAny className={TRIGGER_CLASS}>
        <ValueAny className={VALUE_CLASS}>
          <span
            style={{
              fontSize: 13,
              color:
                flatOptions.find((o) => o.id === value)?.label ||
                sections?.flatMap((s) => s.options).find((o) => o.id === value)?.label
                  ? 'var(--color-ink)'
                  : 'var(--color-ink-3)',
            }}
          >
            {flatOptions.find((o) => o.id === value)?.label ||
              sections?.flatMap((s) => s.options).find((o) => o.id === value)?.label ||
              placeholder}
          </span>
        </ValueAny>
        <IndicatorAny>
          <ChevronDown size={12} style={{ color: 'var(--color-ink-2)' }} />
        </IndicatorAny>
      </TriggerAny>
      <PopoverAny placement="bottom start" className={POPOVER_CLASS}>
        <ListBoxAny aria-label={ariaLabel} className={LISTBOX_CLASS}>
          {sections
            ? sections.map((section: BareSelectSection) => (
                <SectionAny
                  key={section.label}
                  id={section.label}
                  title={section.label}
                  className={SECTION_HEADING_CLASS}
                >
                  {section.options.map((opt) => (
                    <ItemAny
                      key={opt.id}
                      id={opt.id}
                      textValue={opt.label}
                      className={ITEM_CLASS}
                    >
                      {opt.label}
                    </ItemAny>
                  ))}
                </SectionAny>
              ))
            : flatOptions.map((opt) => (
                <ItemAny
                  key={opt.id}
                  id={opt.id}
                  textValue={opt.label}
                  className={ITEM_CLASS}
                >
                  {opt.label}
                </ItemAny>
              ))}
        </ListBoxAny>
      </PopoverAny>
    </SelectAny>
  );
}

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

const GROUP_STYLE_OPTIONS: { id: GroupStyle; label: string }[] = [
  { id: 'boundary', label: 'Boundary' },
  { id: 'container', label: 'Container' },
  { id: 'swimlane', label: 'Swimlane' },
  { id: 'card', label: 'Card' },
];

// A group can borrow colors from any node role. We list the canonical
// roles here; the renderer / React node will silently fall back to the
// per-style default if the role key is missing from the theme.
const GROUP_COLOR_ROLE_OPTIONS: { id: string; label: string }[] = [
  { id: '__default__', label: 'Theme default' },
  { id: 'client', label: 'Client' },
  { id: 'compute', label: 'Compute' },
  { id: 'storage', label: 'Storage' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'cache', label: 'Cache' },
  { id: 'network', label: 'Network' },
  { id: 'security', label: 'Security' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'external', label: 'External' },
  { id: 'general', label: 'General' },
];

function GroupProperties({
  group,
  onUpdate,
  onDelete,
}: {
  group: DiagramGroup;
  onUpdate: (id: string, updates: Partial<DiagramGroup>) => void;
  onDelete?: () => void;
}) {
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
      <SectionTitle title="Group" tag={group.id.slice(0, 16)} onDelete={onDelete} />

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BareField label="Title">
          <input
            type="text"
            value={group.title}
            onChange={(e) => onUpdate(group.id, { title: e.target.value })}
            style={inputBareStyle}
          />
        </BareField>

        <BareField label="Subtitle">
          <input
            type="text"
            value={group.subtitle ?? ''}
            onChange={(e) => onUpdate(group.id, { subtitle: e.target.value })}
            style={inputBareStyle}
          />
        </BareField>

        <BareField label="Style">
          <BareSelect
            value={group.style ?? 'boundary'}
            onChange={(v) => onUpdate(group.id, { style: v as GroupStyle })}
            options={GROUP_STYLE_OPTIONS}
            ariaLabel="Group style"
          />
        </BareField>

        <BareField label="Color role">
          <BareSelect
            value={group.colorRole ?? '__default__'}
            onChange={(v) =>
              onUpdate(group.id, { colorRole: v === '__default__' ? undefined : v })
            }
            options={GROUP_COLOR_ROLE_OPTIONS}
            ariaLabel="Group color role"
          />
        </BareField>

        <Divider />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="t-mono" style={{ color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
            Size
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <BareField label="W">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(Math.round(group.size.width))}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  const next = Math.max(80, Number(raw) || 80);
                  onUpdate(group.id, { size: { ...group.size, width: next } });
                }}
                style={inputBareStyle}
              />
            </BareField>
            <BareField label="H">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(Math.round(group.size.height))}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  const next = Math.max(60, Number(raw) || 60);
                  onUpdate(group.id, { size: { ...group.size, height: next } });
                }}
                style={inputBareStyle}
              />
            </BareField>
          </div>
        </div>
      </div>
    </aside>
  );
}
