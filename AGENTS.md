# Agentic Workflow & Architecture Guide - Technical Diagram Platform

This document serves as the master instructions for AI agents and human contributors working on the Technical Diagram Platform codebase.

---

## 1. Core Mission & Architectural Principle

The platform is a compiler-driven, SVG-first technical diagram platform built with Next.js, React, and TypeScript. It produces ByteByteGo-inspired visual architecture diagrams with high instructional clarity, exposed both via an interactive browser editor and a versioned REST API.

### The Single Source of Truth
> **The canonical Diagram Document / Diagram IR is the sole source of truth.**
> React Flow (`@xyflow/react`) is exclusively an interactive editor adapter. It is not the public document format, not the persistence format, and not the rendering engine.

---

## 2. Monorepo Package Boundaries & Ownership

Code must strictly adhere to the following package boundaries:

| Package / Directory | Ownership & Responsibilities | Prohibited Dependencies |
| :--- | :--- | :--- |
| `@platform/diagram-schema` (`/packages/diagram-schema`) | Canonical TypeScript types, Zod schemas, validation, schema migrations (`1.0` -> `1.1`). | No UI dependencies, no React, no React Flow, no Node runtime internals. |
| `@platform/diagram-core` (`/packages/diagram-core`) | Mutation commands (`DiagramCommand`), geometry utilities (`Rect`, `Point`, `Bounds`), normalization, deterministic ID generators. | No React, no UI libraries. |
| `@platform/design-system` (`/packages/design-system`) | Design tokens (spacing, radius, typography, colors), themes (`educational-light`, `educational-dark`, `minimal-light`, `minimal-dark`), semantic color roles. | No direct editor coupling. |
| `@platform/icon-library` (`/packages/icon-library`) | SVG icon definitions, icon registry, viewBox and path data. | No React Flow dependencies. |
| `@platform/diagram-layout` (`/packages/diagram-layout`) | ELK.js layout integration, spacing rules, port placement, connector routing, collision resolution. Returns geometry only. | No rendering or styling logic. |
| `@platform/diagram-renderer` (`/packages/diagram-renderer`) | Deterministic SVG renderer, text measurement (`fontkit`), SVG serialization. Headless Node.js compatible. | Must NEVER import React Flow, DOM globals, or browser-only APIs. |
| `@platform/diagram-editor` (`/packages/diagram-editor`) | React Flow adapter (`toReactFlow`), custom node/edge views, drag/drop handles, selection, snapping guides. | Never store or leak internal React Flow state directly into the canonical document. |
| `@platform/export` (`/packages/export`) | SVG export, PNG rasterization via `sharp`, PDF conversion, artifact packaging. | No browser screenshot dependencies. |
| `@platform/db` (`/packages/db`) | PostgreSQL + Drizzle ORM models, migrations, repositories. Persists canonical diagram document as JSONB. | No UI code. |
| `@app/web` (`/apps/web`) | Next.js App Router (Dashboard, Editor, REST API `/api/v1/...`, API documentation, Auth). | No direct inline diagram mutation logic; must invoke domain services. |
| `@app/worker` (`/apps/worker`) | BullMQ + Redis background worker for asynchronous rendering, exports, and batch processing. | No interactive UI code. |

---

## 3. Ten Mandatory Development Rules

1. **Preserve Architecture Boundaries**: Never put domain business logic inside React UI components or Route Handlers. Use the shared Service layer (`DiagramService`, `RenderService`, `LayoutService`).
2. **Preserve Canonical IR**: Always validate and store the canonical `DiagramDocument`. Never serialize React Flow node instances to the database.
3. **Renderer Must Remain Headless**: The SVG renderer must run in Node.js server environments without DOM or browser shims.
4. **Validate at Boundaries**: Use Zod schemas on all API inputs, imports, and AI-generated outputs before passing data to domain logic.
5. **Prefer Semantic Concepts**: Use semantic names (`user`, `api_gateway`, `service`, `database`, `cache`, `queue`, `worker`) instead of presentation-specific names (e.g. avoid `blue_box_with_icon`).
6. **Separate Layout from Rendering**: Layout computes coordinates and geometry (`LayoutResult`); renderer consumes geometry and produces visual appearance (`RenderResult`).
7. **Defer Automated Tests for Now**: Automated testing suites (unit tests, snapshot tests, visual regressions) are deferred during initial rapid prototyping. Focus on core architecture, contracts, and type safety.
8. **Do Not Over-Engineer Early**: Start with synchronous in-memory rendering; introduce BullMQ background workers only when workload or large batch exports require it.
9. **Favor Determinism**: Rendering and hashing must be 100% reproducible. The render hash is `SHA256(canonicalDocument + theme + renderer + fonts)`.
10. **Never Silently Break Schemas**: Any schema modification requires an explicit schema version bump and a tested `migrateDocument()` migration step.

---

## 4. Prohibited Anti-Patterns

- **Anti-pattern 1**: Persisting React Flow nodes or edges directly into the database.
- **Anti-pattern 2**: Taking browser canvas/DOM screenshots to generate PNG or PDF exports.
- **Anti-pattern 3**: Generating raw SVG strings directly with LLMs instead of compiling semantic JSON IR.
- **Anti-pattern 4**: Hardcoding hex colors, pixel font sizes, or inline style constants inside component renderers.
- **Anti-pattern 5**: Running full ELK graph layout synchronously on every mouse move or drag event.
- **Anti-pattern 6**: Normalizing individual diagram visual properties into separate SQL relational columns instead of document JSONB.
- **Anti-pattern 7**: Tightly coupling renderers to a single theme without going through design token resolution.
- **Anti-pattern 8**: Rendering un-sanitized external SVG or asset inputs.
- **Anti-pattern 9**: Writing messy or ambiguous rendering conditions (e.g., nested ternary operators, unchecked boolean flags).

---

## 5. Agent Task Execution Protocol

When implementing any feature or modification:

```text
1. Inspect existing architecture & identify target package boundaries.
2. Update schema/contracts in @platform/diagram-schema first if required.
3. Implement domain logic and commands in @platform/diagram-core.
4. Update or register components/tokens in design-system or icon-library.
5. Implement editor adapters in @platform/diagram-editor.
6. Implement headless SVG renderers in @platform/diagram-renderer.
7. Run typecheck, lint, and build verification.
8. Provide clear summary with file links.
```

---

## 6. Core Skills & Runbooks

Use the dedicated agent skills in `.agents/skills/` for specific tasks:
- `add-node-type`: Step-by-step 10-point workflow for registering a new semantic node type.
- `add-theme`: Guide for defining tokens, semantic role mappings, and visual fixtures.
- `diagram-layout-routing`: ELK.js layout pipeline, port mapping, and connector routing post-processing.
- `svg-renderer-pipeline`: Headless SVG renderer rules, fontkit text measurement, and Sharp rasterization.
- `rest-service-endpoint`: REST API route handler, Zod validation, Service Layer, and Drizzle JSONB persistence.
