import { argon2Verify, argon2id } from 'hash-wasm';
import * as crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

// OWASP minimum baselines
const OWASP_MIN_MEMORY_KIB = 19456; // ~19 MiB
const OWASP_MIN_ITERATIONS = 2;
const OWASP_MIN_PARALLELISM = 1;

export interface Argon2Params {
  version: number;
  memorySize: number; // in KiB
  iterations: number;
  parallelism: number;
  salt: string; // base64
  hash: string; // base64
}

/**
 * Parses standard PHC string:
 * $argon2id$v=19$m=65536,t=3,p=1$<salt_b64>$<hash_b64>
 */
export function parseArgon2Phc(phc: string): Argon2Params | null {
  if (!phc || typeof phc !== 'string') return null;
  const parts = phc.trim().split('$');
  // Format: ['', 'argon2id', 'v=19', 'm=65536,t=3,p=1', 'salt', 'hash']
  if (parts.length !== 6 || parts[1] !== 'argon2id') {
    return null;
  }

  const versionMatch = parts[2].match(/^v=(\d+)$/);
  if (!versionMatch) return null;
  const version = parseInt(versionMatch[1], 10);

  const paramParts = parts[3].split(',');
  let memorySize = 0;
  let iterations = 0;
  let parallelism = 0;

  for (const p of paramParts) {
    const [k, v] = p.split('=');
    const num = parseInt(v, 10);
    if (k === 'm') memorySize = num;
    if (k === 't') iterations = num;
    if (k === 'p') parallelism = num;
  }

  if (!memorySize || !iterations || !parallelism) return null;
  const salt = parts[4];
  const hash = parts[5];

  if (!salt || !hash) return null;

  return {
    version,
    memorySize,
    iterations,
    parallelism,
    salt,
    hash,
  };
}

/**
 * Validates that parameters meet or exceed the OWASP baseline.
 */
export function validateArgon2SecurityFloor(params: Argon2Params): boolean {
  return (
    params.memorySize >= OWASP_MIN_MEMORY_KIB &&
    params.iterations >= OWASP_MIN_ITERATIONS &&
    params.parallelism >= OWASP_MIN_PARALLELISM
  );
}

// Cached admin hash configuration
let cachedConfigHash: string | null = null;
let cachedPwv: string | null = null;
let isConfigValid = false;

export function getAdminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

export function isSecurityConfigured(): boolean {
  const hash = getAdminPasswordHash();
  if (!hash) return false;

  if (hash === cachedConfigHash && isConfigValid) {
    return true;
  }

  const parsed = parseArgon2Phc(hash);
  if (!parsed) {
    isConfigValid = false;
    return false;
  }

  if (!validateArgon2SecurityFloor(parsed)) {
    isConfigValid = false;
    return false;
  }

  cachedConfigHash = hash;
  cachedPwv = crypto.createHash('sha256').update(hash).digest('hex').slice(0, 16);
  isConfigValid = true;
  return true;
}

/**
 * Derives password version string (pwv).
 * When ADMIN_PASSWORD_HASH changes, pwv changes immediately,
 * invalidating all active JWT sessions.
 */
export function getPasswordVersion(): string {
  if (!isSecurityConfigured() || !cachedPwv) {
    const hash = getAdminPasswordHash() || 'default';
    return crypto.createHash('sha256').update(hash).digest('hex').slice(0, 16);
  }
  return cachedPwv;
}

/**
 * Verifies password against configured ADMIN_PASSWORD_HASH using Argon2id.
 * If server is not properly configured, fails closed (returns false).
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!isSecurityConfigured()) {
    return false;
  }
  const hash = getAdminPasswordHash()!;
  try {
    return await argon2Verify({
      password,
      hash,
    });
  } catch (err) {
    console.error('Argon2 verify error:', err);
    return false;
  }
}

/**
 * Generates Argon2id PHC string with OWASP recommended production parameters.
 */
export async function generateArgon2idHash(
  password: string,
  options: { memorySize?: number; iterations?: number; parallelism?: number } = {}
): Promise<string> {
  const memorySize = options.memorySize ?? 65536; // 64 MiB
  const iterations = options.iterations ?? 3;
  const parallelism = options.parallelism ?? 1;

  const saltBytes = crypto.randomBytes(16);

  return await argon2id({
    password,
    salt: saltBytes,
    iterations,
    memorySize,
    parallelism,
    hashLength: 32,
    outputType: 'encoded',
  });
}

// ----------------------------------------------------
// JWT Sessions via jose
// ----------------------------------------------------

let sessionSecretKey: Uint8Array | null = null;

export function resetSessionSecretKey(): void {
  sessionSecretKey = null;
}

export function getSessionSecretKey(): Uint8Array {
  if (sessionSecretKey) return sessionSecretKey;

  const rawSecret = process.env.SESSION_SECRET?.trim();
  if (rawSecret && rawSecret.length >= 32) {
    sessionSecretKey = new Uint8Array(new TextEncoder().encode(rawSecret));
    return sessionSecretKey;
  }

  // Fallback for dev/test: deterministic 32-byte or crypto random
  if (process.env.NODE_ENV === 'production' && !rawSecret) {
    throw new Error('SESSION_SECRET environment variable must be at least 32 characters long in production');
  }

  // Ephemeral secret for current server run
  const rand = crypto.randomBytes(32);
  sessionSecretKey = new Uint8Array(rand.buffer, rand.byteOffset, rand.byteLength);
  return sessionSecretKey;
}

export interface SessionClaims {
  jti: string;
  pwv: string;
  sub: string;
  exp: number;
}

/**
 * Signs session JWT with 4-hour max lifespan, HS256, jti, and pwv claims.
 */
export async function createSessionToken(jti = crypto.randomUUID()): Promise<{ token: string; jti: string; expiresIn: number }> {
  const secretKey = getSessionSecretKey();
  const pwv = getPasswordVersion();
  const expiresIn = 4 * 60 * 60; // 4 hours in seconds

  const token = await new SignJWT({ pwv })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuer('adultvpn-admin')
    .setAudience('adultvpn-admin')
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(secretKey);

  return { token, jti, expiresIn };
}

/**
 * Validates session JWT:
 * - Alg strictly HS256
 * - Issuer and Audience
 * - Expiration
 * - Password version (pwv) match
 */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const secretKey = getSessionSecretKey();
    const currentPwv = getPasswordVersion();

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      issuer: 'adultvpn-admin',
      audience: 'adultvpn-admin',
    });

    if (!payload.jti || typeof payload.jti !== 'string') return null;
    if (payload.pwv !== currentPwv) {
      // Password changed since token issue, token invalid!
      return null;
    }

    return {
      jti: payload.jti,
      pwv: payload.pwv as string,
      sub: payload.sub as string,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}
