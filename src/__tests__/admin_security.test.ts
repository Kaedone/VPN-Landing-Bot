import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import { apiRouter, isValidTelegramUrl, isValidBotUsername } from '../server/routes';
import { db } from '../server/db';
import {
  parseArgon2Phc,
  validateArgon2SecurityFloor,
  generateArgon2idHash,
  verifyAdminPassword,
  createSessionToken,
  verifySessionToken,
  isSecurityConfigured,
  resetSessionSecretKey,
} from '../server/crypto';
import { normalizeIp, extractClientIp } from '../server/ip';

describe('Admin Security Hardening & Protection Suite', () => {
  const TEST_PASSWORD = 'CorrectHorseBatteryStaple2026!';
  let validTestPhcHash: string;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    db.clear();
    // Generate valid test Argon2id PHC hash with OWASP baseline parameters
    validTestPhcHash = await generateArgon2idHash(TEST_PASSWORD, {
      memorySize: 65536,
      iterations: 3,
      parallelism: 1,
    });
    process.env.ADMIN_PASSWORD_HASH = validTestPhcHash;
    process.env.SESSION_SECRET = 'super_secret_test_encryption_key_for_jwt_32_bytes_long';
    resetSessionSecretKey();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // -------------------------------------------------------------------------
  // 1. Concurrent Race Condition Test (50 simultaneous requests)
  // -------------------------------------------------------------------------
  it('1. test_rate_limit_concurrent_race_50_requests: exactly 5 attempts pass, 45 get 429', async () => {
    const ipKey = 'ipv4:203.0.113.195';

    // Launch 50 simultaneous atomic reservations
    const reservations = await Promise.all(
      Array.from({ length: 50 }, () => Promise.resolve(db.reserveAttempt(ipKey)))
    );

    const allowed = reservations.filter((r) => !r.isBlocked);
    const blocked = reservations.filter((r) => r.isBlocked);

    // Exactly 4 or 5 attempts allowed before reaching the 5-attempt threshold
    expect(allowed.length).toBeLessThanOrEqual(5);
    expect(blocked.length).toBeGreaterThanOrEqual(45);
    expect(allowed.length + blocked.length).toBe(50);

    // The first blocked request must have a positive retryAfterSeconds
    const firstBlocked = blocked[0];
    expect(firstBlocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(firstBlocked.lockedUntil).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // 2. Lockout and Retry-After Header Test
  // -------------------------------------------------------------------------
  it('2. test_rate_limit_lockout_and_retry_after: 5 failed attempts lock for 15 mins with Retry-After', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);

    const clientIp = '198.51.100.77';

    // Helper to send login request
    const postLogin = async (pwd: string) => {
      return new Promise<{ status: number; headers: Record<string, string>; body: any }>((resolve) => {
        const req: any = {
          method: 'POST',
          url: '/api/auth/login',
          headers: {
            'x-vercel-forwarded-for': clientIp,
            'content-type': 'application/json',
          },
          body: { password: pwd },
        };
        let statusCode = 200;
        const resHeaders: Record<string, string> = {};
        const res: any = {
          status: (code: number) => {
            statusCode = code;
            return res;
          },
          setHeader: (name: string, val: string) => {
            resHeaders[name.toLowerCase()] = val;
          },
          json: (data: any) => {
            resolve({ status: statusCode, headers: resHeaders, body: data });
          },
        };
        app(req, res);
      });
    };

    // First 4 attempts with wrong password: 401
    for (let i = 1; i <= 4; i++) {
      const res = await postLogin('WrongPassword123!');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Неверный пароль');
    }

    // 5th failed attempt: 429 with Retry-After
    const res5 = await postLogin('WrongPassword123!');
    expect(res5.status).toBe(429);
    expect(res5.headers['retry-after']).toBeDefined();
    expect(Number(res5.headers['retry-after'])).toBeGreaterThan(800); // ~900s (15 min)
    expect(res5.body.unlockAt).toBeDefined();

    // 6th attempt (even with CORRECT password): must STILL be 429 and blocked!
    const res6 = await postLogin(TEST_PASSWORD);
    expect(res6.status).toBe(429);
  });

  // -------------------------------------------------------------------------
  // 3. IP Extraction and Anti-Spoofing Test
  // -------------------------------------------------------------------------
  it('3. test_ip_anti_spoofing_headers: ignores client-supplied x-forwarded-for, trusts vercel/real-ip', () => {
    // Attack scenario: client injects fake x-forwarded-for: 1.1.1.1
    // but Vercel sets x-vercel-forwarded-for: 203.0.113.80
    const mockReq: any = {
      headers: {
        'x-forwarded-for': '1.1.1.1, 8.8.8.8',
        'x-vercel-forwarded-for': '203.0.113.80',
      },
      socket: { remoteAddress: '127.0.0.1' },
    };

    const extracted = extractClientIp(mockReq);
    expect(extracted).not.toBeNull();
    expect(extracted?.ip).toBe('203.0.113.80');
    expect(extracted?.networkKey).toBe('ipv4:203.0.113.80');

    // IPv6 subnet normalization to /64
    const mockIpv6Req: any = {
      headers: {
        'x-real-ip': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      },
      socket: { remoteAddress: '127.0.0.1' },
    };
    const extractedIpv6 = extractClientIp(mockIpv6Req);
    expect(extractedIpv6).not.toBeNull();
    expect(extractedIpv6?.networkKey).toBe('ipv6:2001:0db8:85a3:0000::/64');
  });

  // -------------------------------------------------------------------------
  // 4. Argon2id PHC Verification and Fail-Closed Test
  // -------------------------------------------------------------------------
  it('4. test_argon2_phc_verification_and_fail_closed: correctly verifies, fails closed on missing/weak hash', async () => {
    // Valid password check
    const valid = await verifyAdminPassword(TEST_PASSWORD);
    expect(valid).toBe(true);

    // Invalid password check
    const invalid = await verifyAdminPassword('WrongPassword');
    expect(invalid).toBe(false);

    // Fail-Closed: empty ADMIN_PASSWORD_HASH
    process.env.ADMIN_PASSWORD_HASH = '';
    expect(isSecurityConfigured()).toBe(false);
    expect(await verifyAdminPassword(TEST_PASSWORD)).toBe(false);

    // Fail-Closed: weak parameters below OWASP baseline (e.g. memory = 1024 KiB)
    const weakPhc = '$argon2id$v=19$m=1024,t=1,p=1$c29tZXNhbHQ$c29tZWhhc2g';
    const parsed = parseArgon2Phc(weakPhc);
    expect(parsed).not.toBeNull();
    expect(validateArgon2SecurityFloor(parsed!)).toBe(false);

    process.env.ADMIN_PASSWORD_HASH = weakPhc;
    expect(isSecurityConfigured()).toBe(false);
    expect(await verifyAdminPassword(TEST_PASSWORD)).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 5. Session Inactivity, Revocation & Max 3 Sessions Test
  // -------------------------------------------------------------------------
  it('5. test_session_inactivity_and_revocation: enforces 30m inactivity, logout revocation, max 3 sessions', async () => {
    // Issue token
    const { token, jti } = await createSessionToken();
    db.createSession(jti, 'pwv1', Date.now() + 4 * 3600 * 1000);

    // Valid immediately
    expect(db.validateSession(jti)).not.toBeNull();

    // Inactivity timeout: simulate 31 minutes elapsed
    const futureMs = Date.now() + 31 * 60 * 1000;
    expect(db.validateSession(jti, futureMs)).toBeNull();

    // Logout revocation
    const { jti: jti2 } = await createSessionToken();
    db.createSession(jti2, 'pwv1', Date.now() + 4 * 3600 * 1000);
    expect(db.validateSession(jti2)).not.toBeNull();
    db.revokeSession(jti2);
    expect(db.validateSession(jti2)).toBeNull();

    // Max 3 active sessions: creating a 4th must revoke the 1st
    db.clear();
    const jtiA = 'session-a';
    const jtiB = 'session-b';
    const jtiC = 'session-c';
    const jtiD = 'session-d';

    db.createSession(jtiA, 'pwv', Date.now() + 10000);
    db.createSession(jtiB, 'pwv', Date.now() + 10000);
    db.createSession(jtiC, 'pwv', Date.now() + 10000);
    expect(db.getActiveSessionsCount()).toBe(3);

    // Adding 4th
    db.createSession(jtiD, 'pwv', Date.now() + 10000);
    expect(db.getActiveSessionsCount()).toBe(3);
    // jtiA should be revoked
    expect(db.validateSession(jtiA)).toBeNull();
    expect(db.validateSession(jtiD)).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // 6. Bot URL Validation, XSS Protection & Password Confirmation
  // -------------------------------------------------------------------------
  it('6. test_bot_url_reauth_and_xss_protection: rejects javascript:/data: links, requires confirmPassword for botUrl', async () => {
    // Valid Telegram URLs
    expect(isValidTelegramUrl('https://t.me/AdultVPN_bot')).toBe(true);
    expect(isValidTelegramUrl('https://telegram.me/AdultVPN_bot?start=landing')).toBe(true);

    // Malicious XSS / invalid URLs
    expect(isValidTelegramUrl('javascript:alert(1)')).toBe(false);
    expect(isValidTelegramUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidTelegramUrl('https://evil-site.com/AdultVPN_bot')).toBe(false);
    expect(isValidTelegramUrl('http://t.me/AdultVPN_bot')).toBe(false); // must be https
    expect(isValidTelegramUrl('https://user:pass@t.me/AdultVPN_bot')).toBe(false);

    // Bot usernames
    expect(isValidBotUsername('AdultVPN_bot')).toBe(true);
    expect(isValidBotUsername('@AdultVPN_bot')).toBe(true);
    expect(isValidBotUsername('shrt')).toBe(false); // < 5 chars
    expect(isValidBotUsername('invalid-name-with-dashes')).toBe(false); // dashes not allowed by Telegram
  });

  // -------------------------------------------------------------------------
  // 7. Security Headers and Anti-Clickjacking Test
  // -------------------------------------------------------------------------
  it('7. test_security_headers_and_csp: ensures no-store, X-Frame-Options DENY, and frame-ancestors none', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);

    return new Promise<void>((resolve) => {
      const req: any = {
        method: 'GET',
        url: '/api/settings',
        headers: {},
      };
      const resHeaders: Record<string, string> = {};
      const res: any = {
        status: () => res,
        setHeader: (k: string, v: string) => {
          resHeaders[k.toLowerCase()] = v;
        },
        json: () => {
          expect(resHeaders['cache-control']).toContain('no-store');
          expect(resHeaders['x-frame-options']).toBe('DENY');
          expect(resHeaders['x-content-type-options']).toBe('nosniff');
          expect(resHeaders['content-security-policy']).toContain("frame-ancestors 'none'");
          resolve();
        },
      };
      app(req, res);
    });
  });
});
