'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { ArrowLeft, Undo2, Redo2, Wand2, Download, Save, Loader2, Sparkles, ChevronDown } from 'lucide-react';
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
  onLoadTemplate: (t: string) => void;
  onOpenCopilot: () => void;
  isSaving: boolean;
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
  onLoadTemplate,
  onOpenCopilot,
  isSaving,
}) => {
  const [themeOpen, setThemeOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const currentThemeName = ALL_THEMES.find((t) => t.id === currentTheme)?.name ?? currentTheme;

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
            value={title || 'Untitled Diagram'}
            onChange={(e) => onTitleChange(e.target.value)}
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
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--color-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
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
      </div>

      {/* Right: theme / template / copilot / save / export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        {/* Theme selector */}
        <div style={{ position: 'relative' }}>
          <Button
            onPress={() => {
              setThemeOpen((v) => !v);
              setTemplateOpen(false);
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

        {/* Template selector */}
        <div style={{ position: 'relative' }}>
          <Button
            onPress={() => {
              setTemplateOpen((v) => !v);
              setThemeOpen(false);
            }}
            variant="ghost"
            size="sm"
            style={toolbarBtnStyle}
          >
            templates <ChevronDown size={12} />
          </Button>
          {templateOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: 240,
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                padding: 4,
                zIndex: 50,
              }}
            >
              {['aws-three-tier-elasticache', 'kafka-exactly-once', 'cqrs-event-sourcing'].map((key) => (
                <Button
                  key={key}
                  onPress={() => {
                    onLoadTemplate(key);
                    setTemplateOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  style={{
                    ...toolbarBtnStyle,
                    width: '100%',
                    justifyContent: 'flex-start',
                    color: 'var(--color-ink)',
                  }}
                >
                  {key.replace(/-/g, ' ')}
                </Button>
              ))}
            </div>
          )}
        </div>

        <span title="AI co-pilot" style={{ display: 'inline-flex' }}>
          <Button
            onPress={onOpenCopilot}
            variant="ghost"
            size="sm"
            style={toolbarBtnStyle}
            aria-label="AI co-pilot"
          >
            <Sparkles size={14} /> co-pilot
          </Button>
        </span>

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
