'use client';

import React, { memo, useMemo } from 'react';
import { NodeResizeControl, type NodeProps } from '@xyflow/react';
import type { DiagramGroup } from '@platform/diagram-schema';
import { useEditorTheme } from './ThemeContext';

/**
 * React Flow renderer for a DiagramGroup. Sits behind the regular
 * nodes as a draggable, resizable container. Children (nodes that
 * reference this group via `node.groupId`) are visually inside it
 * but are independent React Flow nodes; the group itself is just a
 * non-interactive chrome layer.
 *
 * Three resize controls are exposed: bottom-right (full resize),
 * bottom (height only), right (width only). The top-left corner
 * is reserved for the title chip, so no resize handle there.
 */
export type GroupNodeData = {
  title: string;
  subtitle?: string;
  style: 'boundary' | 'container' | 'swimlane' | 'card';
  colorRole?: string;
  themeId?: string;
};

export const CustomGroupNode = memo(({ data, selected }: NodeProps) => {
  const groupData = data as unknown as GroupNodeData;
  const theme = useEditorTheme();
  const style = groupData.style ?? 'boundary';

  // Pre-compute the alpha-blended swatches for this group's stroke color.
  // `hexWithAlpha` does a regex + three parseInt on every call; for a
  // group with `style === 'card'` we call it 3× in one render (fill, badge
  // bg, badge border). Memoizing keyed on the stroke keeps the work to
  // exactly the alpha variants the style actually needs.
  const role = groupData.colorRole
    ? theme.nodes[groupData.colorRole as keyof typeof theme.nodes]
    : undefined;

  const swatches = useMemo(() => {
    const accentStroke =
      role?.border ??
      (style === 'container'
        ? theme.groups.containerBorder
        : style === 'card'
          ? theme.groups.cardBorder
          : style === 'swimlane'
            ? theme.groups.swimlaneBorder
            : theme.groups.boundaryBorder);
    return {
      accentAlpha016: hexWithAlpha(accentStroke, 0.16),
      accentAlpha040: hexWithAlpha(accentStroke, 0.4),
    };
  }, [role, style, theme]);

  let fill: string;
  let stroke: string;
  let strokeWidth: number;
  let strokeDash: string;
  let textCol: string;

  switch (style) {
    case 'container':
      fill = role ? hexWithAlpha(role.background, 0.4) : theme.groups.containerBackground;
      stroke = role?.border ?? theme.groups.containerBorder;
      textCol = role?.text ?? theme.groups.containerText;
      strokeWidth = 1.5;
      strokeDash = '';
      break;
    case 'card':
      fill = role ? hexWithAlpha(role.background, 0.18) : theme.groups.cardBackground;
      stroke = role?.border ?? theme.groups.cardBorder;
      textCol = role?.text ?? theme.groups.cardText;
      strokeWidth = 1.5;
      strokeDash = '';
      break;
    case 'swimlane':
      fill = role ? hexWithAlpha(role.background, 0.15) : theme.groups.swimlaneBackground;
      stroke = role?.border ?? theme.groups.swimlaneBorder;
      textCol = role?.text ?? theme.groups.swimlaneText;
      strokeWidth = 1;
      strokeDash = '';
      break;
    case 'boundary':
    default:
      fill = role ? hexWithAlpha(role.background, 0.12) : theme.groups.boundaryBackground;
      stroke = role?.border ?? theme.groups.boundaryBorder;
      textCol = role?.text ?? theme.groups.boundaryText;
      strokeWidth = 1;
      strokeDash = '6 4';
      break;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: fill,
        border: `${strokeWidth}px ${strokeDash ? 'dashed' : 'solid'} ${stroke}`,
        borderRadius: 12,
        pointerEvents: 'all',
        // Lift the group above the canvas grid so its fill is visible
        // but still under the child node cards.
      }}
    >
      {style === 'card' ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: 999,
            background: swatches.accentAlpha016,
            border: `1px solid ${swatches.accentAlpha040}`,
            color: textCol,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {groupData.title || 'group'}
        </div>
      ) : style === 'swimlane' ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 16,
            right: 16,
            paddingBottom: 6,
            borderBottom: `1px solid ${swatches.accentAlpha040}`,
            color: textCol,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {groupData.title || 'group'}
          {groupData.subtitle && (
            <span
              style={{
                display: 'block',
                marginTop: 4,
                fontSize: 10,
                fontWeight: 400,
                color: 'var(--color-ink-2)',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              {groupData.subtitle}
            </span>
          )}
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 14,
            color: textCol,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {groupData.title || 'group'}
          {groupData.subtitle && (
            <span
              style={{
                display: 'block',
                marginTop: 2,
                fontSize: 10,
                fontWeight: 400,
                color: 'var(--color-ink-2)',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              {groupData.subtitle}
            </span>
          )}
        </div>
      )}

      {selected && (
        <>
          <NodeResizeControl
            minWidth={120}
            minHeight={80}
            style={{
              background: 'transparent',
              border: 'none',
              width: 12,
              height: 12,
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 12,
                height: 12,
                background: 'var(--color-accent)',
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
          </NodeResizeControl>
        </>
      )}
    </div>
  );
});

CustomGroupNode.displayName = 'CustomGroupNode';

function hexWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return `rgba(140, 138, 133, ${alpha})`;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type { DiagramGroup };
