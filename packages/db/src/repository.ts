import type { DiagramDocument } from '@platform/diagram-schema';
import { sampleDiagrams } from '@platform/diagram-schema';
import type { DiagramRecord, DiagramVersionRecord, CreateDiagramDto, UpdateDiagramDto } from './types';

export class DiagramRepository {
  private diagrams: Map<string, DiagramRecord> = new Map();
  private versions: Map<string, DiagramVersionRecord[]> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const microDoc = sampleDiagrams['microservices-ecommerce'];
    if (microDoc) {
      const id = 'diag_microservices_demo';
      const record: DiagramRecord = {
        id,
        name: 'E-Commerce Microservices Architecture',
        description: 'ByteByteGo-style production architecture with API Gateway, Services, Postgres, Redis, and Kafka',
        document: microDoc,
        schemaVersion: microDoc.schemaVersion,
        rendererVersion: microDoc.rendererVersion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.diagrams.set(id, record);
    }

    const cacheDoc = sampleDiagrams['caching-rate-limiter'];
    if (cacheDoc) {
      const id = 'diag_caching_rate_limiter';
      const record: DiagramRecord = {
        id,
        name: 'High-Throughput Rate Limiting & Distributed Cache',
        description: 'Redis token bucket rate limiter with multi-tier cache architecture',
        document: cacheDoc,
        schemaVersion: cacheDoc.schemaVersion,
        rendererVersion: cacheDoc.rendererVersion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.diagrams.set(id, record);
    }
  }

  async listAll(): Promise<DiagramRecord[]> {
    return Array.from(this.diagrams.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async findById(id: string): Promise<DiagramRecord | null> {
    return this.diagrams.get(id) ?? null;
  }

  async create(dto: CreateDiagramDto): Promise<DiagramRecord> {
    const id = `diag_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: DiagramRecord = {
      id,
      name: dto.name,
      description: dto.description,
      document: dto.document,
      schemaVersion: dto.document.schemaVersion ?? '1.0',
      rendererVersion: dto.document.rendererVersion ?? '1.0.0',
      createdAt: now,
      updatedAt: now,
    };

    this.diagrams.set(id, record);
    this.createVersion(id, dto.document, 1);
    return record;
  }

  async update(id: string, dto: UpdateDiagramDto): Promise<DiagramRecord | null> {
    const existing = this.diagrams.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedDoc = dto.document ?? existing.document;

    const updated: DiagramRecord = {
      ...existing,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      document: updatedDoc,
      schemaVersion: updatedDoc.schemaVersion ?? existing.schemaVersion,
      rendererVersion: updatedDoc.rendererVersion ?? existing.rendererVersion,
      updatedAt: now,
    };

    this.diagrams.set(id, updated);

    if (dto.document) {
      const existingVersions = this.versions.get(id) ?? [];
      this.createVersion(id, dto.document, existingVersions.length + 1);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.diagrams.delete(id);
    this.versions.delete(id);
    return existed;
  }

  async listVersions(diagramId: string): Promise<DiagramVersionRecord[]> {
    return this.versions.get(diagramId) ?? [];
  }

  private createVersion(diagramId: string, doc: DiagramDocument, versionNumber: number): void {
    const list = this.versions.get(diagramId) ?? [];
    const versionRecord: DiagramVersionRecord = {
      id: `ver_${Date.now().toString(36)}_${versionNumber}`,
      diagramId,
      versionNumber,
      document: doc,
      createdAt: new Date().toISOString(),
    };
    list.push(versionRecord);
    this.versions.set(diagramId, list);
  }
}

export const diagramRepository = new DiagramRepository();
