import type { DiagramDocument } from '@platform/diagram-schema';

/**
 * A Project groups one or more diagrams. Single-tenant today (no ownerId);
 * the field is reserved so we don't have to migrate later when auth lands.
 */
export type ProjectRecord = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectDto = {
  name: string;
  description?: string;
};

export type UpdateProjectDto = {
  name?: string;
  description?: string;
};

export type DiagramRecord = {
  id: string;
  /** Foreign key into the `projects` collection. */
  projectId: string;
  name: string;
  description?: string;
  document: DiagramDocument;
  schemaVersion: string;
  rendererVersion: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type DiagramVersionRecord = {
  id: string;
  diagramId: string;
  versionNumber: number;
  document: DiagramDocument;
  createdAt: string;
};

export type CreateDiagramDto = {
  projectId: string;
  name: string;
  description?: string;
  document: DiagramDocument;
};

export type UpdateDiagramDto = {
  name?: string;
  description?: string;
  document?: DiagramDocument;
};

export type ApiKeyTier = 'free' | 'pro' | 'enterprise';

export type ApiKeyRecord = {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  tier: ApiKeyTier;
  scopes: string[];
  rateLimitRequests: number;
  rateLimitWindowMs: number;
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateApiKeyDto = {
  name: string;
  tier?: ApiKeyTier;
  scopes?: string[];
  rateLimitRequests?: number;
  rateLimitWindowMs?: number;
  expiresAt?: string;
};

export type UpdateApiKeyDto = {
  name?: string;
  tier?: ApiKeyTier;
  scopes?: string[];
  rateLimitRequests?: number;
  rateLimitWindowMs?: number;
  expiresAt?: string;
  isActive?: boolean;
  lastUsedAt?: string;
};

export type ApiKeyValidationResult = {
  apiKeyId: string;
  tier: ApiKeyTier;
  rateLimitRequests: number;
  rateLimitWindowMs: number;
};
