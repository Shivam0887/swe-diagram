export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = Point & Size;

export type PortPosition = 'top' | 'right' | 'bottom' | 'left';
export type PortType = 'source' | 'target' | 'bidirectional';

export type Port = {
  id: string;
  position: PortPosition;
  type: PortType;
  label?: string;
  offset?: number;
};

export type NodeCategory =
  | 'client'
  | 'compute'
  | 'storage'
  | 'messaging'
  | 'cache'
  | 'network'
  | 'external'
  | 'security'
  | 'monitoring'
  | 'general';

export type NodeType =
  | 'user'
  | 'browser'
  | 'mobile'
  | 'api_gateway'
  | 'load_balancer'
  | 'service'
  | 'worker'
  | 'server'
  | 'container'
  | 'database'
  | 'postgresql'
  | 'cache'
  | 'redis'
  | 'queue'
  | 'kafka'
  | 'object_storage'
  | 'cdn'
  | 'search'
  | 'cloud'
  | 'monitoring'
  | 'lock'
  | 'code'
  | 'custom';

export type NodeShape =
  | 'rounded_card'
  | 'cylinder'
  | 'queue_buffer'
  | 'pill'
  | 'cloud'
  | 'browser_window'
  | 'device_mobile'
  | 'hexagon'
  | 'diamond'
  | 'note'
  | 'text_only'
  | 'bento_card'
  | 'data_cylinder'
  | 'event_stream'
  | 'serverless_function'
  | 'user_avatar'
  | 'tier_card'
  | 'gateway_ribbon';

export type NodeStyle = {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  accentColor?: string;
  accentPosition?: 'left' | 'top' | 'none';
  textColor?: string;
  iconColor?: string;
  opacity?: number;
};

export type NodeData = {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  showIcon?: boolean;
  role?: NodeCategory;
  pulsing?: boolean;
  tags?: string[];
  metrics?: { label: string; value: string }[];
  details?: Record<string, unknown>;
};

export type DiagramNode = {
  id: string;
  type: NodeType;
  shape?: NodeShape;
  position: Point;
  size: Size;
  data: NodeData;
  style?: NodeStyle;
  ports?: Port[];
  groupId?: string;
  zIndex?: number;
  locked?: boolean;
};

export type EdgeRouting = 'orthogonal' | 'curved' | 'straight' | 'step';
export type EdgeMarker = 'arrow' | 'dot' | 'diamond' | 'none';
export type EdgeStyle = 'solid' | 'dashed' | 'dotted';

export type EdgeAnimationType = 'particles' | 'dash_flow' | 'pulse';
export type EdgeAnimationSpeed = 'slow' | 'normal' | 'fast';

export type EdgeEndpoint = {
  nodeId: string;
  portId?: string;
};

export type EdgeData = {
  label?: string;
  sublabel?: string;
  stepNumber?: number;
  color?: string;
  strokeWidth?: number;
  /** Dash style for the rendered edge — usually mirrors the canonical
   *  `edge.style` field but is also accepted on data for round-trip
   *  friendliness. */
  dashStyle?: EdgeStyle;
  animated?: boolean;
  animationType?: EdgeAnimationType;
  animationSpeed?: EdgeAnimationSpeed;
  flowColor?: string;
  details?: Record<string, unknown>;
};

export type DiagramEdge = {
  id: string;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
  routing?: EdgeRouting;
  style?: EdgeStyle;
  markerStart?: EdgeMarker;
  markerEnd?: EdgeMarker;
  waypoints?: Point[];
  data?: EdgeData;
  zIndex?: number;
};

export type DiagramGroup = {
  id: string;
  title: string;
  subtitle?: string;
  position: Point;
  size: Size;
  style?: 'boundary' | 'container' | 'swimlane' | 'card';
  colorRole?: string;
  zIndex?: number;
};

export type StepAnnotation = {
  id: string;
  type: 'step';
  position: Point;
  stepNumber: number;
  title: string;
  description?: string;
};

export type CalloutAnnotation = {
  id: string;
  type: 'callout';
  position: Point;
  size?: Size;
  title: string;
  text: string;
  variant?: 'info' | 'warning' | 'tip' | 'success';
};

export type HighlightAnnotation = {
  id: string;
  type: 'highlight';
  position: Point;
  size: Size;
  color?: string;
};

export type TextAnnotation = {
  id: string;
  type: 'text';
  position: Point;
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
};

export type DiagramAnnotation =
  | StepAnnotation
  | CalloutAnnotation
  | HighlightAnnotation
  | TextAnnotation;

export type ThemeId = 'editorial-dark' | 'polished-dark';

export type CanvasBackground =
  | { type: 'grid'; color?: string; gridColor?: string; gridSize?: number }
  | { type: 'dots'; color?: string; dotColor?: string; dotSpacing?: number }
  | { type: 'solid'; color: string };

export type DiagramMetadata = {
  title: string;
  description?: string;
  width: number;
  height: number;
  background?: CanvasBackground;
  author?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CustomCollectionItem = {
  id: string;
  name: string;
  category?: string;
  nodeTemplate: Omit<DiagramNode, 'id' | 'position'>;
};

export type CustomCollection = {
  id: string;
  name: string;
  items: CustomCollectionItem[];
};

export type DiagramDocument = {
  schemaVersion: string;
  rendererVersion: string;
  theme: ThemeId;
  metadata: DiagramMetadata;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
  annotations: DiagramAnnotation[];
  customCollections?: CustomCollection[];
};
