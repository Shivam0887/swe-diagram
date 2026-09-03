'use client';

import React, { useMemo, useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Code2,
  Copy,
  Check,
  Sliders,
  X,
  Grid3x3,
  Circle,
  Square,
  Ban,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Button, Spinner } from '@heroui/react';
import type { CanvasBackground, DiagramDocument } from '@platform/diagram-schema';
import { renderDiagram, type BackgroundOption } from '@platform/diagram-renderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: DiagramDocument;
}

/**
 * The five values the picker exposes. `'theme'` falls through to
 * `doc.metadata.background`; the other four are concrete overrides
 * we send straight to the renderer.
 */
type BgMode = 'none' | 'theme' | 'grid' | 'dots' | 'solid';

const BG_MODES: { id: BgMode; label: string; description: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'theme', label: 'theme',  description: "use the document's configured background", icon: Sparkles },
  { id: 'none',  label: 'none',   description: 'transparent — alpha channel preserved',   icon: Ban },
  { id: 'grid',  label: 'grid',   description: 'line grid with a fill color',              icon: Grid3x3 },
  { id: 'dots',  label: 'dots',   description: 'dotted pattern with a fill color',         icon: Circle },
  { id: 'solid', label: 'solid',  description: 'single flat color',                        icon: Square },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  doc,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'svg' | 'json'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState<number>(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background picker state. We seed from the document's configured
  // background so users see what they'll get if they pick "theme" —
  // and so the "theme" pill can be preselected without forcing them
  // to dig into the document properties first.
  const docBg = doc.metadata?.background;
  const initialMode: BgMode = 'theme';
  const [bgMode, setBgMode] = useState<BgMode>(initialMode);

  // Concrete-override state. The values here are sent to the
  // renderer only when `bgMode !== 'theme' && bgMode !== 'none'`.
  // Each value has a sensible default pulled from the doc so the
  // picker never starts in a broken state.
  const [gridColor, setGridColor] = useState<string>(
    (docBg?.type === 'grid' && docBg.gridColor) || '#1F1F23'
  );
  const [gridSize, setGridSize] = useState<number>(
    (docBg?.type === 'grid' && docBg.gridSize) || 24
  );
  const [gridFill, setGridFill] = useState<string>(
    (docBg?.type === 'grid' && docBg.color) || '#0A0A0F'
  );

  const [dotColor, setDotColor] = useState<string>(
    (docBg?.type === 'dots' && docBg.dotColor) || '#2A2A33'
  );
  const [dotSpacing, setDotSpacing] = useState<number>(
    (docBg?.type === 'dots' && docBg.dotSpacing) || 24
  );
  const [dotFill, setDotFill] = useState<string>(
    (docBg?.type === 'dots' && docBg.color) || '#0A0A0F'
  );

  const [solidColor, setSolidColor] = useState<string>(
    (docBg?.type === 'solid' && docBg.color) || '#FFFFFF'
  );

  /**
   * Convert the picker state into a `BackgroundOption` we can pass
   * straight through to the renderer. `'theme'` is just the string
   * the renderer interprets as "use doc.metadata.background"; the
   * other three modes build a `CanvasBackground` literal.
   */
  const backgroundOption = useMemo<BackgroundOption>(() => {
    if (bgMode === 'theme') return 'theme';
    if (bgMode === 'none') return 'none';
    if (bgMode === 'grid') {
      const out: CanvasBackground = { type: 'grid', color: gridFill, gridColor, gridSize };
      return out;
    }
    if (bgMode === 'dots') {
      const out: CanvasBackground = { type: 'dots', color: dotFill, dotColor, dotSpacing };
      return out;
    }
    const out: CanvasBackground = { type: 'solid', color: solidColor };
    return out;
  }, [bgMode, gridColor, gridSize, gridFill, dotColor, dotSpacing, dotFill, solidColor]);

  if (!isOpen) return null;

  const fileName = doc.metadata?.title
    ? doc.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'architecture-diagram';

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);
    try {
      if (selectedFormat === 'json') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
        const downloadAnchorNode = window.document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `${fileName}.json`);
        window.document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        onClose();
        return;
      }

      if (selectedFormat === 'png') {
        try {
          const res = await fetch('/api/v1/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              document: doc,
              format: 'png',
              scale,
              theme: doc.theme,
              background: backgroundOption,
            }),
          });
          if (!res.ok) throw new Error(`server returned ${res.status}`);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = `${fileName}.png`;
          a.click();
          URL.revokeObjectURL(url);
          onClose();
          return;
        } catch (serverErr) {
          await exportPngClient();
          return;
        }
      }

      const { svg } = renderDiagram(doc, {
        theme: doc.theme || 'polished-dark',
        background: backgroundOption,
      });

      if (selectedFormat === 'svg') {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${fileName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPngClient = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const { svg, width: svgW, height: svgH } = renderDiagram(doc, {
        theme: doc.theme || 'polished-dark',
        background: backgroundOption,
      });
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = window.document.createElement('canvas');
          canvas.width = (img.width || svgW) * scale;
          canvas.height = (img.height || svgH) * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('canvas 2D context unavailable'));
            return;
          }
          ctx.scale(scale, scale);
          // The SVG already carries its own background (or none) based
          // on the chosen `backgroundOption`. Either way the canvas
          // just composites the image — no extra fillRect needed.
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            URL.revokeObjectURL(url);
            if (!pngBlob) {
              reject(new Error('canvas.toBlob returned null — likely a tainted canvas'));
              return;
            }
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = window.document.createElement('a');
            a.href = pngUrl;
            a.download = `${fileName}.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
            onClose();
            resolve();
          }, 'image/png');
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('failed to load SVG into Image — the rendered SVG may be malformed. Try exporting SVG to inspect the output.'));
      };
      img.src = url;
    });
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // The active mode's options panel. Each branch is its own small
  // form so the rest of the modal stays quiet when the user is just
  // clicking the picker pills.
  const renderBgOptions = () => {
    if (bgMode === 'theme') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-ink-2)',
            lineHeight: 1.5,
          }}
        >
          <Palette size={11} style={{ color: 'var(--color-accent)' }} />
          <span>doc default:&nbsp;</span>
          <code style={{ color: 'var(--color-ink)' }}>{docBg?.type ?? 'grid'}</code>
          <span style={{ color: 'var(--color-ink-2)' }}>·</span>
          <span>edit document metadata to change</span>
        </div>
      );
    }
    if (bgMode === 'none') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-ink-2)',
            lineHeight: 1.5,
          }}
        >
          <Ban size={11} style={{ color: 'var(--color-accent)' }} />
          <span>no background layer · alpha channel preserved</span>
        </div>
      );
    }
    if (bgMode === 'grid') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ColorRow label="line color" value={gridColor} onChange={setGridColor} />
          <ColorRow label="fill color" value={gridFill} onChange={setGridFill} />
          <SliderRow
            label="grid size"
            value={gridSize}
            min={8}
            max={64}
            step={4}
            onChange={setGridSize}
            suffix="px"
          />
        </div>
      );
    }
    if (bgMode === 'dots') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ColorRow label="dot color" value={dotColor} onChange={setDotColor} />
          <ColorRow label="fill color" value={dotFill} onChange={setDotFill} />
          <SliderRow
            label="dot spacing"
            value={dotSpacing}
            min={8}
            max={64}
            step={4}
            onChange={setDotSpacing}
            suffix="px"
          />
        </div>
      );
    }
    // solid
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ColorRow label="color" value={solidColor} onChange={setSolidColor} />
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--color-bg-raised)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 12,
          boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-hairline)',
            background: 'var(--color-bg-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Download size={13} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-2)' }}>
              export · canonical document
            </span>
          </div>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              color: 'var(--color-ink-2)',
              minWidth: 0,
              width: 28,
              height: 28,
              padding: 0,
            }}
          >
            <X size={14} />
          </Button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 90, 31, 0.08)',
                border: '1px solid var(--color-accent)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-accent)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              background: 'var(--color-hairline)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {(['png', 'svg', 'json'] as const).map((fmt) => (
              <Button
                key={fmt}
                onPress={() => setSelectedFormat(fmt)}
                variant={selectedFormat === fmt ? 'primary' : 'ghost'}
                size="sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  background: selectedFormat === fmt ? 'var(--color-accent)' : 'var(--color-bg)',
                  color: selectedFormat === fmt ? 'var(--color-bg)' : 'var(--color-ink)',
                  border: 'none',
                  borderRadius: 0,
                  height: 32,
                }}
              >
                {fmt === 'png' && <ImageIcon size={12} />}
                {fmt === 'svg' && <ImageIcon size={12} />}
                {fmt === 'json' && <Code2 size={12} />}
                {fmt}
              </Button>
            ))}
          </div>

          {(selectedFormat === 'png' || selectedFormat === 'svg') && (
            <div
              style={{
                padding: 14,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-ink)',
                  }}
                >
                  background
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6,
                  }}
                >
                  {BG_MODES.map(({ id, label, icon: Icon }) => {
                    const active = bgMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setBgMode(id)}
                        title={label}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          padding: '8px 4px',
                          background: active ? 'rgba(255, 90, 31, 0.10)' : 'var(--color-bg-raised)',
                          border: active
                            ? '1px solid var(--color-accent)'
                            : '1px solid var(--color-hairline)',
                          borderRadius: 6,
                          color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          letterSpacing: 0.2,
                          transition: 'all 120ms ease',
                        }}
                      >
                        <Icon size={13} style={{ color: 'currentColor' }} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    padding: 10,
                    background: 'var(--color-bg-raised)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 6,
                  }}
                >
                  {renderBgOptions()}
                </div>
              </div>

              {selectedFormat === 'png' && (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--color-hairline)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-ink)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Sliders size={11} style={{ color: 'var(--color-accent)' }} /> resolution scale
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--color-accent)' }}>
                      {scale}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--color-ink-2)',
                      marginTop: 4,
                    }}
                  >
                    <span>1x · 72dpi</span>
                    <span>2x · retina</span>
                    <span>3x · print</span>
                    <span>4x · 4k</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedFormat === 'json' && (
            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  margin: 0,
                  padding: 14,
                  background: '#000',
                  color: '#FAFAFA',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 10,
                  lineHeight: 1.6,
                  maxHeight: 220,
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {JSON.stringify(doc, null, 2)}
              </pre>
              <span title="Copy to clipboard" style={{ position: 'absolute', top: 6, right: 6, display: 'inline-flex' }}>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={copyJson}
                  aria-label="Copy to clipboard"
                  style={{
                    background: 'var(--color-bg-raised)',
                    minWidth: 0,
                    width: 28,
                    height: 28,
                    padding: 0,
                  }}
                >
                  {copied ? <Check size={11} style={{ color: 'var(--color-accent)' }} /> : <Copy size={11} />}
                </Button>
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--color-hairline)',
            background: 'var(--color-bg-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-2)' }}>
            {fileName}.{selectedFormat}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              onPress={onClose}
              variant="ghost"
              size="sm"
              style={{ height: 32, padding: '0 12px', fontSize: 11 }}
            >
              cancel
            </Button>
            <Button
              onPress={handleExport}
              isDisabled={isExporting}
              variant="primary"
              size="sm"
              style={{
                height: 32,
                padding: '0 14px',
                fontSize: 11,
                gap: 6,
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {isExporting ? (
                  <Spinner size="sm" style={{ width: 11, height: 11 }} />
                ) : (
                  <Download size={11} />
                )}
                {isExporting ? 'exporting' : `download ${selectedFormat}`}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Single labeled row with a color swatch + a text input bound to the
 * same value. Native `<input type="color">` gives us the swatch but
 * not a text field, so we pair the two. The user can type a hex or
 * pick from the OS color dialog.
 */
const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-ink-2)',
        width: 80,
        textTransform: 'lowercase',
        letterSpacing: 0.2,
      }}
    >
      {label}
    </span>
    <input
      type="color"
      value={normalizeColor(value)}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 28,
        height: 22,
        padding: 0,
        border: '1px solid var(--color-hairline)',
        borderRadius: 4,
        background: 'transparent',
        cursor: 'pointer',
      }}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      style={{
        flex: 1,
        height: 22,
        padding: '0 8px',
        background: 'var(--color-bg-raised)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 4,
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}
    />
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, suffix, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-ink-2)',
        width: 80,
        textTransform: 'lowercase',
        letterSpacing: 0.2,
      }}
    >
      {label}
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ flex: 1, accentColor: 'var(--color-accent)' }}
    />
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-accent)',
        width: 48,
        textAlign: 'right',
      }}
    >
      {value}{suffix ?? ''}
    </span>
  </div>
);

/**
 * `<input type="color">` only accepts 7-char hex (`#rrggbb`). The
 * user can type 3-char shorthand or 9-char hex with alpha into the
 * text input, and the swatch still needs a value to render. We fall
 * back to a neutral grey when the text is malformed.
 */
function normalizeColor(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return '#' + v.slice(1).split('').map((c) => c + c).join('');
  }
  if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7);
  return '#888888';
}
