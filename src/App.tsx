/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiteSettings } from './types/vpn';
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
import { AdminSettingsModal } from './components/AdminSettingsModal';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Initial load from local storage
    const loaded = loadSiteSettings();
    setSettings(loaded);
  }, []);

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSiteSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] flex flex-col font-sans selection:bg-[#A8B5A0]/20 selection:text-[#A8B5A0]">
      {/* Top Navbar */}
      <Header settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

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

        {/* Exact Pricing Matching the Bot Screenshot */}
        <PricingSection settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* 3 Step Setup Guide in Happ / INCY */}
        <SetupSteps settings={settings} />

        {/* FAQ Section */}
        <FaqSection />

        {/* Final CTA */}
        <CtaSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Owner Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
