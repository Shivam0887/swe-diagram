interface FigureCaptionProps {
  number: string;
  label: string;
}

/**
 * Editorial-style section caption. Use sparingly — at most 3 per page.
 * Renders as 11px mono, uppercase, in the muted ink color.
 */
export function FigureCaption({ number, label }: FigureCaptionProps) {
  return (
    <div
      className="t-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        textTransform: 'uppercase',
        color: 'var(--color-ink-2)',
      }}
    >
      <span style={{ color: 'var(--color-accent)' }}>fig. {number}</span>
      <span style={{ color: 'var(--color-ink-3)' }}>·</span>
      <span>{label}</span>
    </div>
  );
}
