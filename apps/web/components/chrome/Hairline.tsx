interface HairlineProps {
  orientation?: 'horizontal' | 'vertical';
  strong?: boolean;
}

export function Hairline({ orientation = 'horizontal', strong = false }: HairlineProps) {
  const isHoriz = orientation === 'horizontal';
  return (
    <div
      aria-hidden
      style={{
        [isHoriz ? 'height' : 'width']: '1px',
        [isHoriz ? 'width' : 'height']: '100%',
        background: strong ? 'var(--color-hairline-strong)' : 'var(--color-hairline)',
        flexShrink: 0,
      }}
    />
  );
}
