'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { generateFilletOrthogonalPath } from '@platform/diagram-layout';
import type { DiagramEdge, EdgeStyle, Point } from '@platform/diagram-schema';

export type CustomEdgeData = DiagramEdge['data'] & {
  waypoints?: Point[];
  cornerRadius?: number;
};

/**
 * Translate the panel's `edge.style: 'solid' | 'dashed' | 'dotted'` to a
 * `stroke-dasharray`. Matches the SVG renderer's values so live + export
 * agree.
 */
function strokeDasharrayFor(style?: EdgeStyle): string | undefined {
  if (style === 'dashed') return '6 4';
  if (style === 'dotted') return '2 2';
  return undefined;
}

export const FilletOrthogonalEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    style = {},
    markerEnd,
  }: EdgeProps) => {
    const edgeData = data as unknown as CustomEdgeData | undefined;
    const cornerRadius = edgeData?.cornerRadius ?? 8;
    const strokeColor = edgeData?.color ?? style.stroke ?? 'rgba(148,163,184,0.6)';
    const strokeWidth = edgeData?.strokeWidth ?? (style.strokeWidth ? Number(style.strokeWidth) : 1.5);
    const dasharray = strokeDasharrayFor(edgeData?.dashStyle as EdgeStyle | undefined);

    const points: Point[] =
      edgeData?.waypoints && edgeData.waypoints.length >= 2
        ? edgeData.waypoints
        : [
            { x: sourceX, y: sourceY },
            { x: (sourceX + targetX) / 2, y: sourceY },
            { x: (sourceX + targetX) / 2, y: targetY },
            { x: targetX, y: targetY },
          ];

    const pathD = generateFilletOrthogonalPath(points, cornerRadius);
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const isAnimated = edgeData?.animated;
    const flowColor = edgeData?.flowColor ?? '#FF5A1F';
    const speedSec = edgeData?.animationSpeed === 'fast' ? '1.2s' : edgeData?.animationSpeed === 'slow' ? '3.5s' : '2.2s';

    return (
      <>
        <BaseEdge
          id={id}
          path={pathD}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDasharray: dasharray,
          }}
          markerEnd={markerEnd}
        />

        {isAnimated && (
          <svg className="overflow-visible pointer-events-none absolute inset-0">
            <circle r="3" fill={flowColor} opacity="0.95">
              <animateMotion dur={speedSec} repeatCount="indefinite" path={pathD} />
            </circle>
            <circle r="6" fill={flowColor} opacity="0.25">
              <animateMotion dur={speedSec} repeatCount="indefinite" path={pathD} />
            </circle>
          </svg>
        )}

        {(edgeData?.label || edgeData?.stepNumber !== undefined) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan flex items-center gap-1.5"
            >
              {edgeData.stepNumber !== undefined && (
                <div
                  className="bp-mono"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 500,
                    background: 'var(--bp-bg-0)',
                    color: strokeColor,
                    border: `1px solid ${strokeColor}`,
                  }}
                >
                  {edgeData.stepNumber}
                </div>
              )}
              {edgeData.label && (
                <div
                  className="bp-mono"
                  style={{
                    padding: '2px 8px',
                    background: 'var(--bp-bg-1)',
                    border: '1px solid var(--bp-hairline)',
                    color: 'var(--bp-ink-0)',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {edgeData.label}
                </div>
              )}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

FilletOrthogonalEdge.displayName = 'FilletOrthogonalEdge';
