import type { ThemeId, NodeCategory } from '@platform/diagram-schema';
export type { ThemeId };

export type ColorRole = {
  background: string;
  border: string;
  text: string;
  icon: string;
  badgeBackground: string;
  badgeText: string;
  hoverBorder?: string;
};

export type ThemeTokens = {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  strokes: {
    thin: number;
    default: number;
    bold: number;
    heavy: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
};

export type ThemeTypography = {
  fontFamily: string;
  monoFontFamily: string;
  title: { fontSize: number; fontWeight: number; lineHeight: number };
  nodeTitle: { fontSize: number; fontWeight: number; lineHeight: number };
  nodeSubtitle: { fontSize: number; fontWeight: number; lineHeight: number };
  badge: { fontSize: number; fontWeight: number; lineHeight: number };
  edgeLabel: { fontSize: number; fontWeight: number; lineHeight: number };
  annotation: { fontSize: number; fontWeight: number; lineHeight: number };
};

export type Theme = {
  id: ThemeId;
  name: string;
  version: string;
  isDark: boolean;
  tokens: ThemeTokens;
  typography: ThemeTypography;
  canvas: {
    background: string;
    gridLine: string;
    dotColor: string;
    selectionOutline: string;
  };
  nodes: Record<NodeCategory, ColorRole>;
  edges: {
    stroke: string;
    strokeActive: string;
    strokeWidth: number;
    labelBackground: string;
    labelText: string;
    labelBorder: string;
    arrowFill: string;
  };
  groups: {
    boundaryBackground: string;
    boundaryBorder: string;
    boundaryText: string;
    containerBackground: string;
    containerBorder: string;
    containerText: string;
    swimlaneBackground: string;
    swimlaneBorder: string;
    swimlaneText: string;
  };
  annotations: {
    stepCircleBackground: string;
    stepCircleText: string;
    stepTitleText: string;
    stepDescText: string;
    calloutInfoBackground: string;
    calloutInfoBorder: string;
    calloutInfoText: string;
    calloutWarningBackground: string;
    calloutWarningBorder: string;
    calloutWarningText: string;
    calloutTipBackground: string;
    calloutTipBorder: string;
    calloutTipText: string;
  };
};
