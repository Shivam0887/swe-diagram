---
name: testing-and-regression
description: Guidelines for unit testing, SVG snapshot testing, and Playwright visual regression testing (Deferred during initial MVP build).
trigger: model_decision
---

# Rule: Testing Strategy & Visual Regression (Deferred for Now)

> [!NOTE]
> Writing unit, snapshot, and visual regression tests is currently deferred during initial prototyping. Refer to these guidelines when automated testing suites are enabled in later milestones.

## 1. Subsystem Test Ownership (Future Reference)
When test suites are enabled, subsystems will follow this ownership matrix:

| Package | Test Type | Focus Areas |
| :--- | :--- | :--- |
| `@platform/diagram-schema` | Unit (Vitest) | Schema validation, invalid payload rejection, migration functions (`migrateDocument`). |
| `@platform/diagram-core` | Unit (Vitest) | Geometry helpers (`Rect`, `Point`, `contains`, `intersects`, `distance`), command execution & undo. |
| `@platform/diagram-layout` | Unit (Vitest) | ELK layout conversion, spacing calculation, orthogonal route post-processing, port resolution. |
| `@platform/diagram-renderer` | Snapshot (Vitest) | Deterministic SVG snapshots of individual nodes, connectors, groups, annotations, and whole diagrams. |
| `@platform/db` | Integration (Vitest) | Repositories, diagram JSONB serialization/deserialization, version snapshot recording. |
| `apps/web` | E2E & Visual (Playwright) | Visual regression of canonical reference diagrams, editor canvas interactions, REST API validation. |

## 2. Deterministic SVG Snapshot Testing
- In `@platform/diagram-renderer`, each component renderer (node, edge, group, annotation) must have a snapshot test.
- Snapshots must verify:
  - Element IDs (e.g. `node-postgres`, `edge-request`) are stable.
  - Geometry matches measured bounding boxes.
  - Proper theme classes and inline presentation attributes are resolved without undefined or NaN values.

## 3. Playwright Visual Regression Fixtures
- Maintain standard reference diagrams for visual regression suites:
  - `01-simple-flow`: Single path flow between user, gateway, and service.
  - `02-service-boundary`: Group containers and multiple microservices.
  - `03-cache-flow`: Cache-aside architecture with Redis and PostgreSQL.
  - `04-queue-flow`: Asynchronous worker processing via Kafka / SQS.
  - `05-complex-system`: High-density enterprise architecture.
- Visual tests compare rendered SVGs and PNG rasterizations against baseline screenshots with pixel-diff thresholds.
