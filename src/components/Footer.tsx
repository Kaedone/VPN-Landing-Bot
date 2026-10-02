import React from 'react';
import { ShieldCheck, Settings, Lock } from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface FooterProps {
  settings: SiteSettings;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenSettings }) => {
  const currentYear = new Date().getFullYear();
  const botLink = buildTelegramLink(settings.botUsername);

  return (
    <footer className="bg-[#070a11] border-t border-gray-800/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#131b26] border border-[#A8B5A0]/30 flex items-center justify-center text-[#A8B5A0]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-white text-base">{settings.brandName}</span>
              <p className="text-gray-400 text-xs">Приватный VPN для авторов и стримеров</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-gray-400">
            <a href="#audit" className="hover:text-white transition-colors">
              Аудит рисков
            </a>
            <a href="#killswitch" className="hover:text-white transition-colors">
              Kill Switch
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Happ & INCY
            </a>
            <a href="#honest" className="hover:text-white transition-colors">
              Границы VPN
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Тарифы
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a href={botLink} target="_blank" rel="noopener noreferrer" className="text-[#A8B5A0] hover:underline">
              @{settings.botUsername.replace(/^@/, '')}
            </a>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-[#A8B5A0] hover:border-[#A8B5A0]/40 transition-all flex items-center gap-1.5 font-mono text-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Панель ссылок бота</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="max-w-xl text-gray-500 leading-relaxed">
            Внимание: AdultVPN обеспечивает техническую защиту сетевого туннеля, шифрование трафика и сокрытие реального
            IP-адреса. Сервис не хранит логов активности и не передает данные третьим лицам.
          </p>
          <div className="flex items-center gap-2 text-gray-500 font-mono shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#A8B5A0]" />
            <span>
              © {currentYear} {settings.brandName}. Все права защищены.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
