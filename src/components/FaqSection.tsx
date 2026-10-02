import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'Могут ли провайдер или органы вычислить меня во время работы?',
      a: 'Нет. Весь твой трафик шифруется по современному протоколу VLESS Reality. Для систем DPI и СОРМ твоего интернет-провайдера это выглядит как обычное защищенное посещение зарубежных веб-сайтов (TLS 1.3). Провайдер не видит адреса платформ (OnlyFans, Fansly, StripChat, Chaturbate) и не может расшифровать видеопоток.',
    },
    {
      q: 'Почему Shine Browser и зеркала опасны для моделей?',
      a: 'Shine Browser укомплектован скрытым фоновым криптомайнером, который тайно грузит процессор и видеокарту во время стримов, вызывая перегрев ноутбука и лаги битрейта в OBS, а также не защищает от утечек WebRTC. Зеркала сайтов еще опаснее: они не шифруют общий трафик, подвержены фишингу и перехвату сессионных cookie, из-за чего мошенники воруют доступы к личным кабинетам.',
    },
    {
      q: 'Что делает Kill Switch в клиентах Happ и INCY?',
      a: 'Kill Switch — это функция аварийного отключения интернета при обрыве связи. Если твой домашний Wi-Fi или сотовая связь моргнет на долю секунды, обычный VPN молча отключится и сольет твой реальный домашний IP-адрес прямо в эфир стрима. С включенным Kill Switch в клиентах Happ или INCY сокет мгновенно блокируется — ни один байт данных не покинет устройство в незашифрованном виде.',
    },
    {
      q: 'Как работает оплата через Telegram Stars ⭐ и почему это анонимно?',
      a: 'Telegram Stars позволяют оплачивать подписку прямо внутри мессенджера без передачи номеров банковских карт, CVC-кодов или участия эквайрингов. В истории операций твоего банка отобразится только покупка звезд в Telegram, без каких-либо упоминаний VPN, adult-тематики или конкретных услуг.',
    },
    {
      q: 'Потянет ли VPN тяжелый стрим в 1080p 60fps или 4K через OBS?',
      a: 'Да. Все наши серверы подключены к выделенным магистральным аплинкам 10 Гбит/с с минимальным пингом. Протокол VLESS почти не создает накладных расходов на процессор, поэтому OBS Studio или Prism Live передают поток с максимальным качеством без дропов кадров.',
    },
    {
      q: 'На сколько устройств распространяется одна подписка?',
      a: 'В стандартные тарифы (7, 30, 90, 180, 365 дней) входит одновременное подключение до 3 устройств (например, стриминговый ПК + рабочий смартфон + запасной планшет). Для команд и студий доступен «Семейный тариф» на 5 устройств с пакетом 100 ГБ обхода глушилок.',
    },
    {
      q: 'Сложно ли установить Happ или INCY?',
      a: 'Это занимает меньше минуты. После выбора тарифа бот выдает ссылку на скачивание официального приложения для Windows, macOS, iOS или Android и специальную кнопку быстрого импорта. При нажатии профиль автоматически импортируется в клиент.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#0b0f19] border-t border-gray-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Частые вопросы</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ответы на вопросы о <span className="text-[#A8B5A0]">безопасности</span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Все, что нужно знать о юридической защите, технических протоколах и анонимности
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-gray-900/60 border border-gray-800 transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 group"
                >
                  <span className="text-base sm:text-lg font-bold text-white group-hover:text-[#A8B5A0] transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={`p-2 rounded-lg bg-gray-800/80 text-gray-400 group-hover:text-[#A8B5A0] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#A8B5A0]' : ''}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-gray-300 leading-relaxed border-t border-gray-800/60 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
