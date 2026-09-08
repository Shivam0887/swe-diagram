import { MongoClient, type Db } from 'mongodb';

/**
 * Global-cached Mongo client. Survives hot-reload in dev and the warm
 * function lifecycle in serverless prod, so we don't open a new TCP
 * connection on every request.
 *
 * Mongoose is not used; the native driver is enough and stays out of the
 * way. All queries go through the repository classes which own their
 * collection handles.
 *
 * Runtime: this module imports `net` (transitively via mongodb) so any
 * route that imports it must run in the Node.js runtime, not Edge.
 */
type Cached = { client: MongoClient | null; promise: Promise<MongoClient> | null };

const globalForMongo = globalThis as unknown as { __mongoCache?: Cached };
const cache: Cached = globalForMongo.__mongoCache ?? (globalForMongo.__mongoCache = {
  client: null,
  promise: null,
});

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local (e.g. mongodb://localhost:27017).'
    );
  }
  return uri;
}

function getDbName(): string {
  return process.env.MONGODB_DB ?? 'agentic_diagrams';
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  if (!cache.promise) {
    cache.promise = new MongoClient(getUri(), {
      // Reasonable defaults for a Next.js server. Tighten in prod.
      maxPoolSize: 20,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }
  try {
    cache.client = await cache.promise;
  } catch (err) {
    // Reset the promise so a future call can retry instead of returning a
    // permanently rejected one.
    cache.promise = null;
    throw err;
  }
  return cache.client;
}

let indexesEnsured = false;

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  
  if (!indexesEnsured) {
    await ensureIndexes(db);
    indexesEnsured = true;
  }
  
  return db;
}

/**
 * Convenience for repositories: ensure the indexes they need exist. Safe to
 * call on every cold start — Mongo no-ops if the index is already there.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  await db.collection('projects').createIndex({ updatedAt: -1 });
  await db.collection('diagrams').createIndex({ projectId: 1, updatedAt: -1 });
  await db.collection('diagrams').createIndex({ updatedAt: -1 });
  await db.collection('api_keys').createIndex({ keyPrefix: 1 }, { unique: true });
  await db.collection('api_keys').createIndex({ isActive: 1 });
  await db.collection('api_keys').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
