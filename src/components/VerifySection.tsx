import React from 'react';
import { ExternalLink, CheckCircle, Search, ShieldCheck } from 'lucide-react';

export const VerifySection: React.FC = () => {
  return (
    <section id="verify" className="py-16 sm:py-24 bg-[#0d131f] border-t border-gray-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#131b26] border border-[#A8B5A0]/40 text-xs font-mono text-[#A8B5A0]">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Доказуемость вместо обещаний</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Не верь на слово. <span className="text-[#A8B5A0]">Проверь сам.</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Мы не просим слепо доверять маркетингу. Подключи конфиг в Happ или INCY и проверь чистоту соединения через
            независимые мировые сканеры утечек.
          </p>
        </div>

        {/* Verification Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Iphey */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col justify-between space-y-6 hover:border-[#A8B5A0]/50 transition-colors">
            <div className="space-y-3">
              <div className="text-[#A8B5A0] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Проверка IP и цифровых отпечатков</span>
              </div>
              <h3 className="text-xl font-bold text-white">Iphey.com</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Показывает реальный IP, геолокацию, DNS-серверы, утечки через WebRTC и уровень доверия систем антифрода
                к твоему соединению. При подключенном AdultVPN статус:{' '}
                <strong className="text-emerald-400">100% Trustworthy</strong>.
              </p>
            </div>

            <a
              href="https://iphey.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 text-white hover:text-[#A8B5A0] hover:border-[#A8B5A0]/50 text-xs font-mono transition-all self-start"
            >
              <span>Проверить на Iphey</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: DNSLeakTest */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col justify-between space-y-6 hover:border-[#A8B5A0]/50 transition-colors">
            <div className="space-y-3">
              <div className="text-[#A8B5A0] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Проверка DNS-утечек оператора</span>
              </div>
              <h3 className="text-xl font-bold text-white">DNSLeakTest.com</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Гарантирует, что твои DNS-запросы идут строго через защищенный шифрованный туннель за рубежом, а не
                через оборудование твоего домашнего провайдера или фильтры СОРМ.
              </p>
            </div>

            <a
              href="https://dnsleaktest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 text-white hover:text-[#A8B5A0] hover:border-[#A8B5A0]/50 text-xs font-mono transition-all self-start"
            >
              <span>Проверить DNS-запросы</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
