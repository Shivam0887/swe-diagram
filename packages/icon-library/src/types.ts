import type React from 'react';

export type IconCategory =
  | 'client'
  | 'compute'
  | 'storage'
  | 'messaging'
  | 'network'
  | 'security'
  | 'cloud'
  | 'framework'
  | 'monitoring'
  | 'misc';

/**
 * A generic SVG element from a Lucide/Tabler icon. `tag` is the element
 * name (path, rect, line, circle, etc.) and `props` is the attributes
 * excluding the React `key` (which is renderer-internal).
 *
 * Lucide/Tabler `__iconNode` is `[tag, props][]` — same shape.
 */
export type IconElement = {
  tag: string;
  props: Record<string, string | number | undefined>;
};

export type IconNode =
  /** Single SVG path data string (the existing native format). */
  | { kind: 'path'; d: string }
  /** Generic SVG element (rect, line, circle, path) — for libraries that
   *  mix primitives, e.g. Lucide. */
  | { kind: 'element'; tag: string; props: Record<string, string | number | undefined> };

export type DiagramIconDefinition = {
  name: string;
  category: IconCategory;
  viewBox?: string;
  /**
   * Renderable icon body. Mixed kinds are allowed: `'path'` entries become
   * `<path d="…"/>`, `'element'` entries become the literal element. The
   * renderer and React consumer handle both transparently.
   */
  nodes: IconNode[];
  /** Optional fill for tinted glyphs (architecture iconography). */
  color?: string;
  /** Optional source attribution (library + license). */
  source?: 'native' | 'lucide' | 'tabler';
  /**
   * For Lucide/Tabler entries: the resolved React component, attached at
   * module-load time in `registry.ts`. Consumers should read from this
   * rather than calling `getLucideIcon` / `getTablerIcon` on every render
   * (which would re-allocate an uppercased key string each call).
   */
  component?: React.ComponentType<any>;
};

export type IconRegistry = Record<string, DiagramIconDefinition>;

/**
 * Back-compat shim: existing icon definitions use `paths: string[]`.
 * `DiagramIconDefinition` now uses `nodes`, but to keep the diff focused
 * on the new icons, we accept the legacy shape via {@link iconFromPaths}.
 * If you read `def.paths` you can use {@link flattenIconPaths} below.
 */
export function iconFromPaths(
  name: string,
  category: IconCategory,
  viewBox: string,
  paths: string[],
  opts: { color?: string; source?: 'native' | 'lucide' | 'tabler' } = {},
): DiagramIconDefinition {
  return {
    name,
    category,
    viewBox,
    nodes: paths.map((d) => ({ kind: 'path' as const, d })),
    color: opts.color,
    source: opts.source ?? 'native',
  };
}

/** Read all `d` strings from an icon (in painter order). */
export function flattenIconPaths(def: DiagramIconDefinition): string[] {
  return def.nodes
    .map((n) => (n.kind === 'path' ? n.d : n.tag === 'path' ? (n.props.d as string | undefined) ?? '' : ''))
    .filter(Boolean);
}

/** Coerce an unknown icon definition (older callers) to the current shape. */
export function coerceIcon(input: any): DiagramIconDefinition {
  if (input && Array.isArray(input.nodes)) return input as DiagramIconDefinition;
  if (input && Array.isArray(input.paths)) {
    return {
      name: input.name,
      category: input.category,
      viewBox: input.viewBox ?? '0 0 24 24',
      nodes: (input.paths as string[]).map((d) => ({ kind: 'path' as const, d })),
      color: input.color,
      source: input.source ?? 'native',
    };
  }
  throw new Error(`Invalid icon definition: ${JSON.stringify(input).slice(0, 80)}`);
}

// ─── Render helpers ─────────────────────────────────────────────────────────

/**
 * Return the icon as a flat array of `{ tag, props }` describing what
 * `<svg>` children to render. Used by both the React consumer (CustomDiagramNode,
 * IconPickerModal) and the SVG renderer (`renderNode.ts`).
 *
 * For pure-path icons this collapses to a list of `{ tag: 'path', props: { d } }`.
 * For mixed icons (Lucide, Tabler) it's whatever primitives the source has.
 */
export function getIconElements(def: DiagramIconDefinition): IconElement[] {
  return def.nodes.map((n) =>
    n.kind === 'path'
      ? { tag: 'path', props: { d: n.d } }
      : { tag: n.tag, props: { ...n.props } },
  );
}

/** Just the first `d` of the icon (or empty). Used by the single-line label chip. */
export function getIconPrimaryPath(def: DiagramIconDefinition): string {
  for (const n of def.nodes) {
    if (n.kind === 'path' && n.d) return n.d;
    if (n.kind === 'element' && n.tag === 'path') {
      const d = n.props.d;
      if (typeof d === 'string') return d;
    }
  }
  return '';
}
