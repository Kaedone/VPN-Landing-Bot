import React from 'react';
import { Shield, Smartphone, Radio, EyeOff, CreditCard, Layers, Sparkles, Server } from 'lucide-react';
import { SiteSettings } from '../types/vpn';

interface FeaturesSectionProps {
  settings: SiteSettings;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = () => {
  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Клиенты Happ и INCY',
      badge: 'iOS • Android • Windows • Mac',
      desc: 'Современные сверхбыстрые приложения без навязчивой рекламы и подозрительных разрешений. Импорт защищенного профиля в 1 клик.',
    },
    {
      icon: <EyeOff className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Маскировка VLESS Reality',
      badge: 'Невидимость для СОРМ и РКН',
      desc: 'Шифрованный поток маскируется под обычный TLS-трафик крупных мировых ресурсов. Провайдер не видит самого факта использования VPN.',
    },
    {
      icon: <Radio className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Выделенные каналы 10 Gbps',
      badge: 'Без лагов в OBS',
      desc: 'Стабильный битрейт для стриминга в 1080p 60fps и 4K на OnlyFans, StripChat, Chaturbate и BongaCams. Плавная картинка без просадок.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
      title: 'Оплата через Telegram Stars ⭐',
      badge: 'Полная анонимность платежа',
      desc: 'Оплачивай подписку звездами прямо в Telegram. В банковских выписках никогда не появятся платежи за VPN или adult-тематику.',
    },
    {
      icon: <Server className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Чистые доверенные IP',
      badge: 'Защита от теневых банов',
      desc: 'Наши адреса не находятся в спам-листах и черных списках стрим-платформ. Никаких бесконечных Cloudflare капч и внезапных блокировок аккаунтов.',
    },
    {
      icon: <Layers className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Обход глушилок и фильтров',
      badge: 'Работает на мобильном интернете',
      desc: 'Специальные конфигурации для работы во время локальных ограничений сотовых вышек и белых списков провайдеров.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-[#0d131f] border-t border-gray-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
            <Shield className="w-3.5 h-3.5" />
            <span>Архитектура безопасности</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Сделано специально под задачи <span className="text-[#A8B5A0]">моделей и стримеров</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg">
            Обычные VPN создаются для просмотра сайтов в кафе. AdultVPN спроектирован для бесперебойных трансляций,
            защиты приватности и сокрытия стримов от посторонних глаз.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 sm:p-7 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-[#A8B5A0]/40 transition-all duration-300 space-y-4 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#A8B5A0]/5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-gray-800 flex items-center justify-center group-hover:border-[#A8B5A0]/50 transition-colors">
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-gray-950 border border-gray-800 text-gray-300">
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#A8B5A0] transition-colors">{f.title}</h3>

                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Протокол: VLESS Reality</span>
                <span className="text-[#A8B5A0]">100% защита</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
