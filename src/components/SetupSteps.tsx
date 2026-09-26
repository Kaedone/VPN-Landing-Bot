import React from 'react';
import { Send, Download, ToggleRight, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface SetupStepsProps {
  settings: SiteSettings;
}

export const SetupSteps: React.FC<SetupStepsProps> = ({ settings }) => {
  const tgLink = buildTelegramLink(settings.botUsername, 'setup_guide');

  const steps = [
    {
      num: '01',
      icon: <Send className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Запусти бота в Telegram',
      desc: 'Нажми кнопку «Старт», выбери удобный тариф или запроси тест. Бот моментально сгенерирует твой персональный защищенный VLESS-ключ.',
    },
    {
      num: '02',
      icon: <Download className="w-6 h-6 text-[#A8B5A0]" />,
      title: 'Скачай клиент Happ или INCY',
      desc: 'Бот пришлет прямую ссылку на бесплатное приложение Happ или INCY для твоего устройства (Windows, macOS, iPhone или Android).',
    },
    {
      num: '03',
      icon: <ToggleRight className="w-6 h-6 text-emerald-400" />,
      title: 'Включи Kill Switch и стримь',
      desc: 'Вставь ключ в 1 клик, активируй тумблер Kill Switch в настройках клиента — твой трафик зашифрован, а реальный IP защищен от обрывов на 100%.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0d131f] border-t border-gray-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
            <span>Всего 60 секунд</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Как подключиться <span className="text-[#A8B5A0]">за 3 простых шага</span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base">
            Никаких сложных настроек терминала или заумных протоколов. Все работает через привычный интерфейс Telegram и понятные приложения.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-[#A8B5A0]/50 transition-all flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-gray-800 flex items-center justify-center group-hover:border-[#A8B5A0]/50 transition-colors">
                    {s.icon}
                  </div>
                  <span className="text-2xl font-black text-gray-700 group-hover:text-[#A8B5A0]/50 font-mono transition-colors">
                    {s.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#A8B5A0] transition-colors">
                  {s.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 text-xs font-mono text-[#A8B5A0] flex items-center gap-1">
                <span>Шаг {idx + 1} готов</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-black text-base shadow-xl shadow-[#A8B5A0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-mono"
          >
            <Send className="w-5 h-5 fill-current" />
            <span>Запустить бота и получить ключ</span>
          </a>
        </div>

      </div>
    </section>
  );
};
