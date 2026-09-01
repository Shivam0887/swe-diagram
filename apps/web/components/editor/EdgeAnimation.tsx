'use client';

import React from 'react';

type EdgeAnimationSpeed = 'slow' | 'normal' | 'fast';
type EdgeAnimationType = 'particles' | 'dash_flow' | 'pulse';

const SPEED_SEC: Record<EdgeAnimationSpeed, string> = {
  slow: '3.5s',
  normal: '2.2s',
  fast: '1.2s',
};

/**
 * SVG animation overlay for an edge path. Three visual styles:
 *   - 'particles' (default): dot flow with glow underlay.
 *   - 'dash_flow': marching-ants on the stroke.
 *   - 'pulse': opacity breathes rhythmically.
 *
 * For 'particles' the parent edge renders a separate overlay `<svg>` so the
 * animateMotion can move along `pathD`. For 'dash_flow' and 'pulse' the
 * actual stroke element is animated via a CSS keyframes rule injected
 * into the document head — the parent edge must add a stable id to its
 * stroke path and pass the same id here.
 */
export function EdgeAnimationOverlay({
  pathD,
  edgeId,
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

  if (type === 'dash_flow') {
    // Inject a scoped keyframe rule once per edge id. We use a stable id
    // (the React Flow edge id) so multiple edges get independent timings.
    const styleId = `dash-flow-style-${edgeId}`;
    return (
      <>
        <svg className="overflow-visible pointer-events-none absolute inset-0" style={{ display: 'none' }}>
          <style>{`#${styleId} { animation: ${styleId}-march ${speedSec} linear infinite; } @keyframes ${styleId}-march { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -20; } }`}</style>
        </svg>
        {/* The parent edge path must include `id={styleId}` and
            `strokeDasharray="6 4"` to read the marching effect. */}
      </>
    );
  }

  if (type === 'pulse') {
    const styleId = `pulse-edge-style-${edgeId}`;
    return (
      <>
        <svg className="overflow-visible pointer-events-none absolute inset-0" style={{ display: 'none' }}>
          <style>{`#${styleId} { animation: ${styleId}-pulse ${speedSec} ease-in-out infinite; } @keyframes ${styleId}-pulse { 0% { opacity: 0.3; } 50% { opacity: 1.0; } 100% { opacity: 0.3; } }`}</style>
        </svg>
      </>
    );
  }

  return null;
}

/** The id we use to scope per-edge animation styles + the path element itself. */
export function edgeAnimationPathId(edgeId: string, type: EdgeAnimationType): string | null {
  if (type === 'dash_flow') return `dash-flow-style-${edgeId}`;
  if (type === 'pulse') return `pulse-edge-style-${edgeId}`;
  return null;
}
