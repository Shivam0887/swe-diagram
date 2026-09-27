#!/usr/bin/env npx tsx
/**
 * Create Pre-Registered OAuth Client Script
 *
 * Usage:
 *   npx tsx packages/db/scripts/create-oauth-client.ts --name="My Agent" [options]
 *
 * Options:
 *   --name="Cursor Agent"             (required) Client name
 *   --tier=free|pro|enterprise        (optional, default: free)
 *   --type=confidential|public        (optional, default: confidential)
 *   --redirect="http://localhost:3000/callback" (optional, comma-separated for multiple)
 *   --scopes="diagrams:read,diagrams:write"     (optional)
 *
 * Examples:
 *   npx tsx packages/db/scripts/create-oauth-client.ts --name="Claude Desktop" --tier=pro --type=public --redirect="http://localhost:3000/oauth/callback"
 *   npx tsx packages/db/scripts/create-oauth-client.ts --name="Headless Worker" --tier=enterprise --type=confidential
 */

import { MongoClient } from 'mongodb';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

function loadEnv(): void {
  const envPaths = [
    path.resolve(__dirname, '../../../.env.local'),
    path.resolve(__dirname, '../../../.env'),
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
type ClientType = 'confidential' | 'public';

function parseArgs(): {
  name: string;
  tier: Tier;
  type: ClientType;
  redirectUris: string[];
  scopes: string[];
} {
  const args = process.argv.slice(2);
  let name = '';
  let tier: Tier = 'free';
  let type: ClientType = 'confidential';
  let redirectUris: string[] = [];
  let scopes = ['diagrams:read', 'diagrams:write'];

  for (const arg of args) {
    if (arg.startsWith('--name=')) {
      name = arg.slice(7).replace(/^["']|["']$/g, '').trim();
    } else if (arg.startsWith('--tier=')) {
      const val = arg.slice(7).trim() as Tier;
      if (['free', 'pro', 'enterprise'].includes(val)) {
        tier = val;
      }
    } else if (arg.startsWith('--type=')) {
      const val = arg.slice(7).trim() as ClientType;
      if (['confidential', 'public'].includes(val)) {
        type = val;
      }
    } else if (arg.startsWith('--redirect=')) {
      redirectUris = arg
        .slice(11)
        .replace(/^["']|["']$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--scopes=')) {
      scopes = arg
        .slice(9)
        .replace(/^["']|["']$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (!arg.startsWith('--') && !name) {
      name = arg.trim();
    }
  }

  if (!name) {
    console.error('❌ Missing required client name.');
    console.error('Usage: npx tsx packages/db/scripts/create-oauth-client.ts --name="Client Name" [--tier=pro] [--type=confidential|public] [--redirect="http://..."]');
    process.exit(1);
  }

  return { name, tier, type, redirectUris, scopes };
}

function generateClientId(): string {
  return `client_${crypto.randomBytes(12).toString('hex')}`;
}

function generateClientSecret(): string {
  return `sec_${crypto.randomBytes(24).toString('hex')}`;
}

async function main() {
  const { name, tier, type, redirectUris, scopes } = parseArgs();
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    await db.collection('oauth_clients').createIndex({ clientId: 1 }, { unique: true });
    await db.collection('oauth_clients').createIndex({ isActive: 1 });
    await db.collection('oauth_auth_codes').createIndex({ code: 1 }, { unique: true });
    await db.collection('oauth_auth_codes').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    const clientId = generateClientId();
    let clientSecret: string | undefined;
    let clientSecretHash: string | undefined;

    if (type === 'confidential') {
      clientSecret = generateClientSecret();
      clientSecretHash = await argon2.hash(clientSecret);
    }

    const limits = TIER_LIMITS[tier];
    const now = new Date().toISOString();

    const record = {
      id: `oauth_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      clientId,
      name,
      clientSecretHash,
      clientType: type,
      redirectUris,
      tier,
      scopes,
      rateLimitRequests: limits.requests,
      rateLimitWindowMs: limits.windowMs,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('oauth_clients').insertOne(record);

    console.log('\n✅ Pre-Registered OAuth Client Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(` Client ID:     ${clientId}`);
    if (clientSecret) {
      console.log(` Client Secret: ${clientSecret}`);
    }
    console.log(` Name:          ${name}`);
    console.log(` Type:          ${type}`);
    console.log(` Tier:          ${tier}`);
    console.log(` Redirect URIs: ${redirectUris.length > 0 ? redirectUris.join(', ') : '(None)'}`);
    console.log(` Scopes:        ${scopes.join(', ')}`);
    console.log(` Rate Limit:    ${limits.requests} req / ${limits.windowMs / 1000}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (clientSecret) {
      console.log('\n⚠️  SAVE THIS SECRET NOW - it is hashed and cannot be retrieved again!\n');
      console.log('Client Credentials Token Request (Machine-to-Machine):');
      console.log('  curl -X POST http://localhost:3000/api/v1/oauth/token \\');
      console.log('    -H "Content-Type: application/x-www-form-urlencoded" \\');
      console.log(`    -d "grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}"\n`);
    } else {
      console.log('\nPublic client created for PKCE Authorization Code flow.');
      console.log(`Authorize URL:`);
      console.log(`  http://localhost:3000/api/v1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=<URI>&code_challenge=<CHALLENGE>&code_challenge_method=S256\n`);
    }
  } catch (err) {
    console.error('❌ Failed to create OAuth client:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
