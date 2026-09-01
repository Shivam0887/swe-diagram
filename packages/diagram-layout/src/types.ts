import type { Point, Size } from '@platform/diagram-schema';

export type LayoutDirection = 'horizontal' | 'vertical';

export type LayoutOptions = {
  direction?: LayoutDirection;
  nodeSpacing?: number;
  layerSpacing?: number;
  padding?: number;
};

export type LayoutNodeResult = {
  id: string;
  position: Point;
  size: Size;
};

export type LayoutEdgeResult = {
  id: string;
  waypoints: Point[];
  pathData?: string;
};

export type LayoutResult = {
  nodes: LayoutNodeResult[];
  edges: LayoutEdgeResult[];
  width: number;
  height: number;
};
