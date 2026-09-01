---
name: schema-and-versioning
description: Rules for Zod schema validation, semantic node typing, document migrations, and deterministic version hashing.
trigger: always_on
---

# Rule: Schema Invariants, Versioning & Migrations

## 1. Zod Validation at Boundaries
- Every data input entering the system from HTTP requests, JSON imports, or AI prompts must be validated through the canonical Zod schema in `@platform/diagram-schema`.
- On validation failure, return structured, path-indexed error responses:
  ```json
  {
    "error": {
      "code": "DIAGRAM_VALIDATION_FAILED",
      "message": "Diagram document is invalid.",
      "details": [
        {
          "path": ["nodes", 0, "type"],
          "message": "Invalid node type"
        }
      ],
      "requestId": "req_..."
    }
  }
  ```

## 2. Semantic Node Naming (No Presentation in Types)
- Node types must represent semantic architectural roles, not visual appearance.
- **Allowed**: `user`, `browser`, `mobile`, `api_gateway`, `load_balancer`, `service`, `worker`, `server`, `container`, `queue`, `kafka`, `stream`, `cache`, `redis`, `database`, `postgresql`, `object_storage`, `cdn`, `search`, `cloud`, `monitoring`.
- **Prohibited**: `yellow_database_node`, `rounded_blue_service_box`, `big_icon_container`.
- Visual styling (color roles, borders, badges, emphasis) must be provided via `style`, `variant`, or theme tokens.

## 3. Schema Versioning & Migrations
- Every `DiagramDocument` must have an explicit `schemaVersion` string (e.g. `"1.0"`).
- Schema evolution must be accompanied by explicit migration functions:
  ```ts
  export function migrateDocument(
    document: unknown,
    targetVersion: string
  ): DiagramDocument {
    // Migration steps from version N to version N+1
  }
  ```
- Never silently reinterpret an older document under new schema rules without executing a migration step.

## 4. Deterministic Render Hashing
- Cache keys for rendered SVG, PNG, and layout graphs must be computed deterministically:
  ```ts
  const renderHash = sha256(
    JSON.stringify({
      document: canonicalDocument,
      themeVersion: theme.version,
      rendererVersion: RENDERER_VERSION,
      fontVersion: FONT_VERSION
    })
  );
  ```
- Keys must never rely solely on a mutable `diagramId` because theme and renderer version changes alter the resulting visual output.
