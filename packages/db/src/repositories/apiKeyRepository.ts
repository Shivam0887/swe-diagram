import { getDb } from '../mongo';
import type {
  ApiKeyRecord,
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiKeyValidationResult,
} from '../types';

const COLLECTION = 'api_keys';

function newId(): string {
  return `key_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export class ApiKeyRepository {
  async findById(id: string): Promise<ApiKeyRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<ApiKeyRecord>(COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async findByPrefix(prefix: string): Promise<ApiKeyRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<ApiKeyRecord>(COLLECTION)
      .findOne({ keyPrefix: prefix }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async create(dto: CreateApiKeyDto, keyHash: string, keyPrefix: string): Promise<ApiKeyRecord> {
    const db = await getDb();
    const now = new Date().toISOString();
    const tier = dto.tier ?? 'free';
    const rateLimitMap: Record<typeof tier, { requests: number; windowMs: number }> = {
      free: { requests: 30, windowMs: 60000 },
      pro: { requests: 120, windowMs: 60000 },
      enterprise: { requests: 600, windowMs: 60000 },
    };
    const limits = rateLimitMap[tier];

    const record: ApiKeyRecord = {
      id: newId(),
      name: dto.name,
      keyHash,
      keyPrefix,
      tier,
      scopes: dto.scopes ?? ['diagrams:read', 'diagrams:write'],
      rateLimitRequests: dto.rateLimitRequests ?? limits.requests,
      rateLimitWindowMs: dto.rateLimitWindowMs ?? limits.windowMs,
      expiresAt: dto.expiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection<ApiKeyRecord>(COLLECTION).insertOne(record);
    return record;
  }

  async update(id: string, dto: UpdateApiKeyDto): Promise<ApiKeyRecord | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    const $set = stripUndefined({ ...dto, updatedAt: now });
    const result = await db
      .collection<ApiKeyRecord>(COLLECTION)
      .findOneAndUpdate(
        { id },
        { $set },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection<ApiKeyRecord>(COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }

  async validateAndTouch(keyPrefix: string, keyHash: string): Promise<ApiKeyValidationResult | null> {
    const db = await getDb();
    const record = await db
      .collection<ApiKeyRecord>(COLLECTION)
      .findOne({ keyPrefix, isActive: true }, { projection: { _id: 0 } });
    
    if (!record) return null;
    if (record.keyHash !== keyHash) return null;
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) return null;

    await db.collection<ApiKeyRecord>(COLLECTION).updateOne(
      { id: record.id },
      { $set: { lastUsedAt: new Date().toISOString() } }
    );

    return {
      apiKeyId: record.id,
      tier: record.tier,
      rateLimitRequests: record.rateLimitRequests,
      rateLimitWindowMs: record.rateLimitWindowMs,
    };
  }
}

export const apiKeyRepository = new ApiKeyRepository();