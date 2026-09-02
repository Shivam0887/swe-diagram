import type { DiagramGroup } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';
import { escapeXml } from '../utils/sanitize';

/**
 * Render a group as a labeled container. Four visual styles:
 *   - 'boundary': dashed outline, low-key label, used for soft "this
 *     area represents X" annotations.
 *   - 'container': solid outline with a tinted fill, used for
 *     distinct logical regions (Application tier, Data tier).
 *   - 'swimlane': a vertical column header that sits above its
 *     children — typical for sequence-of-actors diagrams.
 *   - 'card': an accent-tinted card with a stronger border, used
 *     when the group itself is the visual subject.
 *
 * The `colorRole` field on the group can override the theme's default
 * colors (e.g. assign the network role so the group picks up the
 * network's accent color).
 */
export function renderGroupSvg(group: DiagramGroup, theme: Theme): string {
  const { x, y } = group.position;
  const { width, height } = group.size;
  // The swimlane / card / container renderers all print the title in
  // uppercase typographic style. Uppercase FIRST, then XML-escape, so
  // entity refs like `&amp;` aren't capitalised to `&AMP;` (XML entity
  // names are case-sensitive — `&AMP;` is undefined and the parser
  // reports "Entity 'AMP' not defined" on the column the attribute lands
  // in).
  const titleUpperEscaped = escapeXml((group.title ?? '').toUpperCase());
  const titleEscaped = escapeXml(group.title ?? '');
  const subtitle = escapeXml(group.subtitle ?? '');

  // Resolve the active color trio. If colorRole is set, the group's
  // fill/border/text use that role's color set. Otherwise fall back
  // to the per-style defaults baked into the theme.
  const style = group.style ?? 'boundary';
  const role = group.colorRole ? theme.nodes[group.colorRole as keyof typeof theme.nodes] : undefined;
  let fill: string;
  let stroke: string;
  let strokeDash: string;
  let textCol: string;
  let accentStroke: string;
  switch (style) {
    case 'container':
      fill = role
        ? hexWithAlpha(role.background, 0.4)
        : theme.groups.containerBackground;
      stroke = role?.border ?? theme.groups.containerBorder;
      textCol = role?.text ?? theme.groups.containerText;
      strokeDash = '';
      accentStroke = stroke;
      break;
    case 'swimlane':
      fill = role
        ? hexWithAlpha(role.background, 0.15)
        : theme.groups.swimlaneBackground;
      stroke = role?.border ?? theme.groups.swimlaneBorder;
      textCol = role?.text ?? theme.groups.swimlaneText;
      strokeDash = '';
      accentStroke = stroke;
      break;
    case 'card':
      fill = role
        ? hexWithAlpha(role.background, 0.18)
        : theme.groups.cardBackground;
      stroke = role?.border ?? theme.groups.cardBorder;
      textCol = role?.text ?? theme.groups.cardText;
      strokeDash = '';
      accentStroke = stroke;
      break;
    case 'boundary':
    default:
      fill = role
        ? hexWithAlpha(role.background, 0.12)
        : theme.groups.boundaryBackground;
      stroke = role?.border ?? theme.groups.boundaryBorder;
      textCol = role?.text ?? theme.groups.boundaryText;
      strokeDash = 'stroke-dasharray="6 4"';
      accentStroke = stroke;
      break;
  }

  // Header height differs per style. Card style uses a pill-style
  // header chip; container/boundary use a top-left title; swimlane
  // uses a top stripe.
  const fontFamily = escapeXml(theme.typography.fontFamily);

  if (style === 'swimlane') {
    // Swimlanes draw a header band across the full top of the group
    // and put the title in the band, with the subtitle underneath.
    const bandH = 36;
    return `
      <g id="group-${escapeXml(group.id)}" class="diagram-group group-${style}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.md}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.tokens.strokes.default}" />
        <path d="M ${x} ${y + bandH} L ${x + width} ${y + bandH}" stroke="${accentStroke}" stroke-width="1" />
        <text x="${x + 16}" y="${y + 24}" font-family="${fontFamily}" font-size="13" font-weight="700" fill="${textCol}" style="letter-spacing: 0.04em">${titleUpperEscaped}</text>
        ${subtitle
          ? `<text x="${x + 16}" y="${y + bandH + 18}" font-family="${fontFamily}" font-size="11" font-weight="400" fill="${theme.isDark ? '#94a3b8' : '#64748b'}">${subtitle}</text>`
          : ''}
      </g>
    `.trim();
  }

  if (style === 'card') {
    // Card groups use a 1.5px accent border and a small inline chip
    // for the title, similar to the bento_card node treatment.
    return `
      <g id="group-${escapeXml(group.id)}" class="diagram-group group-${style}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.lg}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        <rect x="${x}" y="${y}" width="${Math.min(140, width - 24)}" height="22" rx="11" fill="${hexWithAlpha(stroke, 0.18)}" stroke="${hexWithAlpha(stroke, 0.4)}" stroke-width="1" />
        <text x="${x + 12}" y="${y + 15}" font-family="${fontFamily}" font-size="11" font-weight="600" fill="${textCol}" style="letter-spacing: 0.04em">${titleUpperEscaped}</text>
        ${subtitle
          ? `<text x="${x + 12}" y="${y + 38}" font-family="${fontFamily}" font-size="11" font-weight="400" fill="${theme.isDark ? '#94a3b8' : '#64748b'}">${subtitle}</text>`
          : ''}
      </g>
    `.trim();
  }

  // boundary and container: simple top-left title.
  return `
    <g id="group-${escapeXml(group.id)}" class="diagram-group group-${style}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.lg}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.tokens.strokes.default}" ${strokeDash} />
      <text x="${x + 16}" y="${y + 26}" font-family="${fontFamily}" font-size="13" font-weight="700" fill="${textCol}" style="letter-spacing: 0.04em">${titleUpperEscaped}</text>
      ${subtitle
        ? `<text x="${x + 16}" y="${y + 44}" font-family="${fontFamily}" font-size="11" font-weight="400" fill="${theme.isDark ? '#94a3b8' : '#64748b'}">${subtitle}</text>`
        : ''}
    </g>
  `.trim();
}

/** Mix a hex color with a given alpha (0..1). Falls back to a soft gray for non-hex inputs. */
function hexWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return `rgba(140, 138, 133, ${alpha})`;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
