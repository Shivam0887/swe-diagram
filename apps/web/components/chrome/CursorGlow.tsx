'use client';

import { useEffect, useRef } from 'react';

/**
 * A single fixed radial gradient that follows the cursor.
 * Mounted only on landing + gallery — never inside the editor.
 * Honors prefers-reduced-motion by no-op'ing the listener.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 3;

    const apply = () => {
      el.style.setProperty('--mx', `${mx}px`);
      el.style.setProperty('--my', `${my}px`);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    apply();
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
