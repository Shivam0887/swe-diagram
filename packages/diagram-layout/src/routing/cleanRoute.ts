import type { Point } from '@platform/diagram-schema';

export function cleanCollinearPoints(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const isHorizontal = Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1;
    const isVertical = Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1;

    if (!isHorizontal && !isVertical) {
      result.push(curr);
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

export function generateOrthogonalPoints(source: Point, target: Point, direction = 'horizontal'): Point[] {
  if (direction === 'horizontal') {
    const midX = (source.x + target.x) / 2;
    return [
      source,
      { x: midX, y: source.y },
      { x: midX, y: target.y },
      target,
    ];
  } else {
    const midY = (source.y + target.y) / 2;
    return [
      source,
      { x: source.x, y: midY },
      { x: target.x, y: midY },
      target,
    ];
  }
}
