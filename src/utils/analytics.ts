/**
 * AdultVPN Conversion & Web Analytics Utility
 * Supports Yandex.Metrika, Google Analytics (gtag), Plausible, and custom Webhooks.
 * Includes strict Whitelist validation for events and parameters to ensure security and clean data.
 */

declare global {
  interface Window {
    ym?: (counterId: number | string, action: string, targetName: string, params?: Record<string, unknown>) => void;
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    dataLayer?: unknown[];
    YM_COUNTER_ID?: number;
  }
}

/**
 * Strict whitelist of allowed analytics event names.
 */
export const ALLOWED_EVENTS = [
  'telegram_bot_click',
  'audit_started',
  'audit_completed',
  'killswitch_simulated',
  'server_selected',
  'pricing_plan_selected',
  'language_changed',
  'modal_opened',
  'test_event',
] as const;

export type AllowedEvent = (typeof ALLOWED_EVENTS)[number];

/**
 * Strict whitelist of allowed parameter keys.
 */
export const ALLOWED_PARAM_KEYS = [
  'category',
  'label',
  'value',
  'extra_param',
  'platform',
  'risk_level',
  'source',
  'key',
] as const;

export type AllowedParamKey = (typeof ALLOWED_PARAM_KEYS)[number];

export type AnalyticsEventParams = Partial<Record<AllowedParamKey, string | number | boolean>>;

/**
 * Whitelist sanitizer to prevent parameter pollution, PII leakage, or invalid types.
 */
export function sanitizeAnalyticsParams(params: Record<string, unknown>): AnalyticsEventParams {
  const sanitized: AnalyticsEventParams = {};
  const allowedSet = new Set<string>(ALLOWED_PARAM_KEYS);

  for (const [key, rawVal] of Object.entries(params)) {
    if (!allowedSet.has(key)) {
      continue; // Filter out any key not in the whitelist
    }

    const paramKey = key as AllowedParamKey;

    if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
      sanitized[paramKey] = rawVal;
    } else if (typeof rawVal === 'boolean') {
      sanitized[paramKey] = rawVal;
    } else if (typeof rawVal === 'string') {
      // Strip control characters, truncate to 120 chars max for telemetry safety
      const cleanStr = rawVal.replace(/[<>'"\\]/g, '').trim().slice(0, 120);
      sanitized[paramKey] = cleanStr;
    }
  }

  return sanitized;
}

/**
 * Validates if an event name is strictly permitted.
 */
export function isAllowedEvent(eventName: string): eventName is AllowedEvent {
  return (ALLOWED_EVENTS as readonly string[]).includes(eventName);
}

/**
 * Universal event dispatcher for conversions & creator interactions with whitelist validation.
 */
export const trackEvent = (eventName: string, params: Record<string, unknown> = {}): boolean => {
  try {
    if (!isAllowedEvent(eventName)) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn(`[Analytics Whitelist Rejected] Event "${eventName}" is not in the allowed events list.`);
      }
      return false;
    }

    const safeParams = sanitizeAnalyticsParams(params);

    // 1. Console log in dev mode for easy debugging
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log(`[Analytics Event] 👉 ${eventName}`, safeParams);
    }

    // 2. Google Analytics 4 (gtag.js)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: safeParams.category || 'conversion',
        event_label: safeParams.label,
        value: safeParams.value,
        ...safeParams,
      });
    }

    // 3. Yandex.Metrika (ym)
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      const ymId = window.YM_COUNTER_ID;
      if (ymId) {
        window.ym(ymId, 'reachGoal', eventName, safeParams);
      }
    }

    // 4. Plausible Analytics (privacy-friendly)
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: safeParams });
    }

    return true;
  } catch (err) {
    console.warn('[Analytics Error]', err);
    return false;
  }
};

/**
 * Specialized conversion tracking helpers:
 */

export const trackTelegramClick = (source: string, extraParam?: string) => {
  return trackEvent('telegram_bot_click', {
    category: 'engagement',
    label: `source_${source}`,
    extra_param: extraParam || 'none',
  });
};

export const trackAuditStarted = () => {
  return trackEvent('audit_started', {
    category: 'funnel',
    label: 'step_1',
  });
};

export const trackAuditCompleted = (platform: string, riskLevel: string) => {
  return trackEvent('audit_completed', {
    category: 'funnel',
    label: riskLevel,
    platform: platform,
    risk_level: riskLevel,
  });
};

export const trackKillSwitchSimulation = (state: 'dropped' | 'connected') => {
  return trackEvent('killswitch_simulated', {
    category: 'interactive_demo',
    label: state === 'dropped' ? 'wifi_dropped' : 'tunnel_restored',
  });
};

export const trackServerSelected = (city: string, ping: number) => {
  return trackEvent('server_selected', {
    category: 'topology_map',
    label: city,
    value: ping,
  });
};

export const trackPlanSelected = (planName: string, price: number) => {
  return trackEvent('pricing_plan_selected', {
    category: 'ecommerce',
    label: planName,
    value: price,
  });
};
