import type { DiagramDocument } from '@platform/diagram-schema';
import { getDb } from '../mongo';
import type {
  DiagramRecord,
  DiagramVersionRecord,
  CreateDiagramDto,
  UpdateDiagramDto,
} from '../types';

const COLLECTION = 'diagrams';
const VERSIONS = 'diagram_versions';

function newId(): string {
  return `diag_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export class DiagramRepository {
  async listAll(): Promise<DiagramRecord[]> {
    const db = await getDb();
    return db
      .collection<DiagramRecord>(COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async listByProject(projectId: string): Promise<DiagramRecord[]> {
    const db = await getDb();
    return db
      .collection<DiagramRecord>(COLLECTION)
      .find({ projectId }, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async findById(id: string): Promise<DiagramRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<DiagramRecord>(COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async create(dto: CreateDiagramDto): Promise<DiagramRecord> {
    const db = await getDb();
    const now = new Date().toISOString();
    const record: DiagramRecord = {
      id: newId(),
      projectId: dto.projectId,
      name: dto.name,
      description: dto.description,
      document: dto.document,
      schemaVersion: dto.document.schemaVersion ?? '1.0',
      rendererVersion: dto.document.rendererVersion ?? '1.0.0',
      createdAt: now,
      updatedAt: now,
    };
    await db.collection<DiagramRecord>(COLLECTION).insertOne(record);
    await this.createVersion(record.id, record.document, 1);
    return record;
  }

  async update(id: string, dto: UpdateDiagramDto): Promise<DiagramRecord | null> {
    const db = await getDb();
    const now = new Date().toISOString();

    // If the document is being updated, recompute the schema/renderer
    // versions off the new doc. Otherwise leave the existing ones alone.
    const existing = await this.findById(id);
    if (!existing) return null;
    const updatedDoc = dto.document ?? existing.document;

    const $set = stripUndefined({
      name: dto.name,
      description: dto.description,
      document: dto.document ? updatedDoc : undefined,
      schemaVersion: dto.document ? (updatedDoc.schemaVersion ?? existing.schemaVersion) : undefined,
      rendererVersion: dto.document ? (updatedDoc.rendererVersion ?? existing.rendererVersion) : undefined,
      updatedAt: now,
    });

    const result = await db
      .collection<DiagramRecord>(COLLECTION)
      .findOneAndUpdate(
        { id },
        { $set },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    if (!result) return null;

    if (dto.document) {
      const count = await db
        .collection<DiagramVersionRecord>(VERSIONS)
        .countDocuments({ diagramId: id });
      await this.createVersion(id, dto.document, count + 1);
    }

    return result;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection<DiagramRecord>(COLLECTION).deleteOne({ id });
    if (result.deletedCount === 1) {
      await db.collection<DiagramVersionRecord>(VERSIONS).deleteMany({ diagramId: id });
      return true;
    }
    return false;
  }

  async deleteByProject(projectId: string): Promise<number> {
    const db = await getDb();
    const diagrams = await db
      .collection<DiagramRecord>(COLLECTION)
      .find({ projectId }, { projection: { id: 1 } })
      .toArray();
    const ids = diagrams.map((d) => d.id);
    if (ids.length === 0) return 0;
    await db
      .collection<DiagramVersionRecord>(VERSIONS)
      .deleteMany({ diagramId: { $in: ids } });
    const result = await db
      .collection<DiagramRecord>(COLLECTION)
      .deleteMany({ projectId });
    return result.deletedCount ?? 0;
  }

  async listVersions(diagramId: string): Promise<DiagramVersionRecord[]> {
    const db = await getDb();
    return db
      .collection<DiagramVersionRecord>(VERSIONS)
      .find({ diagramId }, { projection: { _id: 0 } })
      .sort({ versionNumber: -1 })
      .toArray();
  }

  private async createVersion(
    diagramId: string,
    doc: DiagramDocument,
    versionNumber: number
  ): Promise<void> {
    const db = await getDb();
    const record: DiagramVersionRecord = {
      id: `ver_${Date.now().toString(36)}_${versionNumber}`,
      diagramId,
      versionNumber,
      document: doc,
      createdAt: new Date().toISOString(),
    };
    await db.collection<DiagramVersionRecord>(VERSIONS).insertOne(record);
  }
}

export const diagramRepository = new DiagramRepository();
