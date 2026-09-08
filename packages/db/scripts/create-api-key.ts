#!/usr/bin/env npx tsx
/**
 * Create API Key Script
 * 
 * Usage:
 *   npx tsx packages/db/scripts/create-api-key.ts "Key Name" [free|pro|enterprise]
 * 
 * Example:
 *   npx tsx packages/db/scripts/create-api-key.ts "My MCP Client" pro
 */

import { MongoClient } from 'mongodb';
import argon2 from 'argon2';
import fs from 'fs';
import path from 'path';

function loadEnv(): void {
  const envPaths = [
    path.resolve('../../../.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          const value = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || 'agentic_diagrams';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local or .env');
  process.exit(1);
}

const TIER_LIMITS = {
  free: { requests: 30, windowMs: 60000 },
  pro: { requests: 120, windowMs: 60000 },
  enterprise: { requests: 600, windowMs: 60000 },
} as const;

type Tier = keyof typeof TIER_LIMITS;

function generateKeyId(): string {
  return `key_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function generatePrefix(): string {
  return `dgr_${Math.random().toString(36).slice(2, 10)}`;
}

function generateSecret(): string {
  return Math.random().toString(36).slice(2, 20);
}

async function createApiKey(name: string, tier: Tier = 'free') {
  if (!TIER_LIMITS[tier]) {
    console.error(`❌ Invalid tier: ${tier}. Must be one of: free, pro, enterprise`);
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    await db.collection('api_keys').createIndex({ keyPrefix: 1 }, { unique: true });
    await db.collection('api_keys').createIndex({ isActive: 1 });
    await db.collection('api_keys').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    const prefix = generatePrefix();
    const secret = generateSecret();
    const fullKey = `${prefix}_${secret}`;
    
    // Hash with argon2 (same as verification)
    const keyHash = await argon2.hash(secret);
    
    const limits = TIER_LIMITS[tier];
    const now = new Date().toISOString();
    
    const record = {
      id: generateKeyId(),
      name,
      keyHash,
      keyPrefix: prefix,
      tier,
      scopes: ['diagrams:read', 'diagrams:write'],
      rateLimitRequests: limits.requests,
      rateLimitWindowMs: limits.windowMs,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection('api_keys').insertOne(record);
    
    console.log('\n✅ API Key created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(` Full Key: ${fullKey}`);
    console.log(` Name:     ${name}`);
    console.log(` Tier:     ${tier}`);
    console.log(` Rate:     ${limits.requests} req / ${limits.windowMs / 1000}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Save this key now - it cannot be retrieved again!\n');
    console.log('Usage in Claude:');
    console.log(`  Authorization: Bearer ${fullKey}\n`);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      console.error('❌ Key prefix collision (extremely rare). Please retry.');
    } else {
      console.error('❌ Failed to create API key:', error);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

const [,, name, tierArg] = process.argv;

if (!name) {
  console.error('Usage: npx tsx packages/db/scripts/create-api-key.ts "Key Name" [free|pro|enterprise]');
  process.exit(1);
}

const tier = (tierArg as Tier) || 'free';

createApiKey(name, tier);