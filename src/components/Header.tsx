import React, { useState } from 'react';
import { ShieldCheck, Send, Settings, Menu, X, Radio } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface HeaderProps {
  settings: SiteSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tgLink = buildTelegramLink(settings.botUsername, settings.defaultStartParam);

  return (
    <>
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-[#131b26] border-b border-[#A8B5A0]/20 py-2 px-4 text-xs sm:text-sm text-center text-[#A8B5A0] flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#A8B5A0] animate-pulse"></span>
          <span>{settings.announcementText}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a241e] to-[#0f1712] border border-[#A8B5A0]/40 flex items-center justify-center shadow-lg shadow-[#A8B5A0]/10 group-hover:border-[#A8B5A0] transition-colors">
              <ShieldCheck className="w-6 h-6 text-[#A8B5A0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                  {settings.brandName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#A8B5A0]/15 text-[#A8B5A0] border border-[#A8B5A0]/30 uppercase tracking-widest hidden sm:inline-block">
                  VLESS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono hidden sm:block">Защита моделей & стримеров</p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-gray-300">
            <a href="#audit" className="hover:text-[#A8B5A0] transition-colors flex items-center gap-1.5">
              <span>Аудит рисков</span>
              <span className="px-1 py-0.2 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                Тест
              </span>
            </a>
            <a href="#killswitch" className="hover:text-[#A8B5A0] transition-colors">
              Kill Switch
            </a>
            <a href="#servers" className="hover:text-[#A8B5A0] transition-colors flex items-center gap-1">
              <span>Серверы & Пинг</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </a>
            <a href="#features" className="hover:text-[#A8B5A0] transition-colors">
              Happ & INCY
            </a>
            <a href="#honest" className="hover:text-[#A8B5A0] transition-colors">
              Честно о VPN
            </a>
            <a href="#pricing" className="hover:text-[#A8B5A0] transition-colors">
              Тарифы
            </a>
            <a href="#faq" className="hover:text-[#A8B5A0] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              title="Настройки воронки / бота (для владельца)"
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-[#A8B5A0] hover:border-[#A8B5A0]/40 transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden xl:inline text-gray-400">Настройки</span>
            </button>

            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-bold text-sm shadow-lg shadow-[#A8B5A0]/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Бот в Telegram</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1">
                Вопросы и ответы
              </a>
            </div>
            <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                <Radio className="w-3.5 h-3.5 text-[#A8B5A0] animate-pulse" />
                VLESS • 10Gbps
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="text-xs text-gray-400 hover:text-[#A8B5A0] flex items-center gap-1 py-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Настроить бота</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
