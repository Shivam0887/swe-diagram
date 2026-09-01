/**
 * React renderer for DiagramIconDefinition. Returns the children of an
 * outer `<svg viewBox=…>` element. The caller supplies the wrapping SVG
 * with size/styling; this helper only emits the inner shapes.
 */
import React from 'react';
import type { DiagramIconDefinition } from './types';
import { getIconElements } from './types';

export type IconRenderProps = {
  def: DiagramIconDefinition;
  /** When true, all elements get `fill="currentColor"` so the parent
   *  `color: …` style controls tinting. Default: true. */
  currentColor?: boolean;
  /** Inline style applied to each emitted element. */
  style?: React.CSSProperties;
};

export function IconShapes({ def, currentColor = true, style }: IconRenderProps): React.ReactNode {
  const els = getIconElements(def);
  return els.map((el, i) => {
    const { tag, props } = el;
    const finalProps: Record<string, unknown> = { ...props };
    if (currentColor && tag !== 'line') {
      // Lucide uses `fill` for filled paths; many outline icons leave it
      // off entirely. Apply currentColor to the typical paintable elements.
      if (tag === 'path' || tag === 'rect' || tag === 'circle' || tag === 'ellipse' || tag === 'polygon') {
        if (!('fill' in finalProps) || finalProps.fill === undefined) finalProps.fill = 'currentColor';
      }
    }
    if (style) {
      finalProps.style = { ...(props.style as object | undefined), ...style };
    }
    return React.createElement(tag, { key: i, ...finalProps });
  });
}
