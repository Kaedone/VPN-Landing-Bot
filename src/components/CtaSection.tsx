import React from 'react';
import { Send, ShieldCheck, Zap } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface CtaSectionProps {
  settings: SiteSettings;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ settings }) => {
  const tgLink = buildTelegramLink(settings.botUsername, 'final_cta');

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0d131f] to-[#070a11] border-t border-gray-800/80 relative overflow-hidden">
      {/* Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: '#A8B5A0' }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
          <ShieldCheck className="w-4 h-4" />
          <span>Защити свой контент и приватность уже сегодня</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Не рискуй деаноном и потерей стрима.{' '}
          <span className="text-[#A8B5A0]">Подключись за 1 минуту.</span>
        </h2>

        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Получи персональный VLESS-ключ в Telegram-боте <strong className="text-white">@{settings.botUsername.replace(/^@/, '')}</strong> с активным Kill Switch и безлимитной скоростью для прямых эфиров.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-black text-lg shadow-xl shadow-[#A8B5A0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-mono"
          >
            <Send className="w-5 h-5 fill-current" />
            <span>Перейти в Telegram-бота</span>
          </a>

          <a
            href="#audit"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-[#A8B5A0]" />
            <span>Пройти тест безопасности</span>
          </a>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Тарифы от 79 ₽ • Telegram Stars ⭐ • Клиенты Happ и INCY для всех ОС
        </div>

      </div>
    </section>
  );
};
