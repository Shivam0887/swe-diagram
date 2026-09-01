'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { DiagramEdge, EdgeStyle, EdgeAnimationType, EdgeAnimationSpeed } from '@platform/diagram-schema';
import { EdgeAnimationOverlay, edgeAnimationPathId } from './EdgeAnimation';

export type BezierEdgeData = DiagramEdge['data'] & {
  /** Optional padding from source/target for the control points. */
  curvature?: number;
};

function strokeDasharrayFor(style?: EdgeStyle): string | undefined {
  if (style === 'dashed') return '6 4';
  if (style === 'dotted') return '2 2';
  return undefined;
}

export const BezierCurvedEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
    markerEnd,
  }: EdgeProps) => {
    const edgeData = data as unknown as BezierEdgeData | undefined;
    const strokeColor = edgeData?.color ?? style.stroke ?? 'rgba(148,163,184,0.6)';
    const strokeWidth = edgeData?.strokeWidth ?? (style.strokeWidth ? Number(style.strokeWidth) : 1.5);
    const dasharray = strokeDasharrayFor(edgeData?.dashStyle as EdgeStyle | undefined);

    const [pathD, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const isAnimated = edgeData?.animated;
    const animationType: EdgeAnimationType = edgeData?.animationType ?? 'particles';
    const animationSpeed: EdgeAnimationSpeed = edgeData?.animationSpeed ?? 'normal';
    const flowColor = edgeData?.flowColor ?? '#FF5A1F';
    // When using dash_flow we override the static dasharray so the marching
    // ants are visible. Solid lines still need a stroke-dasharray to march.
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
            strokeLinejoin: 'round',
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
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
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

BezierCurvedEdge.displayName = 'BezierCurvedEdge';
