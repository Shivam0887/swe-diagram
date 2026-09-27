import { getDb } from '../mongo';
import type {
  OAuthClientRecord,
  CreateOAuthClientDto,
  OAuthAuthorizationCodeRecord,
} from '../types';

const CLIENTS_COLLECTION = 'oauth_clients';
const CODES_COLLECTION = 'oauth_auth_codes';

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export class OAuthClientRepository {
  async findById(id: string): Promise<OAuthClientRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<OAuthClientRecord>(CLIENTS_COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async findByClientId(clientId: string): Promise<OAuthClientRecord | null> {
    const db = await getDb();
    const doc = await db
      .collection<OAuthClientRecord>(CLIENTS_COLLECTION)
      .findOne({ clientId }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async create(
    dto: CreateOAuthClientDto,
    clientId: string,
    clientSecretHash?: string
  ): Promise<OAuthClientRecord> {
    const db = await getDb();
    const now = new Date().toISOString();
    const tier = dto.tier ?? 'free';
    const rateLimitMap: Record<typeof tier, { requests: number; windowMs: number }> = {
      free: { requests: 30, windowMs: 60000 },
      pro: { requests: 120, windowMs: 60000 },
      enterprise: { requests: 600, windowMs: 60000 },
    };
    const limits = rateLimitMap[tier];

    const record: OAuthClientRecord = {
      id: newId('client'),
      clientId,
      name: dto.name,
      clientSecretHash,
      clientType: dto.clientType ?? 'confidential',
      redirectUris: dto.redirectUris ?? [],
      tier,
      scopes: dto.scopes ?? ['diagrams:read', 'diagrams:write'],
      rateLimitRequests: dto.rateLimitRequests ?? limits.requests,
      rateLimitWindowMs: dto.rateLimitWindowMs ?? limits.windowMs,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<OAuthClientRecord>(CLIENTS_COLLECTION).insertOne(record);
    return record;
  }

  async update(id: string, dto: Partial<OAuthClientRecord>): Promise<OAuthClientRecord | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    const $set = stripUndefined({ ...dto, updatedAt: now });
    const result = await db
      .collection<OAuthClientRecord>(CLIENTS_COLLECTION)
      .findOneAndUpdate(
        { id },
        { $set },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection<OAuthClientRecord>(CLIENTS_COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }

  async createAuthCode(record: OAuthAuthorizationCodeRecord): Promise<void> {
    const db = await getDb();
    await db.collection<OAuthAuthorizationCodeRecord>(CODES_COLLECTION).insertOne(record);
  }

  async consumeAuthCode(code: string): Promise<OAuthAuthorizationCodeRecord | null> {
    const db = await getDb();
    // Atomically find and delete to prevent replay attacks
    const result = await db
      .collection<OAuthAuthorizationCodeRecord>(CODES_COLLECTION)
      .findOneAndDelete({ code }, { projection: { _id: 0 } });
    return result ?? null;
  }
}

export const oauthClientRepository = new OAuthClientRepository();
