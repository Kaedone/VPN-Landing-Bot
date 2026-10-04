// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackEvent,
  trackTelegramClick,
  trackServerSelected,
  trackAuditCompleted,
  sanitizeAnalyticsParams,
  isAllowedEvent,
  ALLOWED_EVENTS,
  ALLOWED_PARAM_KEYS,
} from '../utils/analytics';

describe('analytics whitelist security & validation', () => {
  beforeEach(() => {
    delete window.gtag;
    delete window.ym;
    delete window.plausible;
    vi.restoreAllMocks();
  });

  it('validates permitted events against ALLOWED_EVENTS', () => {
    expect(isAllowedEvent('telegram_bot_click')).toBe(true);
    expect(isAllowedEvent('audit_completed')).toBe(true);
    expect(isAllowedEvent('server_selected')).toBe(true);
    expect(isAllowedEvent('arbitrary_malicious_event')).toBe(false);
  });

  it('discards parameters not in ALLOWED_PARAM_KEYS whitelist', () => {
    const raw = {
      category: 'engagement',
      label: 'valid_label',
      value: 42,
      secret_token: 'should_be_stripped',
      credit_card: '4111222233334444',
      user_password: '123',
    };
    const sanitized = sanitizeAnalyticsParams(raw);
    expect(sanitized).toEqual({
      category: 'engagement',
      label: 'valid_label',
      value: 42,
    });
    expect(sanitized).not.toHaveProperty('secret_token');
    expect(sanitized).not.toHaveProperty('credit_card');
    expect(sanitized).not.toHaveProperty('user_password');
  });

  it('sanitizes strings by stripping dangerous HTML characters and trimming', () => {
    const raw = {
      label: '<script>alert("xss")</script>hello',
    };
    const sanitized = sanitizeAnalyticsParams(raw);
    expect(sanitized.label).not.toContain('<script>');
    expect(sanitized.label).toBe('scriptalert(xss)/scripthello');
  });

  it('rejects disallowed events and does not trigger analytics dispatchers', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    const success = trackEvent('unauthorized_event_name', { label: 'hack' });
    expect(success).toBe(false);
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('successfully dispatches allowed events to window.gtag with sanitized params', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    const success = trackTelegramClick('hero_cta', 'partner_2026');
    expect(success).toBe(true);
    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'telegram_bot_click',
      expect.objectContaining({
        event_category: 'engagement',
        event_label: 'source_hero_cta',
        extra_param: 'partner_2026',
      })
    );
  });

  it('tracks server selection with latency number and label', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackServerSelected('Амстердам', 12);
    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'server_selected',
      expect.objectContaining({
        label: 'Амстердам',
        value: 12,
      })
    );
  });

  it('tracks risk audit completion with platform and risk level', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackAuditCompleted('OnlyFans', 'CRITICAL');
    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'audit_completed',
      expect.objectContaining({
        event_category: 'funnel',
        platform: 'OnlyFans',
        risk_level: 'CRITICAL',
      })
    );
  });
});
