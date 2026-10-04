import React, { useEffect } from 'react';
import { DEFAULT_SEO, SEOProps } from '../config/seo';

/**
 * Safely serializes data to a JSON string suitable for inclusion inside an HTML script tag.
 * Replaces '<', '>', '&', and Unicode line separators to prevent script breakout / XSS attacks.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function upsertMeta(attrName: 'name' | 'property', attrVal: string, content: string | undefined): void {
  if (typeof document === 'undefined') return;
  const selector = `meta[${attrName}="${attrVal}"]`;
  const existingElements = Array.from(document.head.querySelectorAll<HTMLMetaElement>(selector));

  if (!content) {
    existingElements.forEach((el) => el.remove());
    return;
  }

  if (existingElements.length > 0) {
    existingElements[0].setAttribute('content', content);
    for (let i = 1; i < existingElements.length; i++) {
      existingElements[i].remove();
    }
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute(attrName, attrVal);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
}

function upsertCanonical(href: string | undefined): void {
  if (typeof document === 'undefined') return;
  const existingElements = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));

  if (!href) {
    existingElements.forEach((el) => el.remove());
    return;
  }

  if (existingElements.length > 0) {
    existingElements[0].setAttribute('href', href);
    for (let i = 1; i < existingElements.length; i++) {
      existingElements[i].remove();
    }
  } else {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }
}

function upsertTitle(title: string): void {
  if (typeof document === 'undefined') return;
  document.title = title;

  const existingTitles = Array.from(document.head.querySelectorAll('title'));
  if (existingTitles.length > 0) {
    existingTitles[0].textContent = title;
    for (let i = 1; i < existingTitles.length; i++) {
      existingTitles[i].remove();
    }
  } else {
    const titleEl = document.createElement('title');
    titleEl.textContent = title;
    document.head.appendChild(titleEl);
  }
}

function upsertJsonLd(scriptId: string, data: Record<string, unknown> | undefined): void {
  if (typeof document === 'undefined') return;
  const selector = `script#${scriptId}`;
  const existingElements = Array.from(document.head.querySelectorAll<HTMLScriptElement>(selector));

  if (!data) {
    existingElements.forEach((el) => el.remove());
    return;
  }

  const safeJson = serializeJsonLd(data);

  if (existingElements.length > 0) {
    existingElements[0].type = 'application/ld+json';
    existingElements[0].textContent = safeJson;
    for (let i = 1; i < existingElements.length; i++) {
      existingElements[i].remove();
    }
  } else {
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = safeJson;
    document.head.appendChild(script);
  }
}

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  canonicalUrl,
  ogTitle = title || DEFAULT_SEO.ogTitle,
  ogDescription = description || DEFAULT_SEO.ogDescription,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = DEFAULT_SEO.ogType,
  ogSiteName = DEFAULT_SEO.ogSiteName,
  twitterCard = DEFAULT_SEO.twitterCard,
  twitterTitle = title || DEFAULT_SEO.twitterTitle,
  twitterDescription = description || DEFAULT_SEO.twitterDescription,
  twitterImage = ogImage || DEFAULT_SEO.twitterImage,
  noindex = false,
  structuredData = DEFAULT_SEO.structuredData,
}) => {
  const effectiveCanonical =
    canonicalUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

  useEffect(() => {
    // Title
    upsertTitle(title);

    // Standard Meta
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords && keywords.length > 0 ? keywords.join(', ') : undefined);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : undefined);

    // Canonical & URL
    upsertCanonical(effectiveCanonical);
    upsertMeta('property', 'og:url', effectiveCanonical);

    // OpenGraph
    upsertMeta('property', 'og:title', ogTitle);
    upsertMeta('property', 'og:description', ogDescription);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:site_name', ogSiteName);
    upsertMeta('property', 'og:image', ogImage);

    // Twitter Cards
    upsertMeta('name', 'twitter:card', twitterCard);
    upsertMeta('name', 'twitter:title', twitterTitle);
    upsertMeta('name', 'twitter:description', twitterDescription);
    upsertMeta('name', 'twitter:image', twitterImage);

    // Schema.org Structured Data (JSON-LD)
    upsertJsonLd('schema-structured-data', structuredData);
  }, [
    title,
    description,
    keywords,
    effectiveCanonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogSiteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    noindex,
    structuredData,
  ]);

  return null;
};
