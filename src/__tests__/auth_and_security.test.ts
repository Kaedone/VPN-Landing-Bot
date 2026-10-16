import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import { apiRouter, COOKIE_SESSION_NAME } from '../server/routes';
import { db } from '../server/db';
import { generateArgon2idHash, createSessionToken, generateCsrfToken, resetSessionSecretKey } from '../server/crypto';
import { validateSiteSettings, validatePricingPlan } from '../server/validation';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

describe('Auth, PostgreSQL Persistence, Cookies, CSRF, CSP & Tariff Validation Suite', () => {
  const TEST_PASSWORD = 'CorrectHorseBatteryStaple2026!';
  let validTestPhcHash: string;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    db.clear();
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

  // Helper function to dispatch mock express requests
  const dispatch = async (
    app: express.Express,
    method: string,
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
    } = {},
  ) => {
    return new Promise<{ status: number; headers: Record<string, string>; body: any }>((resolve) => {
      const normalizedHeaders: Record<string, string> = {
        host: 'localhost:3000',
        'content-type': 'application/json',
        'x-vercel-forwarded-for': '198.51.100.12',
        ...(options.headers || {}),
      };

      const req: any = {
        method,
        url,
        originalUrl: url,
        headers: normalizedHeaders,
        body: options.body || {},
        query: {},
        params: {},
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
      };

      let statusCode = 200;
      const resHeaders: Record<string, string> = {};
      let isDone = false;

      const finish = (bodyData: any) => {
        if (!isDone) {
          isDone = true;
          resolve({ status: statusCode, headers: resHeaders, body: bodyData });
        }
      };

      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        setHeader: (name: string, val: string) => {
          resHeaders[name.toLowerCase()] = val;
          return res;
        },
        getHeader: (name: string) => {
          return resHeaders[name.toLowerCase()];
        },
        json: (data: any) => {
          finish(data);
          return res;
        },
        send: (data: any) => {
          finish(data);
          return res;
        },
        end: (data?: any) => {
          finish(data || null);
          return res;
        },
      };

      app(req, res, () => {
        finish(null);
      });
    });
  };

  const getTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
    return app;
  };

  // -------------------------------------------------------------------------
  // 1. Direct API Access without Auth
  // -------------------------------------------------------------------------
  it('1. test_direct_api_access_without_auth: returns 401 when mutating without cookie/token', async () => {
    const app = getTestApp();
    const res = await dispatch(app, 'PUT', '/api/settings', {
      body: { version: 1, data: DEFAULT_SETTINGS },
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Требуется авторизация');
  });

  // -------------------------------------------------------------------------
  // 2. Login, HttpOnly Cookie and CSRF Token Issuance
  // -------------------------------------------------------------------------
  it('2. test_login_issues_httponly_cookie_and_csrf: returns Set-Cookie and CSRF token', async () => {
    const app = getTestApp();
    const res = await dispatch(app, 'POST', '/api/auth/login', {
      body: { password: TEST_PASSWORD },
    });

    expect(res.status).toBe(200);
    expect(res.body.csrfToken).toBeDefined();
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie']).toContain(COOKIE_SESSION_NAME);
    expect(res.headers['set-cookie']).toContain('HttpOnly');
    expect(res.headers['set-cookie']).toContain('SameSite=Strict');
  });

  // -------------------------------------------------------------------------
  // 3. CSRF Protection on Mutating Requests
  // -------------------------------------------------------------------------
  it('3. test_csrf_protection_rejects_missing_or_bad_csrf_token: returns 403 on invalid CSRF', async () => {
    const app = getTestApp();

    // 1. Login to get cookie and valid CSRF token
    const loginRes = await dispatch(app, 'POST', '/api/auth/login', {
      body: { password: TEST_PASSWORD },
    });
    const setCookie = loginRes.headers['set-cookie'];
    const cookieVal = setCookie.split(';')[0]; // "adultvpn_admin_session=..."
    const csrfToken = loginRes.body.csrfToken;

    // 2. Mutating request with cookie BUT MISSING X-CSRF-Token -> 403
    const badRes1 = await dispatch(app, 'PUT', '/api/settings', {
      headers: { cookie: cookieVal },
      body: { version: 1, data: DEFAULT_SETTINGS },
    });
    expect(badRes1.status).toBe(403);
    expect(badRes1.body.error).toContain('CSRF-токен');

    // 3. Mutating request with INVALID X-CSRF-Token -> 403
    const badRes2 = await dispatch(app, 'PUT', '/api/settings', {
      headers: { cookie: cookieVal, 'x-csrf-token': 'fake.token' },
      body: { version: 1, data: DEFAULT_SETTINGS },
    });
    expect(badRes2.status).toBe(403);

    // 4. Mutating request with VALID X-CSRF-Token -> 200
    const goodRes = await dispatch(app, 'PUT', '/api/settings', {
      headers: { cookie: cookieVal, 'x-csrf-token': csrfToken },
      body: { version: 1, data: DEFAULT_SETTINGS },
    });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.success).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 4. Brute-Force Password Protection & 429 Retry-After
  // -------------------------------------------------------------------------
  it('4. test_brute_force_password_protection: 5 attempts trigger 429 with Retry-After header', async () => {
    const app = getTestApp();
    const testIp = '198.51.100.99';

    for (let i = 1; i <= 4; i++) {
      const res = await dispatch(app, 'POST', '/api/auth/login', {
        headers: { 'x-vercel-forwarded-for': testIp },
        body: { password: 'WrongPassword!' },
      });
      expect(res.status).toBe(401);
      expect(res.body.remainingAttempts).toBe(5 - i);
    }

    // 5th attempt locks the IP
    const res5 = await dispatch(app, 'POST', '/api/auth/login', {
      headers: { 'x-vercel-forwarded-for': testIp },
      body: { password: 'WrongPassword!' },
    });
    expect(res5.status).toBe(429);
    expect(res5.headers['retry-after']).toBeDefined();
    expect(Number(res5.headers['retry-after'])).toBeGreaterThan(800);

    // 6th attempt (even with correct password) is blocked immediately without checking hash
    const res6 = await dispatch(app, 'POST', '/api/auth/login', {
      headers: { 'x-vercel-forwarded-for': testIp },
      body: { password: TEST_PASSWORD },
    });
    expect(res6.status).toBe(429);
  });

  // -------------------------------------------------------------------------
  // 5. Session Inactivity and Logout Revocation
  // -------------------------------------------------------------------------
  it('5. test_session_inactivity_and_logout_revocation: revokes session in DB and clears cookie', async () => {
    const app = getTestApp();

    // Login
    const loginRes = await dispatch(app, 'POST', '/api/auth/login', {
      body: { password: TEST_PASSWORD },
    });
    const setCookie = loginRes.headers['set-cookie'];
    const cookieVal = setCookie.split(';')[0];
    const csrfToken = loginRes.body.csrfToken;

    // /api/auth/me succeeds
    const meRes = await dispatch(app, 'GET', '/api/auth/me', {
      headers: { cookie: cookieVal },
    });
    expect(meRes.status).toBe(200);
    expect(meRes.body.authenticated).toBe(true);

    // Logout
    const logoutRes = await dispatch(app, 'POST', '/api/auth/logout', {
      headers: { cookie: cookieVal, 'x-csrf-token': csrfToken },
    });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers['set-cookie']).toContain('Max-Age=0');

    // Trying to use previous cookie after logout -> 401
    const meResAfter = await dispatch(app, 'GET', '/api/auth/me', {
      headers: { cookie: cookieVal },
    });
    expect(meResAfter.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // 6. Tariff and Settings Deep Validation
  // -------------------------------------------------------------------------
  it('6. test_tariff_validation: rejects negative prices, missing fields, or empty names', () => {
    // 1. Invalid price (< 0)
    const invalidPlanNegativePrice = {
      id: 'plan-1',
      name: 'Месячный',
      duration: '1 месяц',
      price: -100, // Invalid!
      currency: '₽',
      periodLabel: 'в месяц',
      devices: 5,
      features: ['Доступ к серверам'],
      trafficHighlight: 'Безлимит',
    };
    const errors1 = validatePricingPlan(invalidPlanNegativePrice, 0);
    expect(errors1.length).toBeGreaterThan(0);
    expect(errors1[0].field).toBe('pricing[0].price');

    // 2. Invalid devices count (0 devices or not integer)
    const invalidPlanZeroDevices = {
      ...invalidPlanNegativePrice,
      price: 299,
      devices: 0,
    };
    const errors2 = validatePricingPlan(invalidPlanZeroDevices, 0);
    expect(errors2.some((e) => e.field.includes('devices'))).toBe(true);

    // 3. Full settings validation rejects empty plans array
    const emptyPlansSettings = {
      ...DEFAULT_SETTINGS,
      pricing: [],
    };
    const fullResult1 = validateSiteSettings(emptyPlansSettings);
    expect(fullResult1.isValid).toBe(false);
    expect(fullResult1.errors.some((e) => e.field === 'pricing')).toBe(true);

    // 4. Duplicate plan IDs rejected
    const duplicateIdsSettings = {
      ...DEFAULT_SETTINGS,
      pricing: [DEFAULT_SETTINGS.pricing[0], DEFAULT_SETTINGS.pricing[0]],
    };
    const fullResult2 = validateSiteSettings(duplicateIdsSettings);
    expect(fullResult2.isValid).toBe(false);
    expect(fullResult2.errors.some((e) => e.message.includes('дублируется'))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 7. Price Persistence and Versioning
  // -------------------------------------------------------------------------
  it('7. test_price_persistence_and_versioning: settings and tariffs persist across calls', async () => {
    const initial = db.getSettings();
    expect(initial.version).toBe(1);

    const updatedData = {
      ...DEFAULT_SETTINGS,
      pricing: DEFAULT_SETTINGS.pricing.map((p, idx) => (idx === 0 ? { ...p, price: 449 } : p)),
    };

    const updateRes = db.updateSettings(updatedData, 1);
    expect(updateRes.success).toBe(true);
    expect(updateRes.version).toBe(2);

    // Verify persisted state
    const after = db.getSettings();
    expect(after.version).toBe(2);
    expect(after.data.pricing[0].price).toBe(449);

    // Test optimistic lock conflict with stale version (1)
    const conflictRes = db.updateSettings(updatedData, 1);
    expect(conflictRes.success).toBe(false);
    expect(conflictRes.version).toBe(2);

    // Rollback test
    const rollbackRes = db.rollbackSettings(1);
    expect(rollbackRes.success).toBe(true);
    expect(rollbackRes.version).toBe(3);
    expect(db.getSettings().data.pricing[0].price).toBe(DEFAULT_SETTINGS.pricing[0].price);
  });

  // -------------------------------------------------------------------------
  // 8. CSP, CORS & Clickjacking Headers
  // -------------------------------------------------------------------------
  it('8. test_csp_cors_and_frame_protection: enforces strict CSP without unsafe-eval, CORS with credentials', async () => {
    const app = getTestApp();
    const res = await dispatch(app, 'GET', '/api/settings', {
      headers: {
        origin: 'https://vpn-landing-beige.vercel.app',
      },
    });

    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['cache-control']).toContain('no-store');

    const csp = res.headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");

    // CORS credentials
    expect(res.headers['access-control-allow-origin']).toBe('https://vpn-landing-beige.vercel.app');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
