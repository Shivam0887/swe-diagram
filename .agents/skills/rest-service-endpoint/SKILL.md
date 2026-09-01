---
name: rest-service-endpoint
description: Best-practice guide for creating REST API endpoints (/api/v1/...), Zod validation, Service Layer isolation, Drizzle ORM JSONB persistence, API key authentication, and structured error responses.
---

# Skill: REST API & Domain Service Architecture

Use this skill when building or modifying backend API endpoints in `apps/web/app/api/v1/...` and domain services in `packages/db` and `packages/diagram-core`.

---

## 1. Request Flow Architecture

```text
HTTP Request (e.g. POST /api/v1/diagrams)
       ↓
API Key Authentication & Organization Resolution
       ↓
Rate Limit Guard (Redis token bucket)
       ↓
Zod Request Body Validation
       ↓
Domain Service Invocation (e.g. DiagramService.createDiagram)
       ↓
Drizzle ORM Repository (JSONB storage)
       ↓
Standard JSON Response / Error Response
```

---

## 2. Next.js App Router Route Handler Pattern

In `apps/web/app/api/v1/diagrams/route.ts`:
- Route handlers must remain lightweight controllers.
- Perform auth check, validate schema, call the service layer, and return standard JSON.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateDiagramRequestSchema } from '@platform/diagram-schema';
import { authenticateApiKey } from '@/lib/auth';
import { diagramService } from '@/lib/services';
import { handleApiError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await authenticateApiKey(req);
    const body = await req.json();
    const validatedData = CreateDiagramRequestSchema.parse(body);

    const diagram = await diagramService.createDiagram({
      orgId: authContext.organizationId,
      userId: authContext.userId,
      name: validatedData.name,
      document: validatedData.document,
    });

    return NextResponse.json({ data: diagram }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 3. Domain Service Layer Pattern

In `packages/diagram-core/src/services/diagramService.ts`:
- Business logic lives in domain services, shared between the Next.js web application and background workers.

```ts
export class DiagramService {
  constructor(private readonly diagramRepo: DiagramRepository) {}

  async createDiagram(params: CreateDiagramParams): Promise<DiagramRecord> {
    // 1. Validate canonical document integrity
    validateDiagramDocument(params.document);

    // 2. Persist canonical document into PostgreSQL JSONB column
    return await this.diagramRepo.insert({
      organizationId: params.orgId,
      createdBy: params.userId,
      name: params.name,
      documentJson: params.document,
      schemaVersion: params.document.schemaVersion,
      rendererVersion: '1.0.0',
    });
  }
}
```

---

## 4. Drizzle ORM Schema & JSONB Persistence

In `packages/db/src/schema/diagrams.ts`:
- Store canonical diagram document directly in `jsonb('document_json')`. Do not normalize individual visual coordinates into separate SQL tables.

```ts
import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';
import type { DiagramDocument } from '@platform/diagram-schema';

export const diagrams = pgTable('diagrams', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id'),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  documentJson: jsonb('document_json').$type<DiagramDocument>().notNull(),
  schemaVersion: text('schema_version').notNull().default('1.0'),
  rendererVersion: text('renderer_version').notNull().default('1.0.0'),
  thumbnailUrl: text('thumbnail_url'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 5. Structured Error Response Format

In `apps/web/lib/errors.ts`:
- Every failure returns consistent JSON errors with structured codes and paths:

```ts
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload failed schema validation.',
          details: err.errors.map((e) => ({
            path: e.path,
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Handle Authentication, Authorization, Not Found, Rate Limited, etc.
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal server error occurred.',
      },
    },
    { status: 500 }
  );
}
```
