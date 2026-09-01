import type { ThemeTokens, ThemeTypography } from '../types';

export const standardTokens: ThemeTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    none: 0,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 9999,
  },
  strokes: {
    thin: 1,
    default: 1.5,
    bold: 2,
    heavy: 3,
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
  },
};

export const standardTypography: ThemeTypography = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  monoFontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
  title: { fontSize: 20, fontWeight: 700, lineHeight: 28 },
  nodeTitle: { fontSize: 13, fontWeight: 600, lineHeight: 18 },
  nodeSubtitle: { fontSize: 11, fontWeight: 400, lineHeight: 15 },
  badge: { fontSize: 10, fontWeight: 600, lineHeight: 12 },
  edgeLabel: { fontSize: 11, fontWeight: 500, lineHeight: 14 },
  annotation: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
};

export const auroraTokens: ThemeTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    none: 0,
    sm: 2,
    md: 6,
    lg: 10,
    xl: 16,
    pill: 9999,
  },
  strokes: {
    thin: 1,
    default: 1,
    bold: 1.5,
    heavy: 2,
  },
  shadows: {
    sm: '0 0 0 1px rgba(94, 234, 212, 0.06)',
    md: '0 0 0 1px rgba(94, 234, 212, 0.1), 0 4px 24px -8px rgba(94, 234, 212, 0.15)',
    lg: '0 0 0 1px rgba(94, 234, 212, 0.18), 0 12px 48px -12px rgba(240, 171, 252, 0.25)',
  },
};

export const auroraTypography: ThemeTypography = {
  fontFamily: '"Geist Variable", "Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  monoFontFamily: '"Geist Mono", "JetBrains Mono", "Fira Code", Menlo, monospace',
  title: { fontSize: 20, fontWeight: 600, lineHeight: 28 },
  nodeTitle: { fontSize: 13, fontWeight: 600, lineHeight: 18 },
  nodeSubtitle: { fontSize: 11, fontWeight: 400, lineHeight: 15 },
  badge: { fontSize: 10, fontWeight: 600, lineHeight: 12 },
  edgeLabel: { fontSize: 11, fontWeight: 500, lineHeight: 14 },
  annotation: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
};
