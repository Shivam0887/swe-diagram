import type { Theme, ThemeId } from './types';
import { editorialDarkTheme } from './themes/editorial-dark';
import { polishedDarkTheme } from './themes/polished-dark';

/**
 * The full theme registry. The platform ships two themes by design:
 *   - polished-dark   — multi-accent, the visual language for the editor and
 *                       the architecture-diagram system
 *   - editorial-dark  — single-accent, reserved for marketing surfaces
 *                       (landing, gallery). The editor still accepts it for
 *                       users who want a quieter canvas.
 */
export const themeRegistry: Record<ThemeId, Theme> = {
  'editorial-dark': editorialDarkTheme,
  'polished-dark': polishedDarkTheme,
};

export function resolveTheme(themeId?: string): Theme {
  if (themeId && themeId in themeRegistry) {
    return themeRegistry[themeId as ThemeId];
  }
  return polishedDarkTheme;
}

export function getAllThemes(): Theme[] {
  return Object.values(themeRegistry);
}
