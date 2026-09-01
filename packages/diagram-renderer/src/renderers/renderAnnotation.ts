import type { DiagramAnnotation } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';
import { escapeXml } from '../utils/sanitize';

export function renderAnnotationSvg(annotation: DiagramAnnotation, theme: Theme): string {
  switch (annotation.type) {
    case 'step': {
      const { x, y } = annotation.position;
      const title = escapeXml(annotation.title);
      const desc = escapeXml(annotation.description);

      const descSvg = desc
        ? `<text x="${x + 36}" y="${y + 24}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="11" font-weight="400" fill="${theme.annotations.stepDescText}">${desc}</text>`
        : '';

      return `
      <g id="annotation-${annotation.id}" class="diagram-annotation anno-step">
        <circle cx="${x + 14}" cy="${y + 14}" r="14" fill="${theme.annotations.stepCircleBackground}" />
        <text x="${x + 14}" y="${y + 19}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="13" font-weight="700" fill="${theme.annotations.stepCircleText}" text-anchor="middle">${annotation.stepNumber}</text>
        <text x="${x + 36}" y="${y + 10}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="13" font-weight="600" fill="${theme.annotations.stepTitleText}">${title}</text>
        ${descSvg}
      </g>
      `.trim();
    }

    case 'callout': {
      const { x, y } = annotation.position;
      const width = annotation.size?.width ?? 220;
      const height = annotation.size?.height ?? 80;
      const title = escapeXml(annotation.title);
      const text = escapeXml(annotation.text);

      const variant = annotation.variant ?? 'info';
      let bg = theme.annotations.calloutInfoBackground;
      let border = theme.annotations.calloutInfoBorder;
      let textCol = theme.annotations.calloutInfoText;

      if (variant === 'warning') {
        bg = theme.annotations.calloutWarningBackground;
        border = theme.annotations.calloutWarningBorder;
        textCol = theme.annotations.calloutWarningText;
      } else if (variant === 'tip' || variant === 'success') {
        bg = theme.annotations.calloutTipBackground;
        border = theme.annotations.calloutTipBorder;
        textCol = theme.annotations.calloutTipText;
      }

      return `
      <g id="annotation-${annotation.id}" class="diagram-annotation anno-callout">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.md}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
        <text x="${x + 12}" y="${y + 22}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="12" font-weight="700" fill="${textCol}">${title}</text>
        <foreignObject x="${x + 12}" y="${y + 28}" width="${width - 24}" height="${height - 34}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${escapeXml(theme.typography.fontFamily)};font-size:11px;color:${escapeXml(textCol)};line-height:1.4;">${text}</div>
        </foreignObject>
      </g>
      `.trim();
    }

    case 'highlight': {
      const { x, y } = annotation.position;
      const { width, height } = annotation.size;
      const color = annotation.color ?? 'rgba(59, 130, 246, 0.15)';

      return `
      <g id="annotation-${annotation.id}" class="diagram-annotation anno-highlight">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.tokens.radius.lg}" fill="${color}" stroke="${color}" stroke-width="2" stroke-dasharray="4 4" />
      </g>
      `.trim();
    }

    case 'text': {
      const { x, y } = annotation.position;
      const content = escapeXml(annotation.content);
      const fontSize = annotation.fontSize ?? 14;
      const fontWeight = annotation.fontWeight === 'bold' ? 700 : 400;

      return `
      <g id="annotation-${annotation.id}" class="diagram-annotation anno-text">
        <text x="${x}" y="${y}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${theme.isDark ? '#f8fafc' : '#0f172a'}">${content}</text>
      </g>
      `.trim();
    }

    default:
      return '';
  }
}
