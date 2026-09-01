interface MetaProps {
  items: (string | { label: string; accent?: boolean })[];
  separator?: string;
}

/**
 * A small monospace metadata strip — used for status bars,
 * not for general body content. Each item can be a plain string
 * or an object with `accent: true` to render in the accent color.
 */
export function Meta({ items, separator = '·' }: MetaProps) {
  return (
    <div
      className="t-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        color: 'var(--color-ink-2)',
        textTransform: 'lowercase',
      }}
    >
      {items.map((it, i) => {
        const text = typeof it === 'string' ? it : it.label;
        const accent = typeof it === 'string' ? false : it.accent;
        return (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {i > 0 && (
              <span style={{ color: 'var(--color-ink-3)' }} aria-hidden>
                {separator}
              </span>
            )}
            <span style={{ color: accent ? 'var(--color-accent)' : 'var(--color-ink-2)' }}>{text}</span>
          </span>
        );
      })}
    </div>
  );
}
