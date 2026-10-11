import { DEFAULT_SETTINGS } from '../config/defaultSettings';
import { SiteSettings } from '../types/vpn';

export interface RateLimitReservation {
  attempts: number;
  lockedUntil: Date | null;
  isBlocked: boolean;
  retryAfterSeconds: number;
}

export interface SessionInfo {
  jti: string;
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
 * Storage Engine supporting atomic operations matching PostgreSQL semantics.
 * Stores rate limits, active sessions, audit logs, and versioned settings.
 */
export class DatabaseEngine {
  private rateLimits = new Map<string, { attempts: number; lockedUntil: number | null; updatedAt: number }>();
  private sessions = new Map<string, SessionInfo>();
  private auditLogs: AuditLogEntry[] = [];
  private settingsVersion = 1;
  private settingsData: SiteSettings = { ...DEFAULT_SETTINGS };
  private settingsHistory: SettingsHistoryEntry[] = [];

  /**
   * Atomic rate limit reservation matching SQL ON CONFLICT DO UPDATE RETURNING.
   * MUST be executed BEFORE computing expensive Argon2id hash.
   */
  reserveAttempt(ipKey: string, nowMs = Date.now()): RateLimitReservation {
    const existing = this.rateLimits.get(ipKey);

    // If locked and lock period is still active -> blocked immediately
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

    this.rateLimits.set(ipKey, { attempts, lockedUntil, updatedAt: nowMs });

    const isBlocked = lockedUntil !== null && lockedUntil > nowMs;
    const retryAfterSeconds = isBlocked ? Math.ceil((lockedUntil! - nowMs) / 1000) : 0;

    return {
      attempts,
      lockedUntil: lockedUntil ? new Date(lockedUntil) : null,
      isBlocked,
      retryAfterSeconds,
    };
  }

  /**
   * Resets rate limit attempts for an IP upon successful authentication.
   */
  resetRateLimit(ipKey: string): void {
    const existing = this.rateLimits.get(ipKey);
    if (existing) {
      this.rateLimits.set(ipKey, { attempts: 0, lockedUntil: null, updatedAt: Date.now() });
    }
  }

  /**
   * Records secure audit log entry without secrets or sensitive data.
   */
  recordAudit(
    ip: string,
    userAgent: string | null,
    status: AuditLogEntry['status'],
    detail: string | null = null,
    attemptNo: number | null = null
  ): void {
    this.auditLogs.push({
      id: this.auditLogs.length + 1,
      ts: Date.now(),
      ip,
      userAgent: userAgent ? userAgent.slice(0, 200) : null,
      attemptNo,
      status,
      detail,
    });
    // Keep last 500 audit entries
    if (this.auditLogs.length > 500) {
      this.auditLogs.shift();
    }
  }

  getAuditLogs(limit = 50): AuditLogEntry[] {
    return this.auditLogs.slice(-limit).reverse();
  }

  /**
   * Registers a newly signed JWT session in the active session store.
   * Enforces limit of maximum 3 concurrent active sessions.
   */
  createSession(jti: string, pwv: string, expiresAtMs: number): void {
    const now = Date.now();
    // Find active sessions
    const active = Array.from(this.sessions.entries())
      .filter(([_, s]) => s.revokedAt === null && s.expiresAt > now && now - s.lastSeenAt <= INACTIVITY_TIMEOUT_MS)
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    // If 3 or more active, revoke oldest
    if (active.length >= MAX_ACTIVE_SESSIONS) {
      const oldestJti = active[0][0];
      const s = this.sessions.get(oldestJti);
      if (s) s.revokedAt = now;
    }

    this.sessions.set(jti, {
      jti,
      pwv,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: expiresAtMs,
      revokedAt: null,
    });
  }

  /**
   * Validates session against allowlist, revocation, and 30-min inactivity timeout.
   */
  validateSession(jti: string, nowMs = Date.now()): SessionInfo | null {
    const session = this.sessions.get(jti);
    if (!session) return null;

    if (session.revokedAt !== null) return null;
    if (session.expiresAt <= nowMs) return null;

    // Check inactivity timeout (30 minutes)
    if (nowMs - session.lastSeenAt > INACTIVITY_TIMEOUT_MS) {
      session.revokedAt = nowMs;
      return null;
    }

    // Touch session activity timestamp
    session.lastSeenAt = nowMs;
    return session;
  }

  revokeSession(jti: string): boolean {
    const session = this.sessions.get(jti);
    if (session && session.revokedAt === null) {
      session.revokedAt = Date.now();
      return true;
    }
    return false;
  }

  revokeAllSessions(): number {
    const now = Date.now();
    let count = 0;
    for (const [_, s] of this.sessions.entries()) {
      if (s.revokedAt === null) {
        s.revokedAt = now;
        count++;
      }
    }
    return count;
  }

  getActiveSessionsCount(nowMs = Date.now()): number {
    return Array.from(this.sessions.values()).filter(
      (s) => s.revokedAt === null && s.expiresAt > nowMs && nowMs - s.lastSeenAt <= INACTIVITY_TIMEOUT_MS
    ).length;
  }

  getSettings(): { version: number; data: SiteSettings } {
    return {
      version: this.settingsVersion,
      data: JSON.parse(JSON.stringify(this.settingsData)),
    };
  }

  updateSettings(
    newData: SiteSettings,
    expectedVersion: number
  ): { success: boolean; version: number; error?: string } {
    if (expectedVersion !== this.settingsVersion) {
      return {
        success: false,
        version: this.settingsVersion,
        error: 'version_conflict',
      };
    }

    // Save previous snapshot to history
    this.settingsHistory.push({
      id: this.settingsHistory.length + 1,
      version: this.settingsVersion,
      data: JSON.parse(JSON.stringify(this.settingsData)),
      savedAt: Date.now(),
    });

    if (this.settingsHistory.length > MAX_HISTORY_ENTRIES) {
      this.settingsHistory.shift();
    }

    this.settingsVersion += 1;
    this.settingsData = JSON.parse(JSON.stringify(newData));

    return {
      success: true,
      version: this.settingsVersion,
    };
  }

  getSettingsHistory(): SettingsHistoryEntry[] {
    return [...this.settingsHistory].reverse();
  }

  rollbackSettings(targetVersion: number): { success: boolean; version: number; data?: SiteSettings } {
    const entry = this.settingsHistory.find((h) => h.version === targetVersion);
    if (!entry) {
      return { success: false, version: this.settingsVersion };
    }

    // Save current to history before rollback
    this.settingsHistory.push({
      id: this.settingsHistory.length + 1,
      version: this.settingsVersion,
      data: JSON.parse(JSON.stringify(this.settingsData)),
      savedAt: Date.now(),
    });

    this.settingsVersion += 1;
    this.settingsData = JSON.parse(JSON.stringify(entry.data));

    return {
      success: true,
      version: this.settingsVersion,
      data: this.settingsData,
    };
  }

  clear(): void {
    this.rateLimits.clear();
    this.sessions.clear();
    this.auditLogs = [];
    this.settingsVersion = 1;
    this.settingsData = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.settingsHistory = [];
  }
}

export const db = new DatabaseEngine();
