import React, { useEffect } from 'react';
import { DEFAULT_SEO, SEOProps } from '../config/seo';

function setMetaTag(selector: string, attrName: string, attrVal: string, content: string): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
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

  // Synchronize with DOM for client-side navigation / SPA
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Document Title
    document.title = title;

    // Standard Meta
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    if (keywords && keywords.length > 0) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }

    // Robots
    if (noindex) {
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
    } else {
      const robots = document.head.querySelector('meta[name="robots"]');
      if (robots) robots.remove();
    }

    // Canonical
    if (effectiveCanonical) {
      setLinkTag('canonical', effectiveCanonical);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', effectiveCanonical);
    }

    // OpenGraph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', ogSiteName);
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    }

    // Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', twitterTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', twitterDescription);
    if (twitterImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage);
    }

    // Schema.org Structured Data (JSON-LD)
    if (structuredData) {
      const scriptId = 'schema-structured-data';
      let script = document.head.querySelector<HTMLScriptElement>(`#${scriptId}`);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
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

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {effectiveCanonical && <link rel="canonical" href={effectiveCanonical} />}

      {/* OpenGraph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={ogSiteName} />
      {effectiveCanonical && <meta property="og:url" content={effectiveCanonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Schema.org Structured Data */}
      {structuredData && (
        <script
          id="schema-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};
