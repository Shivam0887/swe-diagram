'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import type { DiagramEdge, EdgeStyle, Point, EdgeAnimationType, EdgeAnimationSpeed } from '@platform/diagram-schema';
import { EdgeAnimationOverlay, edgeAnimationPathId } from './EdgeAnimation';

export type StepEdgeData = DiagramEdge['data'] & {
  waypoints?: Point[];
};

/**
 * Sharp-corner orthogonal edge. Same L-shape as fillet, but no corner
 * rounding — a deliberate "schematic" look.
 */
export const StepOrthogonalEdge = memo(
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
    const edgeData = data as unknown as StepEdgeData | undefined;
    const strokeColor = edgeData?.color ?? style.stroke ?? 'rgba(148,163,184,0.6)';
    const strokeWidth = edgeData?.strokeWidth ?? (style.strokeWidth ? Number(style.strokeWidth) : 1.5);
    const dasharray = ((): string | undefined => {
      const s = edgeData?.dashStyle as EdgeStyle | undefined;
      if (s === 'dashed') return '6 4';
      if (s === 'dotted') return '2 2';
      return undefined;
    })();

    const points: Point[] =
      edgeData?.waypoints && edgeData.waypoints.length >= 2
        ? edgeData.waypoints
        : [
            { x: sourceX, y: sourceY },
            { x: (sourceX + targetX) / 2, y: sourceY },
            { x: (sourceX + targetX) / 2, y: targetY },
            { x: targetX, y: targetY },
          ];

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const isAnimated = edgeData?.animated;
    const animationType: EdgeAnimationType = edgeData?.animationType ?? 'particles';
    const animationSpeed: EdgeAnimationSpeed = edgeData?.animationSpeed ?? 'normal';
    const flowColor = edgeData?.flowColor ?? '#FF5A1F';
    const effectiveDasharray =
      isAnimated && animationType === 'dash_flow' ? '6 4' : dasharray;
    const pathAnimId = edgeAnimationPathId(id, animationType);

    return (
      <>
        <BaseEdge
          id={pathAnimId ?? id}
          path={pathD}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 4,
            strokeDasharray: effectiveDasharray,
          }}
          markerEnd={markerEnd}
        />

        {isAnimated && (
          <EdgeAnimationOverlay
            pathD={pathD}
            edgeId={id}
            type={animationType}
            speed={animationSpeed}
            flowColor={flowColor}
          />
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

StepOrthogonalEdge.displayName = 'StepOrthogonalEdge';
