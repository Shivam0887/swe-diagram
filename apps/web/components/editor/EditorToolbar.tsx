'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Wand2,
  Download,
  Save,
  Loader2,
  ChevronDown,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import type { ThemeId } from '@platform/diagram-schema';
import { getAllThemes } from '@platform/design-system';

const ALL_THEMES = getAllThemes().map((t) => ({ id: t.id, name: t.name }));

interface EditorToolbarProps {
  title?: string;
  onTitleChange?: (t: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentTheme: ThemeId;
  onThemeChange: (t: ThemeId) => void;
  onAutoLayout?: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  /**
   * No-op kept for backward compatibility after the gallery/templates
   * removal. The editor's template dropdown is gone; this prop is no
   * longer surfaced in the UI.
   */
  onLoadTemplate?: (t: string) => void;
  isSaving: boolean;
  /** Show or hide the left component palette. */
  paletteOpen: boolean;
  onTogglePalette: () => void;
  /** Show or hide the right properties / copilot panel. */
  propertiesOpen: boolean;
  onToggleProperties: () => void;
}

const toolbarBtnStyle: React.CSSProperties = {
  height: 32,
  minWidth: 0,
  padding: '0 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.01em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-sans)',
};

const iconBtnStyle: React.CSSProperties = {
  ...toolbarBtnStyle,
  width: 32,
  padding: 0,
  justifyContent: 'center',
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentTheme,
  onThemeChange,
  onAutoLayout,
  onSave,
  onOpenExport,
  isSaving,
  paletteOpen,
  onTogglePalette,
  propertiesOpen,
  onToggleProperties,
}) => {
  const [themeOpen, setThemeOpen] = useState(false);
  const currentThemeName = ALL_THEMES.find((t) => t.id === currentTheme)?.name ?? currentTheme;

  /**
   * The title input is buffered locally so the user's typing is
   * never blocked by a parent re-render. The history manager
   * creates a new undo step on every doc mutation, and pushing one
   * of those for every keystroke makes the input's `value` prop
   * change between renders — which causes React to reset the
   * selection to the end of the field, making it impossible to edit
   * a name in the middle.
   *
   * The local state is the source of truth while the input has
   * focus; the `title` prop is only read for the initial value
   * (and when it changes while the input is not focused, e.g. an
   * undo). We debounce the commit so the history stack gets one
   * entry per typing burst rather than one per keystroke.
   */
  const [localTitle, setLocalTitle] = useState<string>(title || 'Untitled Diagram');
  const isFocusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external title changes (e.g. undo) into the local buffer
  // — but only when the user is not actively editing, otherwise
  // we'd stomp on their typing.
  useEffect(() => {
    if (isFocusedRef.current) return;
    const next = title || 'Untitled Diagram';
    setLocalTitle((prev) => (prev === next ? prev : next));
  }, [title]);

  // Clean up any pending debounce on unmount so a late commit
  // doesn't try to call into a stale prop.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const commitTitle = (next: string) => {
    if (!onTitleChange) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 300 ms is the sweet spot — short enough that the title
    // visually updates with typing, long enough that rapid
    // keystrokes coalesce into a single undo step.
    debounceRef.current = setTimeout(() => {
      if (next !== title) onTitleChange(next);
    }, 300);
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 30,
        height: 56,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-hairline)',
      }}
    >
      {/* Left: back link + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <Link
          href="/"
          className="btn--link"
          aria-label="Back to home"
          style={{ fontSize: 13, color: 'var(--color-ink-2)' }}
        >
          <ArrowLeft size={14} /> home
        </Link>
        <span
          aria-hidden
          style={{ width: 1, height: 20, background: 'var(--color-hairline)' }}
        />
        {onTitleChange ? (
          <input
            type="text"
            value={localTitle}
            onFocus={(e) => {
              isFocusedRef.current = true;
              e.currentTarget.style.borderBottomColor = 'var(--color-accent)';
            }}
            onBlur={(e) => {
              isFocusedRef.current = false;
              e.currentTarget.style.borderBottomColor = 'transparent';
              // Flush any pending debounce immediately on blur so
              // the user's last edit isn't lost when they tab away.
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (onTitleChange && localTitle !== (title || 'Untitled Diagram')) {
                onTitleChange(localTitle);
              }
            }}
            onChange={(e) => {
              const next = e.target.value;
              setLocalTitle(next);
              commitTitle(next);
            }}
            spellCheck={false}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-ink)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid transparent',
              padding: '4px 2px',
              outline: 'none',
              width: 280,
              transition: 'border-color 150ms ease',
            }}
          />
        ) : (
          <h1
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-ink)',
              padding: '4px 2px',
            }}
          >
            {title || 'Untitled Diagram'}
          </h1>
        )}
      </div>

      {/* Center: undo/redo/auto-layout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span title="Undo (Ctrl+Z)" style={{ display: 'inline-flex' }}>
          <Button
            onPress={onUndo}
            isDisabled={!canUndo}
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Undo (Ctrl+Z)"
            style={{ ...iconBtnStyle, opacity: canUndo ? 1 : 0.4 }}
          >
            <Undo2 size={14} />
          </Button>
        </span>
        <span title="Redo (Ctrl+Y)" style={{ display: 'inline-flex' }}>
          <Button
            onPress={onRedo}
            isDisabled={!canRedo}
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Redo (Ctrl+Y)"
            style={{ ...iconBtnStyle, opacity: canRedo ? 1 : 0.4 }}
          >
            <Redo2 size={14} />
          </Button>
        </span>
        <span
          aria-hidden
          style={{ width: 1, height: 20, background: 'var(--color-hairline)', margin: '0 6px' }}
        />
        {onAutoLayout && (
          <span title="Auto-layout (ELK)" style={{ display: 'inline-flex' }}>
            <Button
              onPress={onAutoLayout}
              variant="ghost"
              size="sm"
              style={toolbarBtnStyle}
              aria-label="Auto-layout (ELK)"
            >
              <Wand2 size={14} /> auto-layout
            </Button>
          </span>
        )}

        <span
          aria-hidden
          style={{ width: 1, height: 20, background: 'var(--color-hairline)', margin: '0 6px' }}
        />

        <span
          title={paletteOpen ? 'Hide component palette' : 'Show component palette'}
          style={{ display: 'inline-flex' }}
        >
          <Button
            onPress={onTogglePalette}
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={paletteOpen ? 'Hide component palette' : 'Show component palette'}
            style={{
              ...iconBtnStyle,
              background: paletteOpen ? 'transparent' : 'var(--color-bg-sunken)',
              color: paletteOpen ? 'var(--color-ink-2)' : 'var(--color-ink)',
            }}
          >
            <PanelLeft size={14} />
          </Button>
        </span>
        <span
          title={propertiesOpen ? 'Hide properties panel' : 'Show properties panel'}
          style={{ display: 'inline-flex' }}
        >
          <Button
            onPress={onToggleProperties}
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={propertiesOpen ? 'Hide properties panel' : 'Show properties panel'}
            style={{
              ...iconBtnStyle,
              background: propertiesOpen ? 'transparent' : 'var(--color-bg-sunken)',
              color: propertiesOpen ? 'var(--color-ink-2)' : 'var(--color-ink)',
            }}
          >
            <PanelRight size={14} />
          </Button>
        </span>
      </div>

      {/* Right: theme / template / copilot / save / export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        {/* Theme selector */}
        <div style={{ position: 'relative' }}>
          <Button
            onPress={() => {
              setThemeOpen((v) => !v);
            }}
            variant="ghost"
            size="sm"
            style={toolbarBtnStyle}
          >
            {currentThemeName} <ChevronDown size={12} />
          </Button>
          {themeOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: 220,
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                padding: 4,
                zIndex: 50,
              }}
            >
              {ALL_THEMES.map((t) => (
                <Button
                  key={t.id}
                  onPress={() => {
                    onThemeChange(t.id as ThemeId);
                    setThemeOpen(false);
                  }}
                  variant={t.id === currentTheme ? 'secondary' : 'ghost'}
                  size="sm"
                  style={{
                    ...toolbarBtnStyle,
                    width: '100%',
                    justifyContent: 'flex-start',
                    background: t.id === currentTheme ? 'var(--color-bg-sunken)' : 'transparent',
                    color: 'var(--color-ink)',
                  }}
                >
                  {t.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Template selector removed when the gallery was deleted.
            Users now start from a blank canonical document and save their
            work to a real project. */}

        <span
          aria-hidden
          style={{ width: 1, height: 20, background: 'var(--color-hairline)', margin: '0 4px' }}
        />

        <Button
          onPress={onSave}
          isDisabled={isSaving}
          variant="ghost"
          size="sm"
          style={toolbarBtnStyle}
        >
          {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          {isSaving ? 'saving' : 'save'}
        </Button>
        <Button
          onPress={onOpenExport}
          variant="primary"
          size="sm"
          style={{
            ...toolbarBtnStyle,
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            borderColor: 'var(--color-accent)',
          }}
        >
          <Download size={14} /> export
        </Button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
