import { Router, Request, Response, NextFunction } from 'express';
import { extractClientIp } from './ip';
import {
  verifyAdminPassword,
  createSessionToken,
  verifySessionToken,
  isSecurityConfigured,
} from './crypto';
import { db } from './db';
import { SiteSettings } from '../types/vpn';

export const apiRouter = Router();

// ----------------------------------------------------
// Security Headers & Policy Middleware
// ----------------------------------------------------
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers['origin'] || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-vercel-forwarded-for, x-real-ip');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Never cache API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Prevent framing, clickjacking, and MIME sniffing
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
  );

  next();
});

// ----------------------------------------------------
// Origin Validation on Mutating Requests
// ----------------------------------------------------
function validateOrigin(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers['origin'];
    const forwardedHost = req.headers['x-forwarded-host']?.toString();
    const host = req.headers['host']?.toString();
    const secFetchSite = req.headers['sec-fetch-site']?.toString();

    // Standard browser same-origin request
    if (secFetchSite === 'same-origin') {
      return next();
    }

    if (origin) {
      try {
        const originUrl = new URL(origin);
        const allowedHosts = [
          host,
          forwardedHost,
          'localhost:3000',
          '127.0.0.1:3000',
        ].filter(Boolean);

        const isMatched =
          allowedHosts.some((h) => {
            if (!h) return false;
            return originUrl.host === h || originUrl.hostname === h.split(':')[0];
          }) ||
          originUrl.hostname.endsWith('.run.app') ||
          originUrl.hostname.endsWith('.vercel.app');

        if (!isMatched) {
          return res.status(403).json({ error: 'Запрещен межсайтовый запрос (несовпадение Origin/Host)' });
        }
      } catch {
        return res.status(403).json({ error: 'Некорректный заголовок Origin' });
      }
    }
  }
  next();
}

apiRouter.use(validateOrigin);

// ----------------------------------------------------
// Authentication Middleware
// ----------------------------------------------------
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация администратора' });
  }

  const token = authHeader.slice(7).trim();
  const claims = await verifySessionToken(token);
  if (!claims) {
    return res.status(401).json({ error: 'Сессия недействительна или истекла' });
  }

  const activeSession = db.validateSession(claims.jti);
  if (!activeSession) {
    return res.status(401).json({ error: 'Сессия была завершена или превышено время неактивности' });
  }

  (req as any).adminSession = { claims, session: activeSession };
  next();
}

// ----------------------------------------------------
// Bot URL & Username Validation
// ----------------------------------------------------
const BOT_USERNAME_REGEX = /^[A-Za-z0-9_]{5,32}$/;
const TELEGRAM_LINK_REGEX = /^https:\/\/(t\.me|telegram\.me)\/[A-Za-z0-9_]{5,32}(\?start=[A-Za-z0-9_-]{1,64})?$/;

export function isValidTelegramUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.hostname !== 't.me' && parsed.hostname !== 'telegram.me') return false;
    if (parsed.username || parsed.password) return false;
    return TELEGRAM_LINK_REGEX.test(urlStr);
  } catch {
    return false;
  }
}

export function isValidBotUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  const clean = username.replace(/^@+/, '').trim();
  return BOT_USERNAME_REGEX.test(clean);
}

// ----------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------

/**
 * POST /api/auth/login
 * Step 1: Input size and format validation
 * Step 2: Trusted client IP resolution (400 if missing)
 * Step 3: Server config verification (503 fail-closed if baseline not met)
 * Step 4: Atomic rate limit reservation BEFORE computing Argon2id (429 if >= 5 attempts)
 * Step 5: Argon2id verification, audit logging, JWT issuance
 */
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || null;

  // Step 1: Body validation
  const { password } = req.body || {};
  if (!password || typeof password !== 'string' || password.length < 1 || password.length > 128) {
    return res.status(400).json({ error: 'Введите корректный пароль (до 128 символов)' });
  }

  // Step 2: Client IP resolution
  const ipInfo = extractClientIp(req);
  if (!ipInfo) {
    return res.status(400).json({ error: 'Не удалось определить IP-клиента' });
  }

  // Step 3: Configuration baseline check (Fail-Closed)
  if (!isSecurityConfigured()) {
    db.recordAudit(ipInfo.ip, userAgent, 'CONFIG', 'Attempted login while ADMIN_PASSWORD_HASH is unset or below OWASP baseline');
    return res.status(503).json({
      error: 'Вход в панель управления временно недоступен (серверная конфигурация безопасности не завершена)',
    });
  }

  // Step 4: ATOMIC rate limit reservation BEFORE hash computation
  const reservation = db.reserveAttempt(ipInfo.networkKey);

  if (reservation.isBlocked) {
    db.recordAudit(ipInfo.ip, userAgent, 'LOCKED', `IP rate limit exceeded (${reservation.attempts} attempts)`, reservation.attempts);
    res.setHeader('Retry-After', String(reservation.retryAfterSeconds));
    return res.status(429).json({
      error: 'Слишком много неудачных попыток входа. Доступ временно заблокирован на 15 минут.',
      retryAfter: reservation.retryAfterSeconds,
      unlockAt: reservation.lockedUntil ? reservation.lockedUntil.toISOString() : null,
      attempts: reservation.attempts,
    });
  }

  // Step 5: Argon2id verification
  const isValid = await verifyAdminPassword(password);

  if (!isValid) {
    const isNowLocked = reservation.attempts >= 5;
    const status = isNowLocked ? 'LOCKED' : 'FAILED';
    db.recordAudit(ipInfo.ip, userAgent, status, `Invalid password attempt #${reservation.attempts}`, reservation.attempts);

    if (isNowLocked && reservation.lockedUntil) {
      res.setHeader('Retry-After', String(reservation.retryAfterSeconds));
      return res.status(429).json({
        error: 'Превышен лимит попыток. Доступ заблокирован на 15 минут.',
        retryAfter: reservation.retryAfterSeconds,
        unlockAt: reservation.lockedUntil.toISOString(),
      });
    }

    return res.status(401).json({
      error: 'Неверный пароль администратора',
      remainingAttempts: Math.max(0, 5 - reservation.attempts),
    });
  }

  // Success: reset attempts and issue JWT session
  db.resetRateLimit(ipInfo.networkKey);
  db.recordAudit(ipInfo.ip, userAgent, 'SUCCESS', 'Admin login successful');

  const { token, jti, expiresIn } = await createSessionToken();
  const expiresAtMs = Date.now() + expiresIn * 1000;
  db.createSession(jti, (token as any).pwv || 'active', expiresAtMs);

  return res.status(200).json({
    token,
    expiresIn,
  });
});

/**
 * POST /api/auth/logout
 * Revokes current session token in storage
 */
apiRouter.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  if (session?.claims?.jti) {
    db.revokeSession(session.claims.jti);
    const ipInfo = extractClientIp(req);
    db.recordAudit(ipInfo?.ip || 'unknown', req.headers['user-agent'] || null, 'LOGOUT', `Session revoked: ${session.claims.jti}`);
  }
  return res.status(200).json({ success: true });
});

/**
 * GET /api/auth/me
 * Checks token validity, active sessions count
 */
apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  return res.status(200).json({
    authenticated: true,
    activeSessionsCount: db.getActiveSessionsCount(),
  });
});

// ----------------------------------------------------
// Settings Endpoints
// ----------------------------------------------------

/**
 * GET /api/settings
 * Public endpoint: returns current settings and version without authentication
 */
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.status(200).json(settings);
});

/**
 * PUT /api/settings
 * Admin-only: validates settings structure, bot links, and requires confirmPassword for bot URL changes
 */
apiRouter.put('/settings', requireAuth, async (req: Request, res: Response) => {
  const ipInfo = extractClientIp(req);
  const userAgent = req.headers['user-agent'] || null;

  const { version, data, confirmPassword } = req.body || {};

  if (typeof version !== 'number' || !data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Некорректный формат запроса (требуются version и data)' });
  }

  const currentSettings = db.getSettings();

  // Validate brandName
  if (!data.brandName || typeof data.brandName !== 'string' || data.brandName.trim().length > 60) {
    return res.status(400).json({ error: 'Некорректное имя бренда' });
  }

  // Validate botUsername
  if (!isValidBotUsername(data.botUsername)) {
    return res.status(400).json({
      error: 'Юзернейм бота должен содержать от 5 до 32 символов (латиница, цифры и подчеркивание)',
    });
  }

  // Validate supportLink
  if (data.supportLink && !isValidTelegramUrl(data.supportLink)) {
    return res.status(400).json({
      error: 'Ссылка на поддержку должна быть вида https://t.me/имя_бота или https://telegram.me/имя_бота',
    });
  }

  // Check if critical bot settings were changed
  const isBotUsernameChanged = currentSettings.data.botUsername !== data.botUsername;
  const isSupportLinkChanged = currentSettings.data.supportLink !== data.supportLink;

  if (isBotUsernameChanged || isSupportLinkChanged) {
    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return res.status(401).json({
        error: 'Для изменения ссылки или юзернейма Telegram-бота требуется подтверждение паролем',
        requiresPasswordConfirmation: true,
      });
    }

    const isPasswordValid = await verifyAdminPassword(confirmPassword);
    if (!isPasswordValid) {
      db.recordAudit(ipInfo?.ip || 'unknown', userAgent, 'REAUTH_FAILED', 'Failed password confirmation for bot link update');
      return res.status(401).json({
        error: 'Неверный пароль подтверждения',
      });
    }
  }

  // Validate pricing array
  if (!Array.isArray(data.pricing) || data.pricing.length === 0) {
    return res.status(400).json({ error: 'Список тарифов не может быть пустым' });
  }

  // Save new settings with optimistic locking
  const result = db.updateSettings(data as SiteSettings, version);

  if (!result.success) {
    return res.status(409).json({
      error: 'Конфликт версий: настройки уже были изменены другим администратором',
      currentVersion: result.version,
    });
  }

  db.recordAudit(
    ipInfo?.ip || 'unknown',
    userAgent,
    'SETTINGS',
    `Settings updated to version ${result.version}`
  );

  return res.status(200).json({
    success: true,
    version: result.version,
    data: db.getSettings().data,
  });
});

/**
 * GET /api/settings/history
 * Admin-only: returns history of last 20 revisions
 */
apiRouter.get('/settings/history', requireAuth, (_req: Request, res: Response) => {
  return res.status(200).json({
    history: db.getSettingsHistory(),
  });
});

/**
 * POST /api/settings/rollback
 * Admin-only: rolls back settings to a specific previous version
 */
apiRouter.post('/settings/rollback', requireAuth, (req: Request, res: Response) => {
  const { targetVersion } = req.body || {};
  if (typeof targetVersion !== 'number') {
    return res.status(400).json({ error: 'Укажите targetVersion для отката' });
  }

  const result = db.rollbackSettings(targetVersion);
  if (!result.success) {
    return res.status(404).json({ error: 'Указанная версия не найдена в истории изменений' });
  }

  const ipInfo = extractClientIp(req);
  db.recordAudit(
    ipInfo?.ip || 'unknown',
    req.headers['user-agent'] || null,
    'SETTINGS',
    `Rollback to version ${targetVersion}, new version ${result.version}`
  );

  return res.status(200).json(result);
});

/**
 * GET /api/audit
 * Admin-only: returns sanitized audit logs
 */
apiRouter.get('/audit', requireAuth, (_req: Request, res: Response) => {
  return res.status(200).json({
    logs: db.getAuditLogs(50),
  });
});
