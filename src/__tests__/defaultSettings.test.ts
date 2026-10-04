// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTelegramLink,
  loadSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  DEFAULT_SETTINGS,
} from '../config/defaultSettings';

describe('buildTelegramLink() comprehensive test suite', () => {
  it('builds standard telegram link with default start param "landing"', () => {
    const link = buildTelegramLink('AdultVPN_bot');
    expect(link).toBe('https://t.me/AdultVPN_bot?start=landing');
  });

  it('strips single leading "@" symbol and trims whitespace', () => {
    const link = buildTelegramLink('  @AdultVPN_bot  ', 'custom_ref');
    expect(link).toBe('https://t.me/AdultVPN_bot?start=custom_ref');
  });

  it('strips multiple leading "@" symbols', () => {
    const link = buildTelegramLink('@@@AdultVPN_bot', 'promo');
    expect(link).toBe('https://t.me/AdultVPN_bot?start=promo');
  });

  it('falls back to default bot username if empty or whitespace provided', () => {
    const link1 = buildTelegramLink('');
    const link2 = buildTelegramLink('   ');
    expect(link1).toBe('https://t.me/AdultVPN_bot?start=landing');
    expect(link2).toBe('https://t.me/AdultVPN_bot?start=landing');
  });

  it('omits "?start=" when startParam is explicitly empty string or whitespace', () => {
    const linkEmpty = buildTelegramLink('AdultVPN_bot', '');
    const linkSpaces = buildTelegramLink('AdultVPN_bot', '   ');
    expect(linkEmpty).toBe('https://t.me/AdultVPN_bot');
    expect(linkSpaces).toBe('https://t.me/AdultVPN_bot');
  });

  it('correctly URL-encodes special characters, query marks, ampersands and spaces in startParam', () => {
    const link = buildTelegramLink('AdultVPN_bot', 'affiliate promo & discount=50%?ref=top');
    expect(link).toBe(
      'https://t.me/AdultVPN_bot?start=affiliate%20promo%20%26%20discount%3D50%25%3Fref%3Dtop'
    );
  });

  it('correctly URL-encodes Unicode and Cyrillic parameters', () => {
    const link = buildTelegramLink('AdultVPN_bot', 'стример_лето_2026');
    expect(link).toBe(
      `https://t.me/AdultVPN_bot?start=${encodeURIComponent('стример_лето_2026')}`
    );
  });
});

describe('siteSettings storage persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings when localStorage is empty', () => {
    const settings = loadSiteSettings();
    expect(settings.botUsername).toBe('AdultVPN_bot');
    expect(settings.pricing.length).toBeGreaterThan(0);
  });

  it('saves and reloads custom settings from localStorage', () => {
    const custom = {
      ...DEFAULT_SETTINGS,
      brandName: 'CreatorVPN',
      botUsername: 'CreatorVPN_bot',
    };
    saveSiteSettings(custom);
    const loaded = loadSiteSettings();
    expect(loaded.brandName).toBe('CreatorVPN');
    expect(loaded.botUsername).toBe('CreatorVPN_bot');
  });

  it('resets settings to default on resetSiteSettings()', () => {
    saveSiteSettings({ ...DEFAULT_SETTINGS, brandName: 'Temporary' });
    expect(loadSiteSettings().brandName).toBe('Temporary');

    resetSiteSettings();
    expect(loadSiteSettings().brandName).toBe(DEFAULT_SETTINGS.brandName);
  });
});
