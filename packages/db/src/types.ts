import type { DiagramDocument } from '@platform/diagram-schema';

export type DiagramRecord = {
  id: string;
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
  name: string;
  description?: string;
  document: DiagramDocument;
};

export type UpdateDiagramDto = {
  name?: string;
  description?: string;
  document?: DiagramDocument;
};
