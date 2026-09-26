import React from 'react';
import { Check, AlertCircle, Shield } from 'lucide-react';

export const HonestSection: React.FC = () => {
  return (
    <section id="honest" className="py-16 sm:py-24 bg-[#0b0f19] border-t border-gray-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300">
            <Shield className="w-3.5 h-3.5 text-[#A8B5A0]" />
            <span>Никакого вранья и пустых обещаний</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Честно о <span className="text-[#A8B5A0]">границах VPN</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Мы ценим твою безопасность и доверие выше сиюминутных продаж. Вот что VPN скрывает на 100%, а что остается зоной твоей личной цифровой гигиены.
          </p>
        </div>

        {/* 2 Columns: What VPN Shields vs What creator must handle */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Col 1: Shields */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#151f18]/40 to-gray-900/60 border border-[#A8B5A0]/40 space-y-5">
            <div className="flex items-center gap-2.5 text-[#A8B5A0] font-bold text-lg">
              <span className="w-3 h-3 rounded-full bg-[#A8B5A0] animate-pulse" />
              <span>Что AdultVPN надежно скрывает:</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Реальный домашний IP-адрес и провайдера</strong>
                  Ни платформа, ни зрители стрима, ни боты деанона не увидят твой настоящий IP и точную геолокацию.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Историю серфинга и стримов от провайдера</strong>
                  Весь сетевой трафик зашифрован VLESS Reality. Оператор связи не видит, какие сайты ты посещаешь и куда отдаешь видеопоток.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Случайные утечки через Kill Switch</strong>
                  В случае кратковременного сбоя домашней сети трафик намертво блокируется в клиентах Happ и INCY, предотвращая раскрытие.
                </span>
              </li>
            </ul>
          </div>

          {/* Col 2: What stays with user */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-yellow-950/20 to-gray-900/60 border border-yellow-500/30 space-y-5">
            <div className="flex items-center gap-2.5 text-yellow-400 font-bold text-lg">
              <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
              <span>Что VPN НЕ сможет скрыть:</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-200 block font-medium">Личные данные в профиле и соцсетях</strong>
                  Если ты открыто публикуешь свои настоящие ФИО, город или привязываешь личные аккаунты к рабочей странице.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-200 block font-medium">Системную GPS-геолокацию в браузере</strong>
                  Если в браузере дано явное разрешение «Передавать точное местоположение сайту» (мы рекомендуем всегда отключать GPS в настройках).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-200 block font-medium">Платежные реквизиты на самих сайтах</strong>
                  Имя владельца банковской карты, которую ты вводишь на OnlyFans или Fansly для верификации выплат.
                </span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
