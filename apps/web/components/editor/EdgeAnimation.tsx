'use client';

import React, { memo } from 'react';

type EdgeAnimationSpeed = 'slow' | 'normal' | 'fast';
type EdgeAnimationType = 'particles' | 'dash_flow' | 'pulse';

const SPEED_SEC: Record<EdgeAnimationSpeed, string> = {
  slow: '3.5s',
  normal: '2.2s',
  fast: '1.2s',
};

/**
 * SVG animation overlay for an edge path. Three visual styles:
 *   - 'particles' (default): dot flow with glow underlay. Renders an
 *     extra `<svg>` here because SMIL `<animateMotion>` follows a path.
 *   - 'dash_flow': marching-ants on the stroke. The keyframes live in
 *     globals.css (`.edge-anim-dash-flow`); the parent edge component
 *     applies the class to its path via inline `style.animation` and the
 *     `--edge-anim-dur` custom property for speed.
 *   - 'pulse': opacity breathes rhythmically. Same pattern as dash_flow.
 *
 * The 'dash_flow' and 'pulse' branches return `null` so they don't add
 * DOM; the actual animation runs on the path the parent already drew.
 */
export const EdgeAnimationOverlay = memo(function EdgeAnimationOverlay({
  pathD,
  type = 'particles',
  speed = 'normal',
  flowColor = '#FF5A1F',
}: {
  pathD: string;
  edgeId: string;
  type?: EdgeAnimationType;
  speed?: EdgeAnimationSpeed;
  flowColor?: string;
}) {
  const speedSec = SPEED_SEC[speed];

  if (type === 'particles') {
    return (
      <svg className="overflow-visible pointer-events-none absolute inset-0">
        <circle r="3" fill={flowColor} opacity="0.95">
          <animateMotion dur={speedSec} repeatCount="indefinite" path={pathD} />
        </circle>
        <circle r="6" fill={flowColor} opacity="0.25">
          <animateMotion dur={speedSec} repeatCount="indefinite" path={pathD} />
        </circle>
      </svg>
    );
  }

  // dash_flow / pulse are applied directly on the parent's path stroke via
  // the CSS class + --edge-anim-dur custom property. No overlay DOM needed.
  return null;
});

/**
 * Build the `style` fragment the parent edge should pass to `<BaseEdge>`
 * for 'dash_flow' and 'pulse' animations. Returns `null` for 'particles',
 * in which case the overlay's SVG handles the animation.
 */
export function edgeAnimationStyle(
  type: EdgeAnimationType,
  speed: EdgeAnimationSpeed,
): React.CSSProperties | null {
  if (type === 'dash_flow') {
    return {
      animation: `dash-flow-march var(--edge-anim-dur, ${SPEED_SEC[speed]}) linear infinite`,
    };
  }
  if (type === 'pulse') {
    return {
      animation: `edge-pulse var(--edge-anim-dur, ${SPEED_SEC[speed]}) ease-in-out infinite`,
    };
  }
  return null;
}

/**
 * @deprecated Kept for compatibility with callers that still want a
 * stable id (none in the current codebase). The new `edgeAnimationStyle`
 * applies the animation directly to the path, so no id is needed.
 */
export function edgeAnimationPathId(edgeId: string, type: EdgeAnimationType): string | null {
  if (type === 'dash_flow') return `dash-flow-style-${edgeId}`;
  if (type === 'pulse') return `pulse-edge-style-${edgeId}`;
  return null;
}
