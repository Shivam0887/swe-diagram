import Link from 'next/link';

interface HeaderProps {
  active?: 'gallery' | 'editor' | 'api' | 'docs' | null;
  rightSlot?: React.ReactNode;
}

const NAV: { id: NonNullable<HeaderProps['active']>; href: string; label: string }[] = [
  { id: 'gallery', href: '/gallery', label: 'Gallery' },
  { id: 'editor', href: '/editor', label: 'Editor' },
  { id: 'api', href: '/api-docs', label: 'API' },
];

export function Header({ active = null, rightSlot }: HeaderProps) {
  return (
    <header
      style={{
        position: 'relative',
        zIndex: 10,
        height: 56,
        borderBottom: '1px solid var(--color-hairline)',
        background: 'var(--color-bg)',
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-ink)',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Wordmark />
          <span style={{ color: 'var(--color-ink-2)' }}>/ diagrams</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: active === n.id ? 'var(--color-ink)' : 'var(--color-ink-2)',
                textDecoration: 'none',
                padding: '4px 0',
                borderBottom: active === n.id ? '1px solid var(--color-accent)' : '1px solid transparent',
                transition: 'color 150ms ease, border-color 150ms ease',
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {rightSlot ?? (
            <Link
              href="/editor"
              className="btn btn--ghost btn--sm"
              style={{ textDecoration: 'none' }}
            >
              Open editor
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="19" height="19" rx="3" stroke="var(--color-ink)" />
      <circle cx="5" cy="5" r="1.4" fill="var(--color-ink)" />
      <circle cx="15" cy="5" r="1.4" fill="var(--color-ink-2)" />
      <circle cx="10" cy="10" r="1.4" fill="var(--color-accent)" />
      <circle cx="5" cy="15" r="1.4" fill="var(--color-ink-2)" />
      <circle cx="15" cy="15" r="1.4" fill="var(--color-ink)" />
      <path
        d="M5 5 L10 10 L15 5 M5 15 L10 10 L15 15"
        stroke="var(--color-ink-2)"
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  );
}
