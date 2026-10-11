import React, { useState } from 'react';
import { ShieldCheck, Send, Menu, X, Radio } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface HeaderProps {
  settings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tgLink = buildTelegramLink(settings.botUsername, settings.defaultStartParam);

  return (
    <>
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-[#131b26] border-b border-[#A8B5A0]/20 py-2 px-4 text-xs sm:text-sm text-center text-[#A8B5A0] flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#A8B5A0] animate-pulse shrink-0"></span>
          <span className="truncate max-w-4xl">{settings.announcementText}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1a241e] to-[#0f1712] border border-[#A8B5A0]/40 flex items-center justify-center shadow-lg shadow-[#A8B5A0]/10 group-hover:border-[#A8B5A0] transition-colors shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#A8B5A0]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-mono truncate">
                  {settings.brandName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#A8B5A0]/15 text-[#A8B5A0] border border-[#A8B5A0]/30 uppercase tracking-widest hidden sm:inline-block shrink-0">
                  VLESS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono hidden sm:block whitespace-nowrap">
                Защита моделей & стримеров
              </p>
            </div>
          </a>

          {/* Desktop Nav - Non-breaking, responsive, clean */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 2xl:gap-7 text-xs xl:text-sm font-medium text-gray-300">
            <a
              href="#audit"
              className="hover:text-[#A8B5A0] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Аудит рисков</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                Тест
              </span>
            </a>
            <a
              href="#killswitch"
              className="hover:text-[#A8B5A0] transition-colors whitespace-nowrap shrink-0"
            >
              Kill Switch
            </a>
            <a
              href="#servers"
              className="hover:text-[#A8B5A0] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Серверы & Пинг</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </a>
            <a
              href="#features"
              className="hover:text-[#A8B5A0] transition-colors whitespace-nowrap shrink-0 hidden xl:inline-block"
            >
              Happ & INCY
            </a>
            <a
              href="#honest"
              className="hover:text-[#A8B5A0] transition-colors whitespace-nowrap shrink-0 hidden 2xl:inline-block"
            >
              Честно о VPN
            </a>
            <a
              href="#pricing"
              className="hover:text-[#A8B5A0] transition-colors whitespace-nowrap shrink-0"
            >
              Тарифы
            </a>
            <a
              href="#faq"
              className="hover:text-[#A8B5A0] transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </a>
          </nav>

          {/* Action Button & Mobile toggle (No public settings button!) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-bold text-xs sm:text-sm shadow-lg shadow-[#A8B5A0]/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
              <span>Бот в Telegram</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0b0f19]/95 border-b border-gray-800 px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col space-y-3 text-base">
              <a
                href="#audit"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A8B5A0] font-medium flex items-center justify-between py-1"
              >
                <span>Аудит уязвимостей стримера</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  Пройти
                </span>
              </a>
              <a
                href="#killswitch"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                Защита от срыва стримов (Kill Switch)
              </a>
              <a
                href="#servers"
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-400 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Карта серверов и замер пинга</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  10 Gbps
                </span>
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                Клиенты Happ и INCY
              </a>
              <a
                href="#honest"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                Честно о границах VPN
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                Тарифы и цены от 79 ₽
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-1"
              >
                Вопросы и ответы
              </a>
            </div>

            <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#A8B5A0] animate-pulse" />
                VLESS • 10Gbps Reality
              </span>
              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A8B5A0] hover:underline"
              >
                Открыть бота →
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
