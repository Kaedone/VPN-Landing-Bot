/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiteSettings } from './types/vpn';
import { SEO } from './components/SEO';
import { loadSiteSettings, saveSiteSettings } from './config/defaultSettings';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RiskAuditFunnel } from './components/RiskAuditFunnel';
import { KillSwitchSection } from './components/KillSwitchSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ServerMapSection } from './components/ServerMapSection';
import { HonestSection } from './components/HonestSection';
import { VerifySection } from './components/VerifySection';
import { PricingSection } from './components/PricingSection';
import { SetupSteps } from './components/SetupSteps';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { AdminPage } from './components/AdminPage';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings);

  // Path-based routing for dedicated /admin route
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path === '/admin' || hash === '#/admin' || hash === '#admin' || search.includes('admin')) {
      return '/admin';
    }
    return '/';
  });

  useEffect(() => {
    // Initial load from local storage
    const loaded = loadSiteSettings();
    setSettings(loaded);

    // Fetch latest authoritative settings from server
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setSettings(data.data);
          saveSiteSettings(data.data);
        }
      })
      .catch(() => {
        // Dev / offline mode fallback
      });

    // Sync route on browser navigation (back/forward)
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin' || search.includes('admin')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Secret shortcut for owner: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф')) {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setCurrentPath('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSiteSettings(newSettings);
  };

  const handleNavigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Admin Dashboard View
  if (currentPath === '/admin') {
    return (
      <>
        <SEO
          title={`${settings.brandName || 'AdultVPN'} — Панель управления`}
          noindex={true}
        />
        <AdminPage
          settings={settings}
          onSave={handleSaveSettings}
          onBack={handleNavigateToHome}
        />
      </>
    );
  }

  // Public Landing Page (100% clean, no public admin buttons)
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] flex flex-col font-sans selection:bg-[#A8B5A0]/20 selection:text-[#A8B5A0]">
      <SEO
        title={(settings.brandName || 'AdultVPN') + ' — Защищенный VPN для моделей, стримеров и создателей контента'}
        ogSiteName={settings.brandName || 'AdultVPN'}
      />

      {/* Top Navbar */}
      <Header settings={settings} />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* Hero with High Converting Hook */}
        <Hero settings={settings} />

        {/* Interactive Risk Funnel (Lead Generator) */}
        <RiskAuditFunnel settings={settings} />

        {/* Crucial Kill Switch Section for Streamers */}
        <KillSwitchSection settings={settings} />

        {/* Technical Architecture: Happ & INCY, VLESS Reality, 10Gbps */}
        <FeaturesSection settings={settings} />

        {/* Interactive Server Topology Map & Streaming Ping Statistics */}
        <ServerMapSection settings={settings} />

        {/* Honest Section: What VPN hides vs Creator Hygiene */}
        <HonestSection />

        {/* Verification Section: Iphey & DNSLeakTest */}
        <VerifySection />

        {/* Exact Pricing Matching the Bot */}
        <PricingSection settings={settings} />

        {/* 3 Step Setup Guide in Happ / INCY */}
        <SetupSteps settings={settings} />

        {/* FAQ Section */}
        <FaqSection />

        {/* Final CTA */}
        <CtaSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
}
