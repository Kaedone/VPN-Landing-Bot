/**
 * AdultVPN Conversion & Web Analytics Utility
 * Supports Yandex.Metrika, Google Analytics (gtag), Plausible, and custom Webhooks.
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

export interface AnalyticsEventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

/**
 * Universal event dispatcher for conversions & creator interactions
 */
export const trackEvent = (eventName: string, params: AnalyticsEventParams = {}) => {
  try {
    // 1. Console log in dev mode for easy debugging
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log(`[Analytics Event] 👉 ${eventName}`, params);
    }

    // 2. Google Analytics 4 (gtag.js)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: params.category || 'conversion',
        event_label: params.label,
        value: params.value,
        ...params,
      });
    }

    // 3. Yandex.Metrika (ym)
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      const ymId = window.YM_COUNTER_ID;
      if (ymId) {
        window.ym(ymId, 'reachGoal', eventName, params);
      }
    }

    // 4. Plausible Analytics (privacy-friendly)
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: params });
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
};

/**
 * Specialized conversion tracking helpers:
 */

export const trackTelegramClick = (source: string, extraParam?: string) => {
  trackEvent('telegram_bot_click', {
    category: 'engagement',
    label: `source_${source}`,
    extra_param: extraParam || 'none',
  });
};

export const trackAuditStarted = () => {
  trackEvent('audit_started', {
    category: 'funnel',
    label: 'step_1',
  });
};

export const trackAuditCompleted = (platform: string, riskLevel: string) => {
  trackEvent('audit_completed', {
    category: 'funnel',
    label: riskLevel,
    platform: platform,
  });
};

export const trackKillSwitchSimulation = (state: 'dropped' | 'connected') => {
  trackEvent('killswitch_simulated', {
    category: 'interactive_demo',
    label: state === 'dropped' ? 'wifi_dropped' : 'tunnel_restored',
  });
};

export const trackServerSelected = (city: string, ping: number) => {
  trackEvent('server_selected', {
    category: 'topology_map',
    label: city,
    value: ping,
  });
};

export const trackPlanSelected = (planName: string, price: number) => {
  trackEvent('pricing_plan_selected', {
    category: 'ecommerce',
    label: planName,
    value: price,
  });
};
