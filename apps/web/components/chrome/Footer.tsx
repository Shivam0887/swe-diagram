import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-hairline)',
        marginTop: 96,
      }}
    >
      <div
        className="container"
        style={{
          padding: '48px 24px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 48,
        }}
      >
        <FooterCol title="Product">
          <FooterLink href="/editor">Editor</FooterLink>
          <FooterLink href="/dashboard">Dashboard</FooterLink>
          <FooterLink href="/api-docs">API</FooterLink>
        </FooterCol>
        <FooterCol title="Docs">
          <FooterLink href="/api-docs">REST reference</FooterLink>
          <FooterLink href="/api-docs">MCP server</FooterLink>
          <FooterLink href="/api-docs">CLI usage</FooterLink>
        </FooterCol>
        <FooterCol title="Open source">
          <FooterLink href="https://github.com" external>GitHub</FooterLink>
          <FooterLink href="/api-docs">Changelog</FooterLink>
          <FooterLink href="/api-docs">License</FooterLink>
        </FooterCol>
        <FooterCol title="Made with care">
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--color-ink-2)',
              maxWidth: 220,
            }}
          >
            Diagrams, compiled. The IR-first platform for technical architecture.
          </p>
        </FooterCol>
      </div>
      <div
        className="container"
        style={{
          padding: '20px 24px 32px',
          borderTop: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span className="t-mono">agentic / diagrams · {new Date().getFullYear()}</span>
        <span className="t-mono">v0.42.1 · region: global · canonical: 1.0</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        className="t-mono"
        style={{
          margin: 0,
          marginBottom: 16,
          color: 'var(--color-ink-3)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      style={{
        fontSize: 13,
        color: 'var(--color-ink)',
        textDecoration: 'none',
        transition: 'color 150ms ease',
      }}
    >
      {children}
    </Link>
  );
}
