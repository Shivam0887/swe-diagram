import type { CanvasBackground } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';

export function renderBackground(
  bg: CanvasBackground | undefined,
  width: number,
  height: number,
  theme: Theme
): { defs: string; svg: string } {
  if (!bg || bg.type === 'grid') {
    const gridBg = bg as { type: 'grid'; color?: string; gridColor?: string; gridSize?: number } | undefined;
    const bgColor = gridBg?.color ?? theme.canvas.background;
    const gridSize = gridBg?.gridSize ?? 24;
    const gridColor = gridBg?.gridColor ?? theme.canvas.gridLine;

    const defs = `
      <pattern id="pattern-grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
        <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${gridColor}" stroke-width="1" />
      </pattern>
    `.trim();

    const svg = `
      <rect width="${width}" height="${height}" fill="${bgColor}" />
      <rect width="${width}" height="${height}" fill="url(#pattern-grid)" />
    `.trim();

    return { defs, svg };
  }

  if (bg.type === 'dots') {
    const bgColor = bg.color ?? theme.canvas.background;
    const dotSpacing = bg.dotSpacing ?? 24;
    const dotColor = bg.dotColor ?? theme.canvas.dotColor;

    const defs = `
      <pattern id="pattern-dots" width="${dotSpacing}" height="${dotSpacing}" patternUnits="userSpaceOnUse">
        <circle cx="${dotSpacing / 2}" cy="${dotSpacing / 2}" r="1.5" fill="${dotColor}" />
      </pattern>
    `.trim();

    const svg = `
      <rect width="${width}" height="${height}" fill="${bgColor}" />
      <rect width="${width}" height="${height}" fill="url(#pattern-dots)" />
    `.trim();

    return { defs, svg };
  }

  // Solid
  const bgColor = bg.color;
  return {
    defs: '',
    svg: `<rect width="${width}" height="${height}" fill="${bgColor}" />`,
  };
}
