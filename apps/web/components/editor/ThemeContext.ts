'use client';

import { createContext, useContext } from 'react';
import { resolveTheme, type Theme } from '@platform/design-system';

/**
 * Editor-wide theme context. Populated by the editor page once per
 * `doc.theme` change; consumed by every CustomDiagramNode and
 * CustomGroupNode so the theme lookup happens O(1) per render at the
 * page level instead of N× per frame across all nodes.
 *
 * Falling back to a fresh `resolveTheme('polished-dark')` keeps each
 * node usable in isolation (tests, storybook).
 */
export const ThemeContext = createContext<Theme | null>(null);

export function useEditorTheme(): Theme {
  return useContext(ThemeContext) ?? resolveTheme('polished-dark');
}
