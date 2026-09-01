import type { DiagramNode } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';
import { getIcon, getIconElements, getIconPrimaryPath } from '@platform/icon-library';
import { escapeXml } from '../utils/sanitize';

/**
 * Render an icon definition as a string of SVG elements. For native
 * `paths: string[]` icons this is just `<path d="…"/>`. For mixed
 * Lucide/Tabler icons it's whatever primitives the source has.
 */
function iconElementsToSvg(icon: ReturnType<typeof getIcon>, fill: string): string {
  const els = getIconElements(icon);
  return els
    .map((el) => {
      const attrs = Object.entries(el.props)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${escapeXml(k)}="${escapeXml(String(v))}"`)
        .join(' ');
      // For non-`line` elements, apply fill if not already set.
      const needsFill = el.tag !== 'line' && el.tag !== 'polyline' && !('fill' in el.props);
      const fillAttr = needsFill ? ` fill="${escapeXml(fill)}"` : '';
      return `<${el.tag}${attrs ? ' ' + attrs : ''}${fillAttr} />`;
    })
    .join('');
}

/**
 * Node renderer — the polished visual system.
 *
 * Each shape is a hand-tuned branch. The "bento_card" branch is the default
 * and the signature look: a pill with an accent-tinted border, a colored
 * icon chip on the left, a two-line label (title + subtitle) centered, an
 * optional tech badge pill at bottom-right, and small connector dots at
 * the four edge midpoints so the eye follows connections like an
 * architectural drawing rather than a flowchart.
 */
export function renderNodeSvg(node: DiagramNode, theme: Theme): string {
  switch (node.shape) {
    case 'bento_card':
      return renderBentoCard(node, theme);
    case 'data_cylinder':
      return renderDataCylinder(node, theme);
    case 'event_stream':
      return renderEventStream(node, theme);
    case 'serverless_function':
      return renderServerlessFunction(node, theme);
    case 'user_avatar':
      return renderUserAvatar(node, theme);
    case 'tier_card':
      return renderTierCard(node, theme);
    case 'gateway_ribbon':
      return renderGatewayRibbon(node, theme);

    // Legacy shapes — kept so existing sample diagrams still render.
    case 'cylinder':
      return renderLegacyCylinder(node, theme);
    case 'queue_buffer':
      return renderLegacyQueueBuffer(node, theme);
    case 'browser_window':
      return renderLegacyBrowserWindow(node, theme);
    case 'device_mobile':
      return renderLegacyMobileDevice(node, theme);
    case 'cloud':
      return renderLegacyCloud(node, theme);

    case 'pill':
    case 'hexagon':
    case 'diamond':
    case 'note':
    case 'text_only':
    default:
      return renderBentoCard(node, theme);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

type RoleColors = Theme['nodes'][keyof Theme['nodes']];

function getRole(node: DiagramNode, theme: Theme): RoleColors {
  const role = node.data.role ?? 'compute';
  return theme.nodes[role] ?? theme.nodes.compute;
}

function resolveIcon(node: DiagramNode) {
  if (!node.data.icon) return null;
  return getIcon(node.data.icon);
}

/**
 * Small filled disc at each of the four midpoints — the architectural
 * "connector" tell. Half opacity so they don't compete with the node's
 * content, but enough to give the eye a clear attach point.
 */
function connectorDots(x: number, y: number, w: number, h: number, color: string): string {
  const r = 3.5;
  return [
    `<circle cx="${x + w / 2}" cy="${y}" r="${r}" fill="${color}" opacity="0.55" />`,
    `<circle cx="${x + w / 2}" cy="${y + h}" r="${r}" fill="${color}" opacity="0.55" />`,
    `<circle cx="${x}" cy="${y + h / 2}" r="${r}" fill="${color}" opacity="0.55" />`,
    `<circle cx="${x + w}" cy="${y + h / 2}" r="${r}" fill="${color}" opacity="0.55" />`,
  ].join('');
}

function pulsingDot(cx: number, cy: number, color: string): string {
  return [
    `<circle cx="${cx}" cy="${cy}" r="8" fill="${color}" opacity="0.25" />`,
    `<circle cx="${cx}" cy="${cy}" r="4" fill="${color}" />`,
  ].join('');
}

/**
 * Renders the colored icon glyph inside a soft-fill chip. The chip is a
 * 36×36 rounded square with the per-category accent at 14% alpha so the
 * icon reads as "colored, illustrated" rather than "outline."
 */
function iconChip(
  cx: number,
  cy: number,
  iconColor: string,
  chipColor: string,
  icon: ReturnType<typeof getIcon>,
  size: number = 22,
  chipSize: number = 36,
): string {
  if (!icon || icon.nodes.length === 0) return '';
  const half = chipSize / 2;
  const left = cx - half;
  const top = cy - half;
  const innerSize = size;
  const innerOffset = (chipSize - innerSize) / 2;
  const paths = iconElementsToSvg(icon, iconColor);
  return `
    <g transform="translate(${left}, ${top})">
      <rect width="${chipSize}" height="${chipSize}" rx="9" fill="${chipColor}" opacity="0.14" />
      <svg viewBox="${icon.viewBox || '0 0 24 24'}" x="${innerOffset}" y="${innerOffset}" width="${innerSize}" height="${innerSize}">
        ${paths}
      </svg>
    </g>
  `.trim();
}

/** Optional tech badge pill at the bottom-right. */
function techBadge(
  x: number,
  y: number,
  label: string,
  color: string,
  fontFamily: string,
  fontSize: number = 10,
): string {
  if (!label) return '';
  // Estimate width: 6.5px per char + 16 padding.
  const w = Math.max(28, Math.round(label.length * 6.5) + 16);
  const h = 18;
  return `
    <g transform="translate(${x - w}, ${y - h})">
      <rect width="${w}" height="${h}" rx="${h / 2}" fill="${color}" opacity="0.16" />
      <text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="600" fill="${color}" style="letter-spacing: 0.04em">
        ${escapeXml(label)}
      </text>
    </g>
  `.trim();
}

// ─── 1. Bento Card (the signature shape) ────────────────────────────────────

function renderBentoCard(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const strokeDasharray =
    style?.borderStyle === 'dashed'
      ? '6 4'
      : style?.borderStyle === 'dotted'
        ? '2 2'
        : 'none';
  const radius = style?.borderRadius ?? 14;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';
  const iconColor = style?.iconColor ?? role.icon;

  const icon = resolveIcon(node);
  const showIcon = data.showIcon !== false && icon !== null;

  const iconCx = x + 30;
  const iconCy = y + height / 2;
  const labelX = showIcon ? x + 64 : x + 18;
  const labelW = width - (showIcon ? 80 : 36);

  // Two-line label, centered vertically.
  const hasSubtitle = !!data.subtitle;
  const titleY = y + height / 2 - (hasSubtitle ? 6 : 4);
  const subtitleY = y + height / 2 + 14;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-bento-card">
      <!-- Body -->
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        rx="${radius}"
        fill="${bgColor}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
      />
      ${connectorDots(x, y, width, height, strokeColor)}
      ${data.pulsing ? pulsingDot(x + width - 16, y + 16, theme.canvas.selectionOutline) : ''}
      ${
        data.badge
          ? techBadge(x + width - 12, y + height - 12, data.badge, strokeColor, theme.typography.fontFamily)
          : ''
      }
      ${
        showIcon
          ? iconChip(iconCx, iconCy, iconColor, strokeColor, icon, 22, 36)
          : ''
      }
      <text
        x="${labelX}"
        y="${titleY}"
        font-family="${escapeXml(theme.typography.fontFamily)}"
        font-size="${theme.typography.nodeTitle.fontSize}"
        font-weight="${theme.typography.nodeTitle.fontWeight}"
        fill="${titleColor}"
        style="text-rendering: geometricPrecision"
      >${escapeXml(data.title)}</text>
      ${
        hasSubtitle
          ? `<text
        x="${labelX}"
        y="${subtitleY}"
        font-family="${escapeXml(theme.typography.fontFamily)}"
        font-size="${theme.typography.nodeSubtitle.fontSize}"
        font-weight="${theme.typography.nodeSubtitle.fontWeight}"
        fill="${subtitleColor}"
        style="text-rendering: geometricPrecision"
      >${escapeXml(data.subtitle ?? '')}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 2. Data Cylinder (databases, caches, indexes) ──────────────────────────

function renderDataCylinder(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';
  const iconColor = style?.iconColor ?? role.icon;

  const rx = width / 2;
  const ry = 16;
  const cyTop = y + ry;
  const cyBottom = y + height - ry;

  const icon = resolveIcon(node);
  const showIcon = data.showIcon !== false && icon !== null;
  const hasSubtitle = !!data.subtitle;

  // Title row sits between the two data bands.
  const labelBlockX = x + 24;
  const labelBlockW = width - 48;
  const titleY = y + height / 2 - (hasSubtitle ? 4 : 0);
  const subtitleY = y + height / 2 + 16;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-data-cylinder">
      <defs>
        <linearGradient id="grad-${escapeXml(id)}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bgColor}" stop-opacity="0.85" />
          <stop offset="50%" stop-color="${bgColor}" stop-opacity="1" />
          <stop offset="100%" stop-color="${bgColor}" stop-opacity="0.85" />
        </linearGradient>
      </defs>
      <!-- Body -->
      <path d="M ${x} ${cyTop} L ${x} ${cyBottom} A ${rx} ${ry} 0 0 0 ${x + width} ${cyBottom} L ${x + width} ${cyTop} Z"
            fill="url(#grad-${escapeXml(id)})" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <ellipse cx="${x + rx}" cy="${cyTop}" rx="${rx}" ry="${ry}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <!-- Two horizontal data bands -->
      <ellipse cx="${x + rx}" cy="${cyTop + 22}" rx="${rx}" ry="${ry}" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.35" />
      <ellipse cx="${x + rx}" cy="${cyBottom - 22}" rx="${rx}" ry="${ry}" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.35" />
      ${connectorDots(x, y + height / 2 - 28, width, 56, strokeColor)}
      ${data.pulsing ? pulsingDot(x + width - 16, y + 16, theme.canvas.selectionOutline) : ''}
      ${
        data.badge
          ? techBadge(x + width - 12, y + height - 12, data.badge, strokeColor, theme.typography.fontFamily)
          : ''
      }
      <!-- Icon + label, centered horizontally -->
      ${
        showIcon
          ? iconChip(labelBlockX + 12, y + height / 2, iconColor, strokeColor, icon, 20, 32)
          : ''
      }
      <text
        x="${labelBlockX + (showIcon ? 36 : 0)}"
        y="${titleY}"
        font-family="${escapeXml(theme.typography.fontFamily)}"
        font-size="${theme.typography.nodeTitle.fontSize}"
        font-weight="${theme.typography.nodeTitle.fontWeight}"
        fill="${titleColor}"
      >${escapeXml(data.title)}</text>
      ${
        hasSubtitle
          ? `<text
        x="${labelBlockX + (showIcon ? 36 : 0)}"
        y="${subtitleY}"
        font-family="${escapeXml(theme.typography.fontFamily)}"
        font-size="${theme.typography.nodeSubtitle.fontSize}"
        fill="${subtitleColor}"
      >${escapeXml(data.subtitle ?? '')}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 3. Event Stream (Kafka, queues) ────────────────────────────────────────

function renderEventStream(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';
  const iconColor = style?.iconColor ?? role.icon;

  const icon = resolveIcon(node);
  const showIcon = data.showIcon !== false && icon !== null;
  const hasSubtitle = !!data.subtitle;

  // Topic chips: derive from data.tags or data.details.topics, fall back to
  // three "topic" placeholders. Max 3 visible to keep the card readable.
  const tags =
    (data.tags && data.tags.length > 0
      ? data.tags.slice(0, 3)
      : (data.details?.topics as string[] | undefined)?.slice(0, 3)) ?? [];
  const topicLabels = tags.length > 0 ? tags : ['topic'];

  const chipsY = y + 14;
  const chipH = 18;
  const chipPadX = 10;
  let chipCursor = x + 14;
  const chipSvgs = topicLabels.map((label) => {
    const w = Math.max(36, label.length * 6.2 + chipPadX * 2);
    const svg = `
      <g transform="translate(${chipCursor}, ${chipsY})">
        <rect width="${w}" height="${chipH}" rx="${chipH / 2}" fill="${strokeColor}" opacity="0.14" />
        <text x="${w / 2}" y="${chipH / 2 + 4}" text-anchor="middle" font-family="${escapeXml(theme.typography.monoFontFamily)}" font-size="9" font-weight="600" fill="${strokeColor}">${escapeXml(label)}</text>
      </g>
    `.trim();
    chipCursor += w + 6;
    return svg;
  });

  const labelBlockX = x + 14;
  const titleY = y + height - 28;
  const subtitleY = y + height - 12;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-event-stream">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      ${connectorDots(x, y, width, height, strokeColor)}
      ${data.pulsing ? pulsingDot(x + width - 16, y + 16, theme.canvas.selectionOutline) : ''}
      ${chipSvgs.join('')}
      ${
        showIcon
          ? `<g transform="translate(${x + width - 38}, ${y + height - 36})">
               ${iconChip(0, 0, iconColor, strokeColor, icon, 18, 30).replace(/transform="translate\([^)]+\)"/, '')}
             </g>`
          : ''
      }
      <text x="${labelBlockX}" y="${titleY}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
      ${
        hasSubtitle
          ? `<text x="${labelBlockX}" y="${subtitleY}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle ?? '')}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 4. Serverless Function (Lambda / cron) ────────────────────────────────

function renderServerlessFunction(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';

  const hasSubtitle = !!data.subtitle;

  // Lambda mark on the left: a hand-drawn λ.
  const markX = x + 18;
  const markY = y + height / 2;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-serverless">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      ${connectorDots(x, y, width, height, strokeColor)}
      ${data.pulsing ? pulsingDot(x + width - 16, y + 16, theme.canvas.selectionOutline) : ''}
      ${
        data.badge
          ? techBadge(x + width - 12, y + height - 12, data.badge, strokeColor, theme.typography.fontFamily)
          : ''
      }
      <!-- λ mark -->
      <text x="${markX}" y="${markY + 6}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="22" font-weight="700" fill="${strokeColor}">λ</text>
      <!-- Title + subtitle, indented past the mark -->
      <text x="${markX + 26}" y="${y + height / 2 - (hasSubtitle ? 4 : 4)}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
      ${
        hasSubtitle
          ? `<text x="${markX + 26}" y="${y + height / 2 + 16}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle ?? '')}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 5. User Avatar ─────────────────────────────────────────────────────────

function renderUserAvatar(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';

  // Avatar circle on the left, label on the right.
  const avatarSize = 56;
  const avatarCx = x + 16 + avatarSize / 2;
  const avatarCy = y + height / 2;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-user-avatar">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="1.5" />
      <!-- Avatar disc -->
      <circle cx="${avatarCx}" cy="${avatarCy}" r="${avatarSize / 2}" fill="${strokeColor}" opacity="0.16" />
      <circle cx="${avatarCx}" cy="${avatarCy}" r="${avatarSize / 2 - 2}" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
      <g transform="translate(${avatarCx - 18}, ${avatarCy - 18})">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="${strokeColor}">
          <path d="M12 4 A4 4 0 1 0 12 12 A4 4 0 1 0 12 4 Z" />
          <path d="M4 21 A8 8 0 0 1 20 21" />
        </svg>
      </g>
      <!-- Label -->
      <text x="${x + 86}" y="${y + height / 2 - (data.subtitle ? 2 : 4)}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
      ${
        data.subtitle
          ? `<text x="${x + 86}" y="${y + height / 2 + 18}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle)}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 6. Tier Card (the wide horizontal container) ──────────────────────────

function renderTierCard(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1;
  const titleColor = style?.textColor ?? role.text;

  // Tier labels go in a small uppercase mono tag at the top-left.
  const tagX = x + 16;
  const tagY = y + 16;

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-tier-card">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="4 3" />
      <text x="${tagX}" y="${tagY}" font-family="${escapeXml(theme.typography.monoFontFamily)}" font-size="10" font-weight="700" fill="${strokeColor}" style="letter-spacing: 0.12em">${escapeXml(data.title.toUpperCase())}</text>
      ${
        data.subtitle
          ? `<text x="${tagX}" y="${tagY + 16}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="11" fill="${theme.isDark ? '#8C8A85' : '#64748B'}">${escapeXml(data.subtitle)}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── 7. Gateway Ribbon (wide, low gateway) ─────────────────────────────────

function renderGatewayRibbon(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;

  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#A3A09A' : '#64748B';

  const icon = resolveIcon(node);
  const showIcon = data.showIcon !== false && icon !== null;
  const hasSubtitle = !!data.subtitle;

  // Three "port" stripes on the right to suggest a route fan-out.
  const portY = y + height / 2 - 14;
  const portSvg = [0, 1, 2]
    .map((i) => {
      const yy = portY + i * 9;
      return `<rect x="${x + width - 14}" y="${yy}" width="2" height="6" rx="1" fill="${strokeColor}" opacity="0.7" />`;
    })
    .join('');

  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-gateway-ribbon">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      ${connectorDots(x, y, width, height, strokeColor)}
      ${data.pulsing ? pulsingDot(x + width - 16, y + 16, theme.canvas.selectionOutline) : ''}
      ${
        data.badge
          ? techBadge(x + width - 28, y + height - 12, data.badge, strokeColor, theme.typography.fontFamily)
          : ''
      }
      ${portSvg}
      ${
        showIcon
          ? iconChip(x + 30, y + height / 2, strokeColor, strokeColor, icon, 20, 32)
          : ''
      }
      <text x="${x + (showIcon ? 64 : 18)}" y="${y + height / 2 - (hasSubtitle ? 4 : 4)}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
      ${
        hasSubtitle
          ? `<text x="${x + (showIcon ? 64 : 18)}" y="${y + height / 2 + 16}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle ?? '')}</text>`
          : ''
      }
    </g>
  `.trim();
}

// ─── Legacy shapes (existing sample diagrams still need them) ──────────────

function renderLegacyCylinder(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;
  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#94a3b8' : '#64748b';
  const icon = resolveIcon(node);
  const rx = width / 2;
  const ry = 14;
  const cyTop = y + ry;
  const cyBottom = y + height - ry;
  const iconPath = icon && icon.nodes.length > 0 ? getIconPrimaryPath(icon) : null;
  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-cylinder">
      <defs>
        <linearGradient id="grad-${escapeXml(id)}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bgColor}" stop-opacity="0.85" />
          <stop offset="50%" stop-color="${bgColor}" stop-opacity="1" />
          <stop offset="100%" stop-color="${bgColor}" stop-opacity="0.85" />
        </linearGradient>
      </defs>
      <path d="M ${x} ${cyTop} L ${x} ${cyBottom} A ${rx} ${ry} 0 0 0 ${x + width} ${cyBottom} L ${x + width} ${cyTop} Z" fill="url(#grad-${escapeXml(id)})" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <ellipse cx="${x + rx}" cy="${cyBottom}" rx="${rx}" ry="${ry}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <ellipse cx="${x + rx}" cy="${cyTop + (cyBottom - cyTop) / 2}" rx="${rx}" ry="${ry}" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3 3" opacity="0.4" />
      <ellipse cx="${x + rx}" cy="${cyTop}" rx="${rx}" ry="${ry}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <g transform="translate(${x + 16}, ${cyTop + 14})">
        ${
          iconPath
            ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="${role.icon}"><path d="${iconPath}" /></svg>`
            : ''
        }
        <text x="${iconPath ? 28 : 0}" y="14" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
        ${
          data.subtitle
            ? `<text x="${iconPath ? 28 : 0}" y="28" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" font-weight="${theme.typography.nodeSubtitle.fontWeight}" fill="${subtitleColor}">${escapeXml(data.subtitle)}</text>`
            : ''
        }
      </g>
    </g>
  `.trim();
}

function renderLegacyQueueBuffer(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;
  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#94a3b8' : '#64748b';
  const icon = resolveIcon(node);
  const iconPath = icon && icon.nodes.length > 0 ? getIconPrimaryPath(icon) : null;
  const rx = 10;
  const ry = height / 2;
  const cy = y + ry;
  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-queue-buffer">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <ellipse cx="${x + rx}" cy="${cy}" rx="${rx}" ry="${ry - 2}" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.7" />
      <g stroke="${strokeColor}" stroke-width="1.5" opacity="0.6">
        <line x1="${x + width - 30}" y1="${y + 6}" x2="${x + width - 30}" y2="${y + height - 6}" />
        <line x1="${x + width - 50}" y1="${y + 6}" x2="${x + width - 50}" y2="${y + height - 6}" />
        <line x1="${x + width - 70}" y1="${y + 6}" x2="${x + width - 70}" y2="${y + height - 6}" />
      </g>
      <g transform="translate(${x + 18}, ${y + 22})">
        ${
          iconPath
            ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="${role.icon}"><path d="${iconPath}" /></svg>`
            : ''
        }
        <text x="${iconPath ? 28 : 0}" y="15" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
        ${
          data.subtitle
            ? `<text x="${iconPath ? 28 : 0}" y="30" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle)}</text>`
            : ''
        }
      </g>
    </g>
  `.trim();
}

function renderLegacyBrowserWindow(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;
  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-browser-window">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <path d="M ${x} ${y + 8} A 8 8 0 0 1 ${x + 8} ${y} L ${x + width - 8} ${y} A 8 8 0 0 1 ${x + width} ${y + 8} L ${x + width} ${y + 24} L ${x} ${y + 24} Z" fill="${strokeColor}" opacity="0.08" />
      <line x1="${x}" y1="${y + 24}" x2="${x + width}" y2="${y + 24}" stroke="${strokeColor}" stroke-width="1" opacity="0.4" />
      <circle cx="${x + 12}" cy="${y + 12}" r="3.5" fill="#ef4444" />
      <circle cx="${x + 23}" cy="${y + 12}" r="3.5" fill="#f59e0b" />
      <circle cx="${x + 34}" cy="${y + 12}" r="3.5" fill="#10b981" />
      <rect x="${x + 46}" y="${y + 6}" width="${width - 56}" height="12" rx="4" fill="#ffffff" stroke="${strokeColor}" stroke-width="0.5" opacity="0.9" />
      <text x="${x + 52}" y="${y + 15}" font-family="${escapeXml(theme.typography.monoFontFamily)}" font-size="7.5" fill="#64748b">${escapeXml(data.subtitle || 'https://app.io')}</text>
      <g transform="translate(${x + 14}, ${y + 40})">
        <text x="0" y="15" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
      </g>
    </g>
  `.trim();
}

function renderLegacyMobileDevice(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;
  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#94a3b8' : '#64748b';
  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-device-mobile">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      <rect x="${x + width / 2 - 16}" y="${y + 6}" width="32" height="4" rx="2" fill="${strokeColor}" opacity="0.5" />
      <g transform="translate(${x + 14}, ${y + 24})">
        <text x="0" y="15" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
        ${
          data.subtitle
            ? `<text x="0" y="30" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle)}</text>`
            : ''
        }
      </g>
    </g>
  `.trim();
}

function renderLegacyCloud(node: DiagramNode, theme: Theme): string {
  const { id, position, size, data, style } = node;
  const { x, y } = position;
  const { width, height } = size;
  const role = getRole(node, theme);
  const bgColor = style?.backgroundColor ?? role.background;
  const strokeColor = style?.borderColor ?? role.border;
  const strokeWidth = style?.borderWidth ?? 1.5;
  const titleColor = style?.textColor ?? role.text;
  const subtitleColor = theme.isDark ? '#94a3b8' : '#64748b';
  return `
    <g id="node-${escapeXml(id)}" class="diagram-node node-cloud">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="4 3" />
      <g transform="translate(${x + 14}, ${y + 20})">
        <text x="0" y="16" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeTitle.fontSize}" font-weight="${theme.typography.nodeTitle.fontWeight}" fill="${titleColor}">${escapeXml(data.title)}</text>
        ${
          data.subtitle
            ? `<text x="0" y="32" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.nodeSubtitle.fontSize}" fill="${subtitleColor}">${escapeXml(data.subtitle)}</text>`
            : ''
        }
      </g>
    </g>
  `.trim();
}

export const renderNode = renderNodeSvg;
