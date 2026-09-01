import { getDb } from '../mongo';
import type {
  ProjectRecord,
  CreateProjectDto,
  UpdateProjectDto,
} from '../types';

const COLLECTION = 'projects';

function newId(): string {
  // Same shape the in-memory diagram repo used, so old log lines stay
  // greppable: `prj_` prefix instead of `diag_`.
  return `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export class ProjectRepository {
  async listAll(): Promise<ProjectRecord[]> {
    const db = await getDb();
    return db
      .collection<ProjectRecord>(COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async findById(id: string): Promise<ProjectRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<ProjectRecord>(COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async create(dto: CreateProjectDto): Promise<ProjectRecord> {
    const db = await getDb();
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      id: newId(),
      name: dto.name,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection<ProjectRecord>(COLLECTION).insertOne(record);
    return record;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectRecord | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    const $set = stripUndefined({ ...dto, updatedAt: now });
    const result = await db
      .collection<ProjectRecord>(COLLECTION)
      .findOneAndUpdate(
        { id },
        { $set },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection<ProjectRecord>(COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export const projectRepository = new ProjectRepository();
