import React from 'react';
import { Check, Send, Sparkles, Shield, Wifi, Users, Radio, Edit3 } from 'lucide-react';
import { SiteSettings, PricingPlan } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface PricingSectionProps {
  settings: SiteSettings;
  onOpenSettings: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ settings, onOpenSettings }) => {
  const regularPlans = settings.pricing.filter((p) => p.type !== 'special');
  const specialPlans = settings.pricing.filter((p) => p.type === 'special');

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#0b0f19] border-t border-gray-800/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Прозрачные тарифы от 79 ₽</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Выбери тариф для <span className="text-[#A8B5A0]">своих трансляций</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg">
            Доступ активируется мгновенно в Telegram. Оплата через{' '}
            <strong className="text-white">Telegram Stars ⭐</strong> — никаких номеров карт и записей в банковских
            выписках.
          </p>

          {/* Official terms box from user's bot */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/80 border border-gray-800 text-left max-w-2xl mx-auto space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-white font-semibold">
              <span>📦</span>
              <span>В любую подписку уже включено:</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⚠️</span>
                <span>3 устройства одновременно</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#A8B5A0]" />
                <span>Обычные серверы — полный безлимит</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#A8B5A0]" />
                <span>ГБ для надежного обхода глушилок</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#A8B5A0]" />
                <span>Встроенный Kill Switch в Happ & INCY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {regularPlans.map((plan) => {
            const planTgLink = buildTelegramLink(settings.botUsername, plan.id);
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative group ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#18231c] via-gray-900 to-gray-900 border-2 border-[#A8B5A0] shadow-xl shadow-[#A8B5A0]/10 scale-[1.02] z-10'
                    : 'bg-gray-900/60 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Badges */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#A8B5A0] text-[#0b0f19] whitespace-nowrap shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-gray-800">
                    <span className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider block">
                      {plan.name}
                    </span>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-base font-bold text-gray-300">{plan.currency}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">{plan.periodLabel}</span>
                  </div>

                  {/* Highlight */}
                  <div className="p-2.5 rounded-xl bg-gray-950/70 border border-gray-800/80 text-[11px] text-gray-300 text-center font-mono">
                    {plan.trafficHighlight}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-gray-300 pt-1">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#A8B5A0] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <a
                    href={planTgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm font-mono text-center flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? 'bg-[#A8B5A0] text-[#0b0f19] hover:bg-[#97a58f] shadow-lg shadow-[#A8B5A0]/20'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                    <span>Выбрать в боте</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special / Extra Plans Section from Screenshot */}
        {specialPlans.length > 0 && (
          <div className="pt-6 space-y-4">
            <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-[#A8B5A0]" />
              <span>Дополнительные специализированные тарифы:</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {specialPlans.map((plan) => {
                const planTgLink = buildTelegramLink(settings.botUsername, plan.id);
                return (
                  <div
                    key={plan.id}
                    className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-[#A8B5A0]/40 transition-all flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white flex items-center gap-2">{plan.name}</span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#A8B5A0]/15 text-[#A8B5A0] border border-[#A8B5A0]/30">
                          {plan.badge || 'Спецпакет'}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">
                          {plan.price} {plan.currency}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">/ {plan.duration}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs text-[#A8B5A0] font-mono">
                        {plan.trafficHighlight}
                      </div>

                      <ul className="space-y-2.5 text-xs text-gray-300">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#A8B5A0] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={planTgLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-[#A8B5A0] hover:text-[#0b0f19] text-white font-mono text-xs sm:text-sm font-bold text-center transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 fill-current" />
                      <span>Подключить тариф в Telegram</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin hint to easily adjust prices if needed */}
        <div className="text-center pt-2">
          <button
            onClick={onOpenSettings}
            className="text-xs text-gray-500 hover:text-[#A8B5A0] font-mono inline-flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Нужно изменить цены или ссылку на бота? Открой настройки панели</span>
          </button>
        </div>
      </div>
    </section>
  );
};
