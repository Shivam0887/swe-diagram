import type { CanvasBackground } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';

export type RenderBackgroundOptions = {
  /**
   * Top-left corner of the SVG viewBox in user-space coordinates.
   * The background rect must be positioned here, not at (0, 0) —
   * otherwise content near the viewBox origin (e.g. a node at
   * x=-50 with the auto-fit viewBox starting at x=-74) is rendered
   * outside the painted area.
   */
  viewBoxX: number;
  viewBoxY: number;
  width: number;
  height: number;
};

export function renderBackground(
  bg: CanvasBackground | undefined,
  opts: RenderBackgroundOptions,
  theme: Theme
): { defs: string; svg: string } {
  // Use absolute coordinates in the user space so the rect always
  // covers the full viewBox, even when the bbox-driven viewBox has
  // a negative origin (e.g. content at x=-50 with auto-fit padding
  // extends to x=-74). A `width="100%"` rect would resolve to the
  // SVG *viewport* size — and, worse, default to (0, 0) in user
  // space, leaving the negative quadrant of the viewBox unpainted.
  // The base fill rect is painted in addition to the pattern so
  // the canvas shows the theme's background color behind the
  // grid/dot strokes.
  const { viewBoxX, viewBoxY, width, height } = opts;

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
      <rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="${bgColor}" />
      <rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="url(#pattern-grid)" />
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
      <rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="${bgColor}" />
      <rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="url(#pattern-dots)" />
    `.trim();

    return { defs, svg };
  }

  // Solid
  const bgColor = bg.color;
  return {
    defs: '',
    svg: `<rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="${bgColor}" />`,
  };
}
