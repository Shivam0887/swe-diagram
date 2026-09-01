import type { Point } from '@platform/diagram-schema';
import { cleanCollinearPoints } from './cleanRoute';

export function generateFilletOrthogonalPath(rawPoints: Point[], cornerRadius = 10): string {
  const points = cleanCollinearPoints(rawPoints);
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Distance from prev to curr and curr to next
    const dPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const dNext = Math.hypot(next.x - curr.x, next.y - curr.y);

    // Limit radius to half the shortest adjacent segment
    const r = Math.min(cornerRadius, dPrev / 2, dNext / 2);

    if (r < 1) {
      path += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    // Vector from curr to prev
    const vPrev = { x: (prev.x - curr.x) / dPrev, y: (prev.y - curr.y) / dPrev };
    // Vector from curr to next
    const vNext = { x: (next.x - curr.x) / dNext, y: (next.y - curr.y) / dNext };

    // Point before the curve
    const pStart = { x: curr.x + vPrev.x * r, y: curr.y + vPrev.y * r };
    // Point after the curve
    const pEnd = { x: curr.x + vNext.x * r, y: curr.y + vNext.y * r };

    path += ` L ${pStart.x} ${pStart.y} Q ${curr.x} ${curr.y} ${pEnd.x} ${pEnd.y}`;
  }

  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}
