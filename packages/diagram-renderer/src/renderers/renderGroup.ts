import type { DiagramGroup } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';
import { escapeXml } from '../utils/sanitize';

export function renderGroupSvg(group: DiagramGroup, theme: Theme): string {
  const { x, y } = group.position;
  const { width, height } = group.size;
  const title = escapeXml(group.title);
  const subtitle = escapeXml(group.subtitle);

  const style = group.style ?? 'boundary';
  const isBoundary = style === 'boundary';

  const fill = isBoundary ? theme.groups.boundaryBackground : theme.groups.containerBackground;
  const stroke = isBoundary ? theme.groups.boundaryBorder : theme.groups.containerBorder;
  const strokeDash = isBoundary ? 'stroke-dasharray="6 4"' : '';
  const textColor = isBoundary ? theme.groups.boundaryText : theme.groups.containerText;

  const subtitleSvg = subtitle
    ? `<text x="${x + 16}" y="${y + 44}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="11" font-weight="400" fill="${theme.isDark ? '#94a3b8' : '#64748b'}">${subtitle}</text>`
    : '';

  return `
  <g id="group-${group.id}" class="diagram-group group-${style}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.lg}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.tokens.strokes.default}" ${strokeDash} />
    <text x="${x + 16}" y="${y + 26}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="13" font-weight="700" fill="${textColor}" style="letter-spacing: 0.2px">${title.toUpperCase()}</text>
    ${subtitleSvg}
  </g>
  `.trim();
}
