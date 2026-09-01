'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNode, NodeShape } from '@platform/diagram-schema';
import {
  getIcon,
  getLucideIcon,
  getTablerIcon,
  IconShapes,
  type DiagramIconDefinition,
} from '@platform/icon-library';
import { resolveTheme } from '@platform/design-system';

export type CustomNodeData = DiagramNode['data'] & {
  shape?: DiagramNode['shape'];
  style?: DiagramNode['style'];
  themeId?: string;
};

type RoleColors = ReturnType<typeof resolveTheme>['nodes'][keyof ReturnType<typeof resolveTheme>['nodes']];

/**
 * Hand-tuned React Flow node for the polished visual system. The shape
 * switch mirrors the SVG renderer in @platform/diagram-renderer. The
 * "bento_card" branch is the default and the signature look: accent-tinted
 * border, 36×36 colored icon chip on the left, two-line label centered, an
 * optional tech badge pill at bottom-right, plus small connector dots at
 * the four edge midpoints.
 */
export const CustomDiagramNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const theme = resolveTheme(nodeData.themeId ?? 'polished-dark');
  const role = nodeData.role ?? 'compute';
  const roleColors = theme.nodes[role] ?? theme.nodes.compute;

  const shape: NodeShape = nodeData.shape ?? 'bento_card';
  const customStyle = nodeData.style;

  const bgColor = customStyle?.backgroundColor ?? roleColors.background;
  const borderColor = customStyle?.borderColor ?? roleColors.border;
  const borderWidth = customStyle?.borderWidth ?? 1.5;
  const borderRadius = customStyle?.borderRadius ?? 14;
  const titleColor = customStyle?.textColor ?? roleColors.text;
  const iconColor = customStyle?.iconColor ?? roleColors.icon;
  const accentColor = customStyle?.accentColor ?? borderColor;

  const iconDef = nodeData.icon ? getIcon(nodeData.icon) : null;
  const showIcon = nodeData.showIcon !== false && iconDef !== null && iconDef.nodes.length > 0;

  const title = nodeData.title;
  const subtitle = nodeData.subtitle;
  const hasSubtitle = !!subtitle;
  const badge = nodeData.badge;
  const pulsing = !!nodeData.pulsing;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';

  return (
    <div
      style={{
        position: 'relative',
        filter: selected
          ? `drop-shadow(0 0 0 ${accentColor}) drop-shadow(0 0 8px ${accentColor}55)`
          : undefined,
        transition: 'filter 0.15s ease',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />

      {shape === 'bento_card' && (
        <BentoCard
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          showIcon={showIcon}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
          accentColor={accentColor}
        />
      )}

      {shape === 'data_cylinder' && (
        <DataCylinder
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          showIcon={showIcon}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
        />
      )}

      {shape === 'event_stream' && (
        <EventStream
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          showIcon={showIcon}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          tags={nodeData.tags ?? []}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
        />
      )}

      {shape === 'serverless_function' && (
        <ServerlessFunction
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
        />
      )}

      {shape === 'user_avatar' && (
        <UserAvatar
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          selected={!!selected}
        />
      )}

      {shape === 'tier_card' && (
        <TierCard
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          selected={!!selected}
        />
      )}

      {shape === 'gateway_ribbon' && (
        <GatewayRibbon
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          showIcon={showIcon}
          title={title}
          subtitle={subtitle}
          hasSubtitle={hasSubtitle}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
        />
      )}

      {shape === 'cylinder' && (
        <LegacyCylinder
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {shape === 'queue_buffer' && (
        <LegacyQueueBuffer
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {shape === 'browser_window' && (
        <LegacyBrowserWindow
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {shape === 'device_mobile' && (
        <LegacyMobileDevice
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {shape === 'cloud' && (
        <LegacyCloud
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {shape === 'note' && (
        <LegacyNote
          title={title}
          subtitle={subtitle}
          selected={!!selected}
        />
      )}

      {(shape === 'rounded_card' || shape === 'pill' || shape === 'hexagon' || shape === 'diamond' || shape === 'text_only') && (
        <LegacyRoundedCard
          bgColor={bgColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          iconColor={iconColor}
          iconDef={iconDef}
          title={title}
          subtitle={subtitle}
          badge={badge}
          pulsing={pulsing}
          selected={!!selected}
          accentColor={accentColor}
          shape={shape}
        />
      )}

      <style>{`@keyframes ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }`}</style>
    </div>
  );
});

CustomDiagramNode.displayName = 'CustomDiagramNode';

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Small filled disc at the four midpoints — the architectural "connector" tell. */
function ConnectorDots({
  color,
  inset = 0,
}: {
  color: string;
  inset?: number;
}) {
  const size = 6;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    opacity: 0.55,
    pointerEvents: 'none',
  };
  const s: React.CSSProperties = { ...base, top: -size / 2 + inset, left: '50%', transform: 'translateX(-50%)' };
  const n: React.CSSProperties = { ...base, bottom: -size / 2 + inset, left: '50%', transform: 'translateX(-50%)' };
  const w: React.CSSProperties = { ...base, left: -size / 2 + inset, top: '50%', transform: 'translateY(-50%)' };
  const e: React.CSSProperties = { ...base, right: -size / 2 + inset, top: '50%', transform: 'translateY(-50%)' };
  return (
    <>
      <span style={s} />
      <span style={n} />
      <span style={w} />
      <span style={e} />
    </>
  );
}

function PulsingDot({ color, accentColor }: { color: string; accentColor: string }) {
  return (
    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          opacity: 0.3,
          animation: 'ping 1.5s ease-in-out infinite',
        }}
      />
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
    </div>
  );
}

function TechBadge({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 6,
        right: 8,
        padding: '1px 8px',
        fontSize: 9,
        fontWeight: 600,
        color,
        background: `${color}26`,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {label}
    </div>
  );
}

function IconChip({
  iconDef,
  iconColor,
  accentColor,
  size = 22,
  chipSize = 36,
}: {
  iconDef: DiagramIconDefinition | null;
  iconColor: string;
  accentColor: string;
  size?: number;
  chipSize?: number;
}) {
  if (!iconDef || iconDef.nodes.length === 0) return null;
  const innerOffset = (chipSize - size) / 2;
  // Icon from a third-party React-component library (Lucide, Tabler) — render
  // the component directly. Otherwise fall back to the native `nodes` painter.
  const LucideIcon = iconDef.source === 'lucide' ? getLucideIcon(iconDef.name) : null;
  const TablerIconComp =
    iconDef.source === 'tabler' ? getTablerIcon(iconDef.name) : null;
  return (
    <div
      style={{
        width: chipSize,
        height: chipSize,
        borderRadius: 9,
        background: `${accentColor}24`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {LucideIcon ? (
        <LucideIcon
          size={size}
          color={iconColor}
          style={{ position: 'absolute', top: innerOffset, left: innerOffset }}
        />
      ) : TablerIconComp ? (
        <TablerIconComp
          size={size}
          color={iconColor}
          stroke={1.5}
          style={{ position: 'absolute', top: innerOffset, left: innerOffset }}
        />
      ) : (
        <svg
          viewBox={iconDef.viewBox || '0 0 24 24'}
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: innerOffset,
            left: innerOffset,
            fill: iconColor,
          }}
        >
          <IconShapes def={iconDef} currentColor={false} />
        </svg>
      )}
    </div>
  );
}

// ─── 1. Bento Card ──────────────────────────────────────────────────────────

function BentoCard(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  showIcon: boolean;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  badge?: string;
  pulsing: boolean;
  selected: boolean;
  accentColor: string;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, showIcon, title, hasSubtitle, subtitle, badge, pulsing, selected, accentColor } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 180,
        minHeight: 88,
        background: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <ConnectorDots color={borderColor} />
      {pulsing && <PulsingDot color={borderColor} accentColor={accentColor} />}
      {badge && <TechBadge label={badge} color={borderColor} />}
      {showIcon && (
        <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={22} chipSize={36} />
      )}
      <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '18px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {title}
        </div>
        {hasSubtitle && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: subtitleColor,
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '14px',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. Data Cylinder ───────────────────────────────────────────────────────

function DataCylinder(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  showIcon: boolean;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  badge?: string;
  pulsing: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, titleColor, subtitleColor, iconColor, iconDef, showIcon, title, hasSubtitle, subtitle, badge, pulsing, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 168,
        height: 110,
        background: bgColor,
        borderRadius: 9999,
        border: `${borderWidth}px solid ${borderColor}`,
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      {/* Top + bottom hairlines that suggest the cylinder bands */}
      <div style={{ position: 'absolute', left: 12, right: 12, top: 26, height: 1, background: borderColor, opacity: 0.3 }} />
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 26, height: 1, background: borderColor, opacity: 0.3 }} />
      <ConnectorDots color={borderColor} />
      {pulsing && <PulsingDot color={borderColor} accentColor={borderColor} />}
      {badge && <TechBadge label={badge} color={borderColor} />}
      {showIcon && (
        <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={20} chipSize={32} />
      )}
      <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '18px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {title}
        </div>
        {hasSubtitle && (
          <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ─── 3. Event Stream ────────────────────────────────────────────────────────

function EventStream(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  showIcon: boolean;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  tags: string[];
  badge?: string;
  pulsing: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, titleColor, subtitleColor, iconColor, iconDef, showIcon, title, hasSubtitle, subtitle, tags, badge, pulsing, selected } = props;
  const topicLabels = tags.length > 0 ? tags.slice(0, 3) : ['topic'];
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 220,
        minHeight: 88,
        background: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <ConnectorDots color={borderColor} />
      {pulsing && <PulsingDot color={borderColor} accentColor={borderColor} />}
      {badge && <TechBadge label={badge} color={borderColor} />}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {topicLabels.map((label, i) => (
          <span
            key={`${label}-${i}`}
            style={{
              padding: '2px 8px',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: borderColor,
              background: `${borderColor}22`,
              border: `1px solid ${borderColor}55`,
              borderRadius: 999,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: titleColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '18px',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            {title}
          </div>
          {hasSubtitle && (
            <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
          )}
        </div>
        {showIcon && <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={18} chipSize={30} />}
      </div>
    </div>
  );
}

// ─── 4. Serverless Function ─────────────────────────────────────────────────

function ServerlessFunction(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  badge?: string;
  pulsing: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, title, hasSubtitle, subtitle, badge, pulsing, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 200,
        minHeight: 80,
        background: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        padding: '12px 18px 12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <ConnectorDots color={borderColor} />
      {pulsing && <PulsingDot color={borderColor} accentColor={borderColor} />}
      {badge && <TechBadge label={badge} color={borderColor} />}
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: borderColor,
          lineHeight: 1,
          fontFamily: 'var(--font-serif, "Instrument Serif", serif)',
          flexShrink: 0,
        }}
      >
        λ
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '18px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {title}
        </div>
        {hasSubtitle && (
          <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ─── 5. User Avatar ─────────────────────────────────────────────────────────

function UserAvatar(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, title, hasSubtitle, subtitle, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 200,
        minHeight: 84,
        background: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <ConnectorDots color={borderColor} />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `${borderColor}26`,
          border: `1.5px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" width={28} height={28} style={{ fill: borderColor }}>
          <path d="M12 4 A4 4 0 1 0 12 12 A4 4 0 1 0 12 4 Z" />
          <path d="M4 21 A8 8 0 0 1 20 21" />
        </svg>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '18px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {title}
        </div>
        {hasSubtitle && (
          <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ─── 6. Tier Card ───────────────────────────────────────────────────────────

function TierCard(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, title, hasSubtitle, subtitle, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 220,
        minHeight: 60,
        background: bgColor,
        border: `${borderWidth}px dashed ${borderColor}`,
        borderRadius,
        padding: '10px 16px',
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: borderColor,
          letterSpacing: '0.12em',
          fontFamily: 'var(--font-mono, monospace)',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      {hasSubtitle && (
        <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
      )}
    </div>
  );
}

// ─── 7. Gateway Ribbon ──────────────────────────────────────────────────────

function GatewayRibbon(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  showIcon: boolean;
  title: string;
  subtitle?: string;
  hasSubtitle: boolean;
  badge?: string;
  pulsing: boolean;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, showIcon, title, hasSubtitle, subtitle, badge, pulsing, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 220,
        minHeight: 72,
        background: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        padding: '12px 32px 12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <ConnectorDots color={borderColor} />
      {pulsing && <PulsingDot color={borderColor} accentColor={borderColor} />}
      {badge && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 32,
            padding: '1px 8px',
            fontSize: 9,
            fontWeight: 600,
            color: borderColor,
            background: `${borderColor}26`,
            border: `1px solid ${borderColor}55`,
            borderRadius: 999,
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.04em',
          }}
        >
          {badge}
        </div>
      )}
      {/* Three "port" stripes on the right */}
      <div
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: 2,
              height: 6,
              borderRadius: 1,
              background: borderColor,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      {showIcon && <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={20} chipSize={32} />}
      <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '18px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {title}
        </div>
        {hasSubtitle && (
          <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2, lineHeight: '14px' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ─── Legacy shapes (kept so older sample diagrams still render) ─────────────

function LegacyCylinder(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 160,
        minHeight: 90,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '12px 16px',
        backgroundColor: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: 0,
          right: 0,
          height: 16,
          borderRadius: '50% / 100%',
          borderTop: `${borderWidth}px solid ${borderColor}`,
          borderLeft: `${borderWidth}px solid ${borderColor}`,
          borderRight: `${borderWidth}px solid ${borderColor}`,
          backgroundColor: bgColor,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 1,
          borderBottom: `1px dashed ${borderColor}`,
          opacity: 0.4,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        {iconDef && iconDef.nodes.length > 0 && (
          <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={16} chipSize={28} />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              color: borderColor,
              fontFamily: 'var(--font-mono, monospace)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle || 'database'}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: titleColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegacyQueueBuffer(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, selected } = props;
  return (
    <div
      style={{
        position: 'relative',
        minWidth: 180,
        minHeight: 76,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 8,
          top: 8,
          bottom: 8,
          width: 36,
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        <div style={{ width: 1, height: '100%', background: borderColor }} />
        <div style={{ width: 1, height: '100%', background: borderColor }} />
        <div style={{ width: 1, height: '100%', background: borderColor }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 32 }}>
        {iconDef && iconDef.nodes.length > 0 && (
          <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={16} chipSize={28} />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              color: borderColor,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            queue
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: titleColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 9, color: subtitleColor, fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegacyBrowserWindow(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, selected } = props;
  return (
    <div
      style={{
        minWidth: 170,
        minHeight: 92,
        borderRadius,
        backgroundColor: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: `1px solid ${borderColor}33`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
        <span
          style={{
            marginLeft: 6,
            flex: 1,
            fontSize: 9,
            color: subtitleColor,
            fontFamily: 'var(--font-mono, monospace)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle || 'https://app.io'}
        </span>
      </div>
      <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        {iconDef && iconDef.nodes.length > 0 && (
          <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={14} chipSize={24} />
        )}
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

function LegacyMobileDevice(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, selected } = props;
  return (
    <div
      style={{
        minWidth: 130,
        minHeight: 92,
        borderRadius: 14,
        backgroundColor: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ width: 28, height: 3, background: borderColor, borderRadius: 2, margin: '0 auto', opacity: 0.6 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {iconDef && iconDef.nodes.length > 0 && (
          <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={14} chipSize={24} />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: titleColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 9, color: subtitleColor, fontFamily: 'var(--font-mono, monospace)' }}>{subtitle}</div>
          )}
        </div>
      </div>
      <div style={{ width: 24, height: 2, background: borderColor, borderRadius: 2, margin: '0 auto', opacity: 0.4 }} />
    </div>
  );
}

function LegacyCloud(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, selected } = props;
  return (
    <div
      style={{
        minWidth: 170,
        minHeight: 85,
        borderRadius,
        backgroundColor: bgColor,
        border: `${borderWidth}px dashed ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {iconDef && iconDef.nodes.length > 0 && (
        <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={16} chipSize={28} />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 9, color: subtitleColor, fontFamily: 'var(--font-mono, monospace)' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function LegacyNote(props: {
  title: string;
  subtitle?: string;
  selected: boolean;
}) {
  return (
    <div
      style={{
        minWidth: 160,
        minHeight: 80,
        borderRadius: 8,
        backgroundColor: '#3F2C00',
        border: `1px solid #FBBF24`,
        boxShadow: props.selected ? `0 0 0 1px #FBBF24` : 'none',
        padding: 12,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 14,
          background: '#FBBF2444',
          border: '1px solid #FBBF2488',
          borderRadius: 2,
        }}
      />
      <div style={{ fontSize: 12, fontWeight: 500, color: '#FBBF24', marginTop: 4 }}>{props.title}</div>
      {props.subtitle && (
        <div
          style={{
            fontSize: 9,
            color: '#FBBF24',
            opacity: 0.8,
            marginTop: 4,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {props.subtitle}
        </div>
      )}
    </div>
  );
}

function LegacyRoundedCard(props: {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  iconDef: ReturnType<typeof getIcon> | null;
  title: string;
  subtitle?: string;
  badge?: string;
  pulsing: boolean;
  selected: boolean;
  accentColor: string;
  shape: string;
}) {
  const { bgColor, borderColor, borderWidth, borderRadius, titleColor, subtitleColor, iconColor, iconDef, title, subtitle, badge, pulsing, selected, accentColor, shape } = props;
  return (
    <div
      style={{
        minWidth: 170,
        minHeight: 76,
        backgroundColor: bgColor,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
        borderRadius: shape === 'pill' ? 999 : shape === 'hexagon' ? 4 : shape === 'diamond' ? 4 : borderRadius,
        padding: shape === 'pill' ? '10px 22px' : '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accentColor }} />
      {pulsing && <PulsingDot color={borderColor} accentColor={accentColor} />}
      {badge && <TechBadge label={badge} color={borderColor} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 }}>
        {iconDef && iconDef.nodes.length > 0 && (
          <IconChip iconDef={iconDef} iconColor={iconColor} accentColor={borderColor} size={16} chipSize={28} />
        )}
        <div style={{ minWidth: 0, paddingRight: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: titleColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 9,
                color: subtitleColor,
                fontFamily: 'var(--font-mono, monospace)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
