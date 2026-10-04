// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { trackEvent, trackTelegramClick, trackServerSelected } from '../utils/analytics';

describe('analytics utility', () => {
  it('dispatches custom event without throwing errors', () => {
    expect(() => {
      trackEvent('test_event', { key: 'value' });
    }).not.toThrow();
  });

  it('triggers window.gtag if present', () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackTelegramClick('hero_cta');
    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'telegram_bot_click',
      expect.objectContaining({
        event_category: 'engagement',
        event_label: 'source_hero_cta',
      })
    );
  });

  it('tracks server selection with latency', () => {
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
});
