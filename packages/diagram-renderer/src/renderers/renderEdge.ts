import type { DiagramEdge, DiagramNode, Point } from '@platform/diagram-schema';
import type { Theme } from '@platform/design-system';
import { generateFilletOrthogonalPath } from '@platform/diagram-layout';
import { escapeXml } from '../utils/sanitize';

/**
 * Edge renderer — orthogonal fillet routing with optional particle flow,
 * a numbered step circle, and a label pill.
 *
 * Waypoint computation prefers the actual node midpoint by default; when
 * the source/target are vertically offset, a 4-point L route is used so
 * the path bends cleanly. When `edge.waypoints` are already provided by
 * the layout step (ELK), they're used verbatim.
 */
export function renderEdgeSvg(
  edge: DiagramEdge,
  nodeMap: Map<string, DiagramNode>,
  theme: Theme
): string {
  const { id, style = 'solid', data } = edge;
  const strokeColor = data?.color ?? theme.edges.stroke;
  const strokeWidth = data?.strokeWidth ?? theme.edges.strokeWidth;
  const strokeDasharray =
    style === 'dashed' ? '6 4' : style === 'dotted' ? '2 2' : 'none';

  let pts = edge.waypoints ?? [];
  if (pts.length < 2) {
    const src = nodeMap.get(edge.source.nodeId);
    const tgt = nodeMap.get(edge.target.nodeId);
    if (src && tgt) {
      pts = defaultRoute(src, tgt);
    }
  }
  if (pts.length < 2) return '';

  const pathD = generateFilletOrthogonalPath(pts, 12);
  const midPoint = mid(pts);

  const isAnimated = data?.animated;
  const flowColor = data?.flowColor ?? theme.edges.strokeActive;
  const speedSec =
    data?.animationSpeed === 'fast' ? '1.2s' : data?.animationSpeed === 'slow' ? '3.5s' : '2.2s';
  const animationType = data?.animationType ?? 'particles';

  // ─── Animation overlays ───────────────────────────────────────────────
  // Three styles: 'particles' (default) = dots flowing along the path,
  // 'dash_flow' = the stroke itself marches (good for solid/dashed lines),
  // 'pulse' = stroke fades in and out rhythmically along its length.
  let animationOverlay = '';
  let dashFlowStrokeAttrs = '';
  if (isAnimated) {
    if (animationType === 'dash_flow') {
      // Marching-ants effect: animate stroke-dashoffset on the main path.
      // We override the user's static dasharray for the animated copy only.
      // The closing quote on the style attribute is required — it was missing
      // in earlier versions and produced an unterminated-attribute parse error
      // ("Entity 'AMP' not defined" when followed by other attributes).
      dashFlowStrokeAttrs = `stroke-dasharray="6 4" stroke-dashoffset="0" style="animation: dash-flow-${escapeXml(id)} ${speedSec} linear infinite;"`;
      animationOverlay = `
        <style>
          @keyframes dash-flow-${escapeXml(id)} {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -20; }
          }
        </style>
      `;
    } else if (animationType === 'pulse') {
      // Stroke breathes — opacity oscillates between 0.3 and 1.0.
      animationOverlay = `
        <style>
          @keyframes pulse-edge-${escapeXml(id)} {
            0%   { opacity: 0.3; }
            50%  { opacity: 1.0; }
            100% { opacity: 0.3; }
          }
          #path-${escapeXml(id)} {
            animation: pulse-edge-${escapeXml(id)} ${speedSec} ease-in-out infinite;
          }
        </style>
      `;
    } else {
      // particles — dot flow with a glow underlay.
      animationOverlay = `
        <circle r="7" fill="${flowColor}" opacity="0.18">
          <animateMotion dur="${speedSec}" repeatCount="indefinite" path="${pathD}" />
        </circle>
        <circle r="3" fill="${flowColor}" opacity="0.95">
          <animateMotion dur="${speedSec}" repeatCount="indefinite" path="${pathD}" />
        </circle>
      `;
    }
  }

  let labelSvg = '';
  if (data?.label || data?.stepNumber !== undefined) {
    const hasStep = data?.stepNumber !== undefined;
    const hasLabel = !!data?.label;
    // Center the step circle, push the label pill to its right.
    const labelX = midPoint.x;
    const labelY = midPoint.y;

    if (hasStep && hasLabel) {
      labelSvg = `
        <g class="edge-label-group" transform="translate(${labelX}, ${labelY})">
          <g transform="translate(-22, 0)">
            <circle cx="0" cy="0" r="11" fill="${theme.annotations.stepCircleBackground}" />
            <text x="0" y="3.5" text-anchor="middle" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="11" font-weight="700" fill="${theme.annotations.stepCircleText}">${escapeXml(String(data?.stepNumber ?? ''))}</text>
          </g>
          <g transform="translate(12, 0)">
            ${labelPill(data?.label ?? '', theme)}
          </g>
        </g>
      `;
    } else if (hasStep) {
      labelSvg = `
        <g class="edge-label-group" transform="translate(${labelX}, ${labelY})">
          <circle cx="0" cy="0" r="11" fill="${theme.annotations.stepCircleBackground}" />
          <text x="0" y="3.5" text-anchor="middle" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="11" font-weight="700" fill="${theme.annotations.stepCircleText}">${escapeXml(String(data?.stepNumber ?? ''))}</text>
        </g>
      `;
    } else if (hasLabel) {
      labelSvg = `
        <g class="edge-label-group" transform="translate(${labelX}, ${labelY})">
          ${labelPill(data?.label ?? '', theme)}
        </g>
      `;
    }
  }

  // Soft underlay for readability on busy diagrams.
  return `
    <g id="edge-${escapeXml(id)}" class="diagram-edge">
      <path
        d="${pathD}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth + 4}"
        opacity="0.10"
      />
      <path
        id="path-${escapeXml(id)}"
        d="${pathD}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashFlowStrokeAttrs ? '' : strokeDasharray}"
        stroke-linecap="round"
        stroke-linejoin="round"
        marker-end="url(#marker-arrow-end)"
        ${dashFlowStrokeAttrs}
      />
      ${animationOverlay}
      ${labelSvg}
    </g>
  `.trim();
}

function defaultRoute(src: DiagramNode, tgt: DiagramNode): Point[] {
  const srcCx = src.position.x + src.size.width / 2;
  const srcCy = src.position.y + src.size.height / 2;
  const tgtCx = tgt.position.x + tgt.size.width / 2;
  const tgtCy = tgt.position.y + tgt.size.height / 2;

  // Horizontal-flow preference: if src and tgt are roughly aligned, draw
  // a single horizontal segment between midpoints. Otherwise a clean
  // 4-point L with the bend on the side the source is leaving from.
  const dx = tgtCx - srcCx;
  const dy = tgtCy - srcCy;
  if (Math.abs(dy) < 8) {
    return [
      { x: srcCx + src.size.width / 2, y: srcCy },
      { x: tgtCx - tgt.size.width / 2, y: tgtCy },
    ];
  }
  const srcExit = { x: srcCx + src.size.width / 2, y: srcCy };
  const tgtEntry = { x: tgtCx - tgt.size.width / 2, y: tgtCy };
  const midX = (srcExit.x + tgtEntry.x) / 2;
  return [srcExit, { x: midX, y: srcExit.y }, { x: midX, y: tgtEntry.y }, tgtEntry];
}

function mid(pts: Point[]): Point {
  if (pts.length === 2) {
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }
  // For polyline routes, the visual midpoint is the corner.
  return pts[Math.floor(pts.length / 2)];
}

function labelPill(label: string, theme: Theme): string {
  const w = Math.max(40, Math.round(label.length * 6.4) + 18);
  const h = 22;
  return `
    <g transform="translate(${-w / 2}, ${-h / 2})">
      <rect width="${w}" height="${h}" rx="${h / 2}" fill="${theme.edges.labelBackground}" stroke="${theme.edges.labelBorder}" stroke-width="1" />
      <text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="${theme.typography.edgeLabel.fontSize}" font-weight="${theme.typography.edgeLabel.fontWeight}" fill="${theme.edges.labelText}">${escapeXml(label)}</text>
    </g>
  `;
}

export const renderEdge = renderEdgeSvg;
