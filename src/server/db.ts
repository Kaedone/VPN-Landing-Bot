import pg from 'pg';
import crypto from 'crypto';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';
import { SiteSettings } from '../types/vpn';

const { Pool } = pg;

export interface RateLimitReservation {
  attempts: number;
  lockedUntil: Date | null;
  isBlocked: boolean;
  retryAfterSeconds: number;
}

export interface SessionInfo {
  jti: string;
  csrfSecret: string;
  pwv: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
  revokedAt: number | null;
}

export interface AuditLogEntry {
  id: number;
  ts: number;
  ip: string;
  userAgent: string | null;
  attemptNo: number | null;
  status: 'FAILED' | 'LOCKED' | 'SUCCESS' | 'LOGOUT' | 'REVOKE_ALL' | 'SETTINGS' | 'REAUTH_FAILED' | 'CONFIG';
  detail: string | null;
}

export interface SettingsHistoryEntry {
  id: number;
  version: number;
  data: SiteSettings;
  savedAt: number;
}

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const MAX_ACTIVE_SESSIONS = 3;
const MAX_HISTORY_ENTRIES = 20;

/**
 * Database Engine supporting persistent PostgreSQL operations with seamless
 * in-memory fallback for local development or isolated testing environments.
 */
export class DatabaseEngine {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;
  private initPromise: Promise<void> | null = null;

  // In-memory backing stores (for fallback and fast tests)
  private memRateLimits = new Map<string, { attempts: number; lockedUntil: number | null; updatedAt: number }>();
  private memSessions = new Map<string, SessionInfo>();
  private memAuditLogs: AuditLogEntry[] = [];
  private memSettingsVersion = 1;
  private memSettingsData: SiteSettings = { ...DEFAULT_SETTINGS };
  private memSettingsHistory: SettingsHistoryEntry[] = [];

  constructor() {
    this.setupPostgres();
  }

  private isConfiguredDbUrl(urlStr: string | null | undefined): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (!trimmed) return false;

    const lower = trimmed.toLowerCase();
    if (
      lower.includes('@hostname') ||
      lower.includes('://username:password@') ||
      lower.includes('://user:password@') ||
      lower.includes('example.com') ||
      lower.includes('placeholder') ||
      lower.includes('your-database') ||
      lower.includes('<') ||
      lower.includes('>')
    ) {
      return false;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
        return false;
      }
      if (
        !parsed.hostname ||
        parsed.hostname === 'hostname' ||
        parsed.hostname === 'localhost.invalid' ||
        parsed.hostname.includes('example') ||
        parsed.hostname.includes('placeholder')
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private setupPostgres() {
    const rawConnectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      (process.env.SQL_HOST
        ? `postgresql://${process.env.SQL_USER || 'postgres'}:${process.env.SQL_PASSWORD || ''}@${process.env.SQL_HOST}:${process.env.SQL_PORT || 5432}/${process.env.SQL_DB_NAME || 'adultvpn'}`
        : null);

    if (this.isConfiguredDbUrl(rawConnectionString)) {
      try {
        this.pool = new Pool({
          connectionString: rawConnectionString!,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: rawConnectionString!.includes('localhost') ? false : { rejectUnauthorized: false },
        });

        this.initPromise = this.initSchema()
          .then(() => {
            this.isPostgresConnected = true;
          })
          .catch(() => {
            // Silently fall back to built-in in-memory store if remote db is temporarily unreachable
            this.isPostgresConnected = false;
          });
      } catch {
        this.isPostgresConnected = false;
      }
    } else {
      this.isPostgresConnected = false;
    }
  }

  public async initSchema(): Promise<void> {
    if (!this.pool) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Settings Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          version integer NOT NULL DEFAULT 1,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        );
      `);

      // Seed default settings if empty
      await client.query(
        `
        INSERT INTO site_settings (id, version, data, updated_at)
        VALUES (1, 1, $1::jsonb, now())
        ON CONFLICT (id) DO NOTHING;
      `,
        [JSON.stringify(DEFAULT_SETTINGS)],
      );

      // 2. Settings History Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS site_settings_history (
          id serial PRIMARY KEY,
          version integer NOT NULL,
          data jsonb NOT NULL,
          saved_at timestamptz NOT NULL DEFAULT now()
        );
      `);

      // 3. Admin Sessions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
          jti text PRIMARY KEY,
          csrf_secret text NOT NULL,
          pwv text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          last_seen_at timestamptz NOT NULL DEFAULT now(),
          expires_at timestamptz NOT NULL,
          revoked_at timestamptz
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON admin_sessions (expires_at);
      `);

      // 4. Rate Limiting Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_rate_limit (
          ip_key text PRIMARY KEY,
          attempts integer NOT NULL DEFAULT 0,
          locked_until timestamptz,
          updated_at timestamptz NOT NULL DEFAULT now()
        );
      `);

      // 5. Audit Log Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id serial PRIMARY KEY,
          ts timestamptz NOT NULL DEFAULT now(),
          ip text NOT NULL,
          user_agent text,
          attempt_no integer,
          status text NOT NULL,
          detail text
        );
        CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON admin_audit_log (ts DESC);
      `);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Synchronous/Asynchronous Rate Limit reservation matching SQL atomic semantics.
   * MUST be executed BEFORE computing Argon2id hash.
   */
  reserveAttempt(ipKey: string, nowMs = Date.now()): RateLimitReservation {
    // In-memory atomic update
    const existing = this.memRateLimits.get(ipKey);

    if (existing?.lockedUntil && existing.lockedUntil > nowMs) {
      const remainingSeconds = Math.ceil((existing.lockedUntil - nowMs) / 1000);
      return {
        attempts: existing.attempts,
        lockedUntil: new Date(existing.lockedUntil),
        isBlocked: true,
        retryAfterSeconds: Math.max(1, remainingSeconds),
      };
    }

    let attempts = 1;
    let lockedUntil: number | null = null;

    if (existing) {
      const isLockExpired = existing.lockedUntil !== null && existing.lockedUntil <= nowMs;
      const isStale = existing.lockedUntil === null && nowMs - existing.updatedAt > 24 * 60 * 60 * 1000;

      if (isLockExpired || isStale) {
        attempts = 1;
        lockedUntil = null;
      } else {
        attempts = existing.attempts + 1;
        if (attempts >= MAX_ATTEMPTS) {
          lockedUntil = nowMs + LOCKOUT_DURATION_MS;
        } else {
          lockedUntil = existing.lockedUntil;
        }
      }
    }

    this.memRateLimits.set(ipKey, { attempts, lockedUntil, updatedAt: nowMs });

    // Persist to Postgres asynchronously if available
    if (this.isPostgresConnected && this.pool) {
      const lockedUntilDate = lockedUntil ? new Date(lockedUntil).toISOString() : null;
      this.pool
        .query(
          `INSERT INTO admin_rate_limit (ip_key, attempts, locked_until, updated_at)
           VALUES ($1, $2, $3, now())
           ON CONFLICT (ip_key) DO UPDATE
           SET attempts = $2, locked_until = $3, updated_at = now()`,
          [ipKey, attempts, lockedUntilDate],
        )
        .catch(() => {});
    }

    const isBlocked = lockedUntil !== null && lockedUntil > nowMs;
    const retryAfterSeconds = isBlocked ? Math.ceil((lockedUntil! - nowMs) / 1000) : 0;

    return {
      attempts,
      lockedUntil: lockedUntil ? new Date(lockedUntil) : null,
      isBlocked,
      retryAfterSeconds,
    };
  }

  resetRateLimit(ipKey: string): void {
    this.memRateLimits.delete(ipKey);
    if (this.isPostgresConnected && this.pool) {
      this.pool.query('DELETE FROM admin_rate_limit WHERE ip_key = $1', [ipKey]).catch(() => {});
    }
  }

  // ---------------------------------------------------------------------------
  // Sessions Management
  // ---------------------------------------------------------------------------

  createSession(jti: string, arg2: string, arg3: string | number, arg4?: number): SessionInfo {
    const now = Date.now();
    let csrfSecret: string;
    let pwv: string;
    let expiresAtMs: number;

    if (typeof arg3 === 'number') {
      // 3-arg signature: createSession(jti, pwv, expiresAtMs)
      csrfSecret = crypto.randomBytes(32).toString('hex');
      pwv = arg2;
      expiresAtMs = arg3;
    } else {
      // 4-arg signature: createSession(jti, csrfSecret, pwv, expiresAtMs)
      csrfSecret = arg2;
      pwv = arg3;
      expiresAtMs = arg4 ?? now + 4 * 60 * 60 * 1000;
    }

    const session: SessionInfo = {
      jti,
      csrfSecret,
      pwv,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: expiresAtMs,
      revokedAt: null,
    };

    // Clean up oldest sessions if cap reached
    const active = Array.from(this.memSessions.values()).filter(
      (s) => !s.revokedAt && s.expiresAt > now && now - s.lastSeenAt < INACTIVITY_TIMEOUT_MS,
    );
    if (active.length >= MAX_ACTIVE_SESSIONS) {
      active.sort((a, b) => a.lastSeenAt - b.lastSeenAt);
      const toEvict = active[0];
      toEvict.revokedAt = now;
    }

    this.memSessions.set(jti, session);

    // Postgres persistence
    if (this.isPostgresConnected && this.pool) {
      this.pool
        .query(
          `INSERT INTO admin_sessions (jti, csrf_secret, pwv, created_at, last_seen_at, expires_at)
           VALUES ($1, $2, $3, now(), now(), $4)`,
          [jti, csrfSecret, pwv, new Date(expiresAtMs).toISOString()],
        )
        .catch(() => {});
    }

    return session;
  }

  validateSession(jti: string, now = Date.now()): SessionInfo | null {
    const session = this.memSessions.get(jti);
    if (!session) return null;

    if (session.revokedAt) return null;
    if (session.expiresAt <= now) return null;
    if (now - session.lastSeenAt > INACTIVITY_TIMEOUT_MS) return null;

    // Update activity
    session.lastSeenAt = now;

    if (this.isPostgresConnected && this.pool) {
      this.pool
        .query('UPDATE admin_sessions SET last_seen_at = now() WHERE jti = $1 AND revoked_at IS NULL', [jti])
        .catch(() => {});
    }

    return session;
  }

  revokeSession(jti: string, now = Date.now()): void {
    const session = this.memSessions.get(jti);
    if (session) {
      session.revokedAt = now;
    }
    if (this.isPostgresConnected && this.pool) {
      this.pool.query('UPDATE admin_sessions SET revoked_at = now() WHERE jti = $1', [jti]).catch(() => {});
    }
  }

  getActiveSessionsCount(now = Date.now()): number {
    return Array.from(this.memSessions.values()).filter(
      (s) => !s.revokedAt && s.expiresAt > now && now - s.lastSeenAt < INACTIVITY_TIMEOUT_MS,
    ).length;
  }

  // ---------------------------------------------------------------------------
  // Audit Logs
  // ---------------------------------------------------------------------------

  recordAudit(
    ip: string,
    userAgent: string | null,
    status: AuditLogEntry['status'],
    detail: string | null = null,
    attemptNo: number | null = null,
  ): void {
    const entry: AuditLogEntry = {
      id: this.memAuditLogs.length + 1,
      ts: Date.now(),
      ip,
      userAgent: userAgent ? userAgent.slice(0, 150) : null,
      attemptNo,
      status,
      detail: detail ? detail.slice(0, 200) : null,
    };
    this.memAuditLogs.push(entry);

    if (this.memAuditLogs.length > 500) {
      this.memAuditLogs.shift();
    }

    if (this.isPostgresConnected && this.pool) {
      this.pool
        .query(
          `INSERT INTO admin_audit_log (ts, ip, user_agent, attempt_no, status, detail)
           VALUES (now(), $1, $2, $3, $4, $5)`,
          [ip, entry.userAgent, attemptNo, status, entry.detail],
        )
        .catch(() => {});
    }
  }

  getAuditLogs(limit = 50): AuditLogEntry[] {
    return this.memAuditLogs.slice(-limit).reverse();
  }

  // ---------------------------------------------------------------------------
  // Settings & Versioning
  // ---------------------------------------------------------------------------

  getSettings(): { version: number; data: SiteSettings } {
    return {
      version: this.memSettingsVersion,
      data: JSON.parse(JSON.stringify(this.memSettingsData)),
    };
  }

  async getSettingsAsync(): Promise<{ version: number; data: SiteSettings }> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT version, data FROM site_settings WHERE id = 1');
        if (res.rows.length > 0) {
          const row = res.rows[0];
          this.memSettingsVersion = row.version;
          this.memSettingsData = row.data;
          return { version: row.version, data: row.data };
        }
      } catch (err) {
        console.warn('[Database] getSettingsAsync failed, using mem:', err);
      }
    }
    return this.getSettings();
  }

  updateSettings(newData: SiteSettings, expectedVersion: number): { success: boolean; version: number } {
    if (expectedVersion !== this.memSettingsVersion) {
      return { success: false, version: this.memSettingsVersion };
    }

    // Save previous version in history
    this.memSettingsHistory.push({
      id: this.memSettingsHistory.length + 1,
      version: this.memSettingsVersion,
      data: JSON.parse(JSON.stringify(this.memSettingsData)),
      savedAt: Date.now(),
    });

    if (this.memSettingsHistory.length > MAX_HISTORY_ENTRIES) {
      this.memSettingsHistory.shift();
    }

    this.memSettingsVersion += 1;
    this.memSettingsData = JSON.parse(JSON.stringify(newData));

    // Postgres persistence
    if (this.isPostgresConnected && this.pool) {
      const dataJson = JSON.stringify(newData);
      const newVer = this.memSettingsVersion;
      this.pool
        .query(
          `UPDATE site_settings
           SET version = $1, data = $2::jsonb, updated_at = now()
           WHERE id = 1`,
          [newVer, dataJson],
        )
        .then(() => {
          return this.pool!.query(
            `INSERT INTO site_settings_history (version, data, saved_at)
             VALUES ($1, $2::jsonb, now())`,
            [newVer, dataJson],
          );
        })
        .catch((err) => {
          console.error('[Database] Failed to persist settings update to Postgres:', err);
        });
    }

    return { success: true, version: this.memSettingsVersion };
  }

  rollbackSettings(targetVersion: number): { success: boolean; version: number; data?: SiteSettings } {
    const historical = this.memSettingsHistory.find((h) => h.version === targetVersion);
    if (!historical) {
      return { success: false, version: this.memSettingsVersion };
    }

    const updateRes = this.updateSettings(historical.data, this.memSettingsVersion);
    return {
      ...updateRes,
      data: historical.data,
    };
  }

  getSettingsHistory(): SettingsHistoryEntry[] {
    return [...this.memSettingsHistory].reverse();
  }

  clear(): void {
    this.memRateLimits.clear();
    this.memSessions.clear();
    this.memAuditLogs = [];
    this.memSettingsVersion = 1;
    this.memSettingsData = { ...DEFAULT_SETTINGS };
    this.memSettingsHistory = [];
  }
}

export const db = new DatabaseEngine();
