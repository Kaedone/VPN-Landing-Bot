// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildTelegramLink, loadSiteSettings, saveSiteSettings, DEFAULT_SETTINGS } from '../config/defaultSettings';

describe('defaultSettings & telegram link generator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds standard telegram link with default start param', () => {
    const link = buildTelegramLink('AdultVPN_bot');
    expect(link).toBe('https://t.me/AdultVPN_bot?start=landing');
  });

  it('builds telegram link with sanitized username and custom start param', () => {
    const link = buildTelegramLink('@AdultVPN_bot', 'promo_site');
    expect(link).toBe('https://t.me/AdultVPN_bot?start=promo_site');
  });

  it('loads default settings when localStorage is empty', () => {
    const settings = loadSiteSettings();
    expect(settings.botUsername).toBe('AdultVPN_bot');
    expect(settings.pricing.length).toBeGreaterThan(0);
  });

  it('saves and reloads custom settings from localStorage', () => {
    const custom = {
      ...DEFAULT_SETTINGS,
      brandName: 'TestVPN',
      botUsername: 'CustomBot',
    };
    saveSiteSettings(custom);
    const loaded = loadSiteSettings();
    expect(loaded.brandName).toBe('TestVPN');
    expect(loaded.botUsername).toBe('CustomBot');
  });
});
