import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { SEO, serializeJsonLd } from '../components/SEO';
import { DEFAULT_SEO } from '../config/seo';

describe('SEO component & Metadata synchronization', () => {
  beforeEach(() => {
    document.title = '';
    // Clean up head elements before each test
    while (document.head.firstChild) {
      document.head.removeChild(document.head.firstChild);
    }
  });

  afterEach(() => {
    cleanup();
    while (document.head.firstChild) {
      document.head.removeChild(document.head.firstChild);
    }
  });

  it('renders default title and synchronizes with document.title', () => {
    render(<SEO />);
    expect(document.title).toBe(DEFAULT_SEO.title);
    expect(document.head.querySelectorAll('title').length).toBe(1);
  });

  it('supports custom title override', () => {
    render(<SEO title="Custom App Title — Best VPN" />);
    expect(document.title).toBe('Custom App Title — Best VPN');
  });

  it('configures meta description and keywords in head without duplicates', () => {
    render(<SEO description="Custom description for search engines." keywords={['vpn', 'streaming']} />);

    const descMetas = document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"]');
    expect(descMetas.length).toBe(1);
    expect(descMetas[0].getAttribute('content')).toBe('Custom description for search engines.');

    const kwMetas = document.head.querySelectorAll<HTMLMetaElement>('meta[name="keywords"]');
    expect(kwMetas.length).toBe(1);
    expect(kwMetas[0].getAttribute('content')).toBe('vpn, streaming');
  });

  it('configures canonical link and og:url without duplicates', () => {
    render(<SEO canonicalUrl="https://vpn.example.com/" />);

    const linkCanonicals = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
    expect(linkCanonicals.length).toBe(1);
    expect(linkCanonicals[0].getAttribute('href')).toBe('https://vpn.example.com/');

    const ogUrls = document.head.querySelectorAll<HTMLMetaElement>('meta[property="og:url"]');
    expect(ogUrls.length).toBe(1);
    expect(ogUrls[0].getAttribute('content')).toBe('https://vpn.example.com/');
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

    expect(document.head.querySelectorAll('meta[property="og:title"]').length).toBe(1);
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('OG Title');

    expect(document.head.querySelectorAll('meta[property="og:description"]').length).toBe(1);
    expect(document.head.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('OG Description');

    expect(document.head.querySelectorAll('meta[property="og:type"]').length).toBe(1);
    expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');

    expect(document.head.querySelectorAll('meta[property="og:site_name"]').length).toBe(1);
    expect(document.head.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe('Custom Brand');

    expect(document.head.querySelectorAll('meta[property="og:image"]').length).toBe(1);
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

    expect(document.head.querySelectorAll('meta[name="twitter:card"]').length).toBe(1);
    expect(document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');

    expect(document.head.querySelectorAll('meta[name="twitter:title"]').length).toBe(1);
    expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Twitter Title');

    expect(document.head.querySelectorAll('meta[name="twitter:description"]').length).toBe(1);
    expect(document.head.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('Twitter Description');

    expect(document.head.querySelectorAll('meta[name="twitter:image"]').length).toBe(1);
    expect(document.head.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('/twitter-card.png');
  });

  it('injects Schema.org structured data (JSON-LD) script safely', () => {
    const customSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TestVPN',
    };

    render(<SEO structuredData={customSchema} />);

    const scripts = document.head.querySelectorAll<HTMLScriptElement>('script#schema-structured-data');
    expect(scripts.length).toBe(1);
    expect(scripts[0].type).toBe('application/ld+json');

    const parsed = JSON.parse(scripts[0].textContent || '{}');
    expect(parsed['@type']).toBe('SoftwareApplication');
    expect(parsed.name).toBe('TestVPN');
  });

  it('safely serializes JSON-LD preventing script breakout / XSS vulnerabilities', () => {
    const maliciousPayload = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Malicious </script><script>alert("xss")</script>',
      description: 'Dangerous content & <tag> with "quotes" and unicode \u2028 \u2029',
    };

    const serialized = serializeJsonLd(maliciousPayload);

    // Must NOT contain raw unescaped closing script tag
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(serialized).toContain('\\u0026');
    expect(serialized).toContain('\\u003ctag\\u003e');

    // Rendering with malicious payload safely sets script content
    render(<SEO structuredData={maliciousPayload} />);
    const script = document.head.querySelector<HTMLScriptElement>('script#schema-structured-data');
    expect(script?.textContent).not.toContain('</script>');

    // Safely parses back to original text without execution
    const parsed = JSON.parse(script?.textContent || '{}');
    expect(parsed.name).toBe('Malicious </script><script>alert("xss")</script>');
  });

  it('verifies absence of duplicate metadata tags on initial render', () => {
    render(<SEO />);

    const metadataSelectors = [
      'title',
      'meta[name="description"]',
      'meta[name="keywords"]',
      'link[rel="canonical"]',
      'meta[property="og:url"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:type"]',
      'meta[property="og:site_name"]',
      'meta[property="og:image"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
      'script#schema-structured-data',
    ];

    for (const selector of metadataSelectors) {
      const elements = document.head.querySelectorAll(selector);
      expect(elements.length, `Expected exactly 1 element for selector: ${selector}`).toBe(1);
    }
  });

  it('correctly updates metadata on rerender with new props without creating duplicates', () => {
    const { rerender } = render(
      <SEO
        title="Initial Title"
        description="Initial Description"
        ogTitle="Initial OG"
        canonicalUrl="https://vpn.example.com/initial"
      />,
    );

    expect(document.title).toBe('Initial Title');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Initial Description');
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Initial OG');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://vpn.example.com/initial');
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);

    // Rerender with completely new props
    rerender(
      <SEO
        title="Updated Title"
        description="Updated Description"
        ogTitle="Updated OG"
        canonicalUrl="https://vpn.example.com/updated"
      />,
    );

    expect(document.title).toBe('Updated Title');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Updated Description');
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Updated OG');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://vpn.example.com/updated');

    // Confirm strict singleton constraint across rerenders
    expect(document.head.querySelectorAll('title').length).toBe(1);
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('deduplicates pre-existing static meta tags from index.html', () => {
    // Simulate pre-existing multiple tags in head (as if from old index.html)
    const oldMeta1 = document.createElement('meta');
    oldMeta1.setAttribute('name', 'description');
    oldMeta1.setAttribute('content', 'Stale Description 1');
    document.head.appendChild(oldMeta1);

    const oldMeta2 = document.createElement('meta');
    oldMeta2.setAttribute('name', 'description');
    oldMeta2.setAttribute('content', 'Stale Description 2');
    document.head.appendChild(oldMeta2);

    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(2);

    // Render SEO component
    render(<SEO description="Fresh Dynamic Description" />);

    // Must be deduplicated down to exactly 1 with fresh content
    const descMetas = document.head.querySelectorAll('meta[name="description"]');
    expect(descMetas.length).toBe(1);
    expect(descMetas[0].getAttribute('content')).toBe('Fresh Dynamic Description');
  });

  it('toggles noindex robots meta tag appropriately on rerender', () => {
    const { rerender } = render(<SEO noindex={true} />);
    const robotsMeta = document.head.querySelector('meta[name="robots"]');
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.head.querySelectorAll('meta[name="robots"]').length).toBe(1);

    rerender(<SEO noindex={false} />);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.head.querySelectorAll('meta[name="robots"]').length).toBe(0);
  });
});
