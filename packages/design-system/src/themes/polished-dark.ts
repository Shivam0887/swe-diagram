import type { Theme } from '../types';

/**
 * Polished dark — the visual language for the architecture diagram system.
 *
 * A multi-accent palette tuned for clarity:
 *   compute  → vermillion   (#FF5A1F)
 *   storage  → teal         (#5EEAD4)
 *   cache    → teal         (#5EEAD4)
 *   messaging→ sand         (#E8C580)
 *   network  → warm white   (#E8E2D5)
 *   security → periwinkle   (#A5B4FC)
 *   client   → warm white   (#E8E2D5)
 *   monitoring → sand       (#E8C580)
 *   external → muted        (#8C8A85)
 *   general  → muted        (#8C8A85)
 *
 * Background is a deep neutral (#0E1116) with hairline grid in #1A1A1C.
 * The vermillion is reserved as the canvas-wide accent (selection, step
 * circles, pulse). Use it sparingly per node — let the per-category
 * accent do the visual work.
 */
export const polishedDarkTheme: Theme = {
  id: 'polished-dark',
  name: 'Polished Dark',
  version: '1.0.0',
  isDark: true,
  tokens: {
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
    radius: { none: 0, sm: 4, md: 10, lg: 14, xl: 20, pill: 9999 },
    strokes: { thin: 1, default: 1.5, bold: 2, heavy: 3 },
    shadows: { sm: 'none', md: 'none', lg: 'none' },
  },
  typography: {
    fontFamily:
      '"Geist Variable", "Geist", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    monoFontFamily: '"Geist Mono", "JetBrains Mono", monospace',
    title: { fontSize: 22, fontWeight: 600, lineHeight: 30 },
    nodeTitle: { fontSize: 15, fontWeight: 600, lineHeight: 20 },
    nodeSubtitle: { fontSize: 12, fontWeight: 400, lineHeight: 16 },
    badge: { fontSize: 10, fontWeight: 600, lineHeight: 12 },
    edgeLabel: { fontSize: 11, fontWeight: 500, lineHeight: 14 },
    annotation: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
  },
  canvas: {
    background: '#0E1116',
    gridLine: '#1A1A1C',
    dotColor: '#26262A',
    selectionOutline: '#FF5A1F',
  },
  nodes: {
    client: {
      background: '#13161B',
      border: '#3A3D44',
      text: '#E8E2D5',
      icon: '#E8E2D5',
      badgeBackground: 'rgba(232, 226, 213, 0.08)',
      badgeText: '#E8E2D5',
      hoverBorder: '#E8E2D5',
    },
    compute: {
      background: '#1A1010',
      border: '#FF5A1F',
      text: '#FFFFFF',
      icon: '#FF8A5F',
      badgeBackground: 'rgba(255, 90, 31, 0.18)',
      badgeText: '#FF8A5F',
      hoverBorder: '#FF8A5F',
    },
    storage: {
      background: '#0E1A1A',
      border: '#5EEAD4',
      text: '#E8FFFB',
      icon: '#5EEAD4',
      badgeBackground: 'rgba(94, 234, 212, 0.12)',
      badgeText: '#5EEAD4',
      hoverBorder: '#99F6E4',
    },
    messaging: {
      background: '#1A1812',
      border: '#E8C580',
      text: '#FFF6E0',
      icon: '#E8C580',
      badgeBackground: 'rgba(232, 197, 128, 0.14)',
      badgeText: '#E8C580',
      hoverBorder: '#F5DAA1',
    },
    cache: {
      background: '#0E1A1A',
      border: '#5EEAD4',
      text: '#E8FFFB',
      icon: '#5EEAD4',
      badgeBackground: 'rgba(94, 234, 212, 0.12)',
      badgeText: '#5EEAD4',
      hoverBorder: '#99F6E4',
    },
    network: {
      background: '#13161B',
      border: '#E8E2D5',
      text: '#E8E2D5',
      icon: '#E8E2D5',
      badgeBackground: 'rgba(232, 226, 213, 0.08)',
      badgeText: '#E8E2D5',
      hoverBorder: '#FFFFFF',
    },
    external: {
      background: '#13161B',
      border: '#3A3D44',
      text: '#8C8A85',
      icon: '#8C8A85',
      badgeBackground: 'rgba(140, 138, 133, 0.10)',
      badgeText: '#8C8A85',
      hoverBorder: '#A3A09A',
    },
    security: {
      background: '#14141E',
      border: '#A5B4FC',
      text: '#EDEFFF',
      icon: '#A5B4FC',
      badgeBackground: 'rgba(165, 180, 252, 0.12)',
      badgeText: '#A5B4FC',
      hoverBorder: '#C7D2FE',
    },
    monitoring: {
      background: '#1A1812',
      border: '#E8C580',
      text: '#FFF6E0',
      icon: '#E8C580',
      badgeBackground: 'rgba(232, 197, 128, 0.14)',
      badgeText: '#E8C580',
      hoverBorder: '#F5DAA1',
    },
    general: {
      background: '#13161B',
      border: '#3A3D44',
      text: '#E8E2D5',
      icon: '#8C8A85',
      badgeBackground: 'rgba(232, 226, 213, 0.05)',
      badgeText: '#8C8A85',
      hoverBorder: '#A3A09A',
    },
  },
  edges: {
    stroke: '#3A3D44',
    strokeActive: '#FF5A1F',
    strokeWidth: 1.5,
    labelBackground: '#0E1116',
    labelText: '#E8E2D5',
    labelBorder: '#26262A',
    arrowFill: '#E8E2D5',
  },
  groups: {
    boundaryBackground: 'rgba(20, 22, 27, 0.45)',
    boundaryBorder: '#26262A',
    boundaryText: '#8C8A85',
    containerBackground: 'rgba(20, 22, 27, 0.65)',
    containerBorder: '#3A3D44',
    containerText: '#E8E2D5',
    swimlaneBackground: 'rgba(20, 22, 27, 0.30)',
    swimlaneBorder: '#1A1A1C',
    swimlaneText: '#8C8A85',
  },
  annotations: {
    stepCircleBackground: '#FF5A1F',
    stepCircleText: '#0E1116',
    stepTitleText: '#E8E2D5',
    stepDescText: '#8C8A85',
    calloutInfoBackground: 'rgba(232, 226, 213, 0.04)',
    calloutInfoBorder: '#26262A',
    calloutInfoText: '#E8E2D5',
    calloutWarningBackground: 'rgba(255, 90, 31, 0.08)',
    calloutWarningBorder: '#FF5A1F',
    calloutWarningText: '#FF8A5F',
    calloutTipBackground: 'rgba(94, 234, 212, 0.06)',
    calloutTipBorder: '#5EEAD4',
    calloutTipText: '#5EEAD4',
  },
};
