import React from 'react';
import { ShieldAlert, Send, EyeOff, Zap, Lock, Activity, ArrowDown } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface HeroProps {
  settings: SiteSettings;
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  const tgLink = buildTelegramLink(settings.botUsername, 'hero_start');

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-cyber-grid">
      {/* Ambient background glow accents in brand color #A8B5A0 */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: '#A8B5A0' }}
      />
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full blur-[120px] bg-red-500/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          {/* Target Audience Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs sm:text-sm font-mono text-[#A8B5A0] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#A8B5A0] animate-ping" />
            <span className="font-semibold">OnlyFans • Fansly • StripChat • Chaturbate • WebCam</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Твой трафик никто не видит.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8B5A0] via-[#d5e0cd] to-[#8d9c84]">
              Стримы без срывов и деанона.
            </span>
          </h1>

          {/* Subtitle addressing real creator fears */}
          <p className="text-gray-300 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-normal">
            Приватный протокол для моделей и adult-креаторов. Защита от проверок провайдера, скрытого майнинга в
            «бесплатных браузерах» и мгновенный{' '}
            <strong className="text-white font-semibold">Kill Switch в клиентах Happ и INCY</strong>, который не сольет
            твой домашний IP даже при обрыве Wi-Fi.
          </p>

          {/* Key Danger Alert Callout */}
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 sm:p-5 text-left max-w-2xl mx-auto flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-gray-300 space-y-1">
              <p className="font-semibold text-white">
                Знаешь ли ты, что 82% моделей выдают свой реальный домашний адрес при микрообрыве VPN?
              </p>
              <p className="text-gray-400">
                Обычные VPN молча вываливают домашний IP в открытый эфир платформы. Узнай, насколько защищено твое
                рабочее место прямо сейчас.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#audit"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-bold text-base sm:text-lg shadow-xl shadow-[#A8B5A0]/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 font-mono"
            >
              <span>Пройти экспресс-аудит (1 мин)</span>
              <ArrowDown className="w-5 h-5" />
            </a>

            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gray-900/90 border border-gray-700 hover:border-[#A8B5A0]/60 text-white font-semibold text-base hover:bg-gray-800/80 transition-all flex items-center justify-center gap-2.5"
            >
              <Send className="w-5 h-5 text-[#A8B5A0]" />
              <span>Забрать ключ в Telegram</span>
            </a>
          </div>

          {/* Subtext info */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 pt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#A8B5A0]" />
              Без привязки банковских карт
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#A8B5A0]">⭐</span>
              Оплата через Telegram Stars
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#A8B5A0]" />
              Поддержка 1080p60 / 4K в OBS
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16">
          <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[#A8B5A0] mb-1 font-mono text-sm font-semibold">
              <Lock className="w-4 h-4" />
              <span>0 Логов</span>
            </div>
            <p className="text-xs text-gray-400">
              Серверы в юрисдикциях вне РФ и СНГ. Никакой истории сессий и фиксации данных.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-red-400 mb-1 font-mono text-sm font-semibold">
              <Zap className="w-4 h-4" />
              <span>Kill Switch</span>
            </div>
            <p className="text-xs text-gray-400">
              В клиентах Happ и INCY: моментальный блок пакетов при сбое сети. Ноль утечек в эфир.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[#A8B5A0] mb-1 font-mono text-sm font-semibold">
              <EyeOff className="w-4 h-4" />
              <span>VLESS Reality</span>
            </div>
            <p className="text-xs text-gray-400">
              Полная маскировка трафика под обычный веб-серфинг. Провайдер не видит использование VPN.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-yellow-400 mb-1 font-mono text-sm font-semibold">
              <span>⭐</span>
              <span>Telegram Stars</span>
            </div>
            <p className="text-xs text-gray-400">
              Анонимная оплата прямо в мессенджере. Никаких подозрительных операций в выписке банка.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
