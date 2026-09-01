'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ThemeMode = 'aurora-dark' | 'aurora-light';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'diagcraft.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('aurora-dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'aurora-dark' || stored === 'aurora-light') {
        setThemeState(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('aurora-dark', 'aurora-light');
    root.classList.add(theme);
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'aurora-light' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((prev) => (prev === 'aurora-dark' ? 'aurora-light' : 'aurora-dark')),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: 'aurora-dark' as ThemeMode, setTheme: () => {}, toggle: () => {} };
  }
  return ctx;
}
