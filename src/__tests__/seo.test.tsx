import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SEO } from '../components/SEO';
import { DEFAULT_SEO } from '../config/seo';

describe('SEO component & Metadata synchronization', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('renders default title and synchronizes with document.title', () => {
    render(<SEO />);
    expect(document.title).toBe(DEFAULT_SEO.title);
  });

  it('supports custom title override', () => {
    render(<SEO title="Custom App Title — Best VPN" />);
    expect(document.title).toBe('Custom App Title — Best VPN');
  });

  it('configures meta description and keywords in head', () => {
    render(<SEO description="Custom description for search engines." keywords={['vpn', 'streaming']} />);

    const descMeta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta?.getAttribute('content')).toBe('Custom description for search engines.');

    const kwMeta = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    expect(kwMeta).not.toBeNull();
    expect(kwMeta?.getAttribute('content')).toBe('vpn, streaming');
  });

  it('configures canonical link and og:url', () => {
    render(<SEO canonicalUrl="https://vpn.example.com/" />);

    const linkCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(linkCanonical?.getAttribute('href')).toBe('https://vpn.example.com/');

    const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    expect(ogUrl?.getAttribute('content')).toBe('https://vpn.example.com/');
  });

  it('configures OpenGraph meta tags (title, description, type, site_name, image)', () => {
    render(
      <SEO
        ogTitle="OG Title"
        ogDescription="OG Description"
        ogType="website"
        ogSiteName="Custom Brand"
        ogImage="/custom-og.png"
      />,
    );

    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('OG Title');
    expect(document.head.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('OG Description');
    expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');
    expect(document.head.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe('Custom Brand');
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('/custom-og.png');
  });

  it('configures Twitter Card meta tags', () => {
    render(
      <SEO
        twitterCard="summary_large_image"
        twitterTitle="Twitter Title"
        twitterDescription="Twitter Description"
        twitterImage="/twitter-card.png"
      />,
    );

    expect(document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Twitter Title');
    expect(document.head.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('Twitter Description');
    expect(document.head.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('/twitter-card.png');
  });

  it('injects Schema.org structured data (JSON-LD) script', () => {
    const customSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TestVPN',
    };

    render(<SEO structuredData={customSchema} />);

    const script = document.head.querySelector<HTMLScriptElement>('script#schema-structured-data');
    expect(script).not.toBeNull();
    expect(script?.type).toBe('application/ld+json');

    const parsed = JSON.parse(script?.textContent || '{}');
    expect(parsed['@type']).toBe('SoftwareApplication');
    expect(parsed.name).toBe('TestVPN');
  });

  it('toggles noindex robots meta tag appropriately', () => {
    const { rerender } = render(<SEO noindex={true} />);
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');

    rerender(<SEO noindex={false} />);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
