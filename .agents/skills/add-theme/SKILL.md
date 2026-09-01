---
name: add-theme
description: Standard operating procedure for creating, registering, and testing a visual theme across design tokens, semantic color roles, connectors, typography, and visual regression fixtures.
---

# Skill: Add or Customize a Diagram Theme

Use this skill when introducing a new visual theme (e.g., `educational-light`, `educational-dark`, `minimal-light`, `minimal-dark`, `blueprint-dark`) or updating existing design token mappings.

---

## Theme Architecture

A theme maps abstract semantic roles to concrete visual tokens without altering the underlying canonical `DiagramDocument`.

```text
Theme
 ├── metadata (id, name, version, mode: light | dark)
 ├── colors (canvas, surface, borders, text, semantic roles)
 ├── typography (title, nodeTitle, subtitle, annotation, badge)
 ├── geometry (radii, spacing, shadows, strokes)
 ├── nodes (compute, storage, messaging, cache, network, external)
 ├── edges (default, active, dashed, animated, arrows)
 ├── groups (boundary, domain, swimlane, container)
 └── annotations (step, callout, highlight, note)
```

---

## Step-by-Step Procedure

### 1. Define Design Tokens
In `packages/design-system/src/themes/<theme-id>/tokens.ts`:
- Define concrete values for spacing, corner radius, stroke widths, and font sizes.
- Ensure all color values use curated, high-contrast palettes.

```ts
import type { ThemeTokens } from '../../types';

export const tokens: ThemeTokens = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 18, pill: 999 },
  strokes: { thin: 1, default: 1.5, bold: 2, heavy: 3 },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.08)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
};
```

---

### 2. Map Semantic Node Roles
In `packages/design-system/src/themes/<theme-id>/nodes.ts`:
- Assign distinct background, border, text, and icon accent colors for each semantic role:
  - `compute` (services, workers, lambdas)
  - `storage` (databases, object storage)
  - `messaging` (queues, kafka, event streams)
  - `cache` (redis, memcached)
  - `network` (api gateway, load balancer, cdn)
  - `external` (third-party APIs, external users)

---

### 3. Map Connector & Edge Styles
In `packages/design-system/src/themes/<theme-id>/edges.ts`:
- Define stroke colors, arrow marker dimensions, selected state glow, and animation dash patterns.

---

### 4. Map Annotation & Step Styles
In `packages/design-system/src/themes/<theme-id>/annotations.ts`:
- Configure numbered step badges (e.g. bold circular badges with contrasting numerals).
- Configure callout boxes, notes, and group boundary fills.

---

### 5. Register Theme in Registry
In `packages/design-system/src/themes/index.ts`:
- Export the theme object with immutable version tag (e.g. `educational-light@1.0.0`).
- Register into `themeRegistry`.

```ts
export const themeRegistry: Record<string, Theme> = {
  'educational-light': educationalLightTheme,
  'educational-dark': educationalDarkTheme,
  'minimal-light': minimalLightTheme,
  'minimal-dark': minimalDarkTheme,
  // New theme
  'blueprint-dark': blueprintDarkTheme,
};
```

---

### 6. Visual Testing (Optional / Deferred)
- (Deferred for now) Create a test fixture with the new theme in `packages/diagram-renderer/test/fixtures/`.
- (Deferred for now) Run snapshot and visual diff tests to verify export fidelity across light/dark modes.
