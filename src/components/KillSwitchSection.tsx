import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  XCircle, 
  CheckCircle, 
  WifiOff, 
  Send, 
  Smartphone, 
  Laptop, 
  Zap, 
  Play 
} from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface KillSwitchSectionProps {
  settings: SiteSettings;
}

export const KillSwitchSection: React.FC<KillSwitchSectionProps> = ({ settings }) => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [simState, setSimState] = useState<'normal' | 'dropped'>('normal');

  const tgLink = buildTelegramLink(settings.botUsername, 'killswitch_info');

  const runSimulation = () => {
    setSimulationActive(true);
    setSimState('normal');

    setTimeout(() => {
      setSimState('dropped');
      setTimeout(() => {
        setSimState('normal');
        setSimulationActive(false);
      }, 3500);
    }, 1000);
  };

  return (
    <section id="killswitch" className="py-16 sm:py-24 bg-[#0b0f19] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full blur-[130px] bg-red-500/10 pointer-events-none" />
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-20"
        style={{ backgroundColor: '#A8B5A0' }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Главная угроза для стримеров и авторов</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Обрыв VPN во время эфира = <span className="text-red-400">катастрофа</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Обычные VPN при кратковременной потере связи молча «вываливают» твой реальный домашний IP в прямой эфир. 
            Для автора контента это раскрытие реального города, домашнего провайдера и полная потеря безопасности.
          </p>
        </div>

        {/* Interactive Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Danger Card: Without Kill Switch */}
          <div className="rounded-2xl bg-gradient-to-b from-red-950/30 to-gray-900/80 border border-red-500/30 p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Без Kill Switch (Обычный VPN)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                ОПАСНОСТЬ
              </span>
            </div>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Сеть моргнула на 1 секунду</strong>
                  Провайдер переподключил сессию или залагал роутер посреди трансляции.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Трафик пошел напрямую через оператора</strong>
                  VPN бесшумно упал, а стрим в OBS продолжил литься через твой обычный домашний интернет.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Реальный IP зафиксирован на серверах площадки</strong>
                  Зрители, чат или боты деанона перехватывают реальный IP и пробивают твой домашний адрес.
                </span>
              </li>
            </ul>

            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/20 text-xs font-mono text-red-300">
              Статус при сбое: <span className="text-red-400 font-bold">СЛИВ IP В ЭФИР [УТЕЧКА]</span>
            </div>
          </div>

          {/* Safe Card: With Kill Switch in Happ / INCY */}
          <div className="rounded-2xl bg-gradient-to-b from-[#16221b]/40 to-gray-900/80 border border-[#A8B5A0]/40 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl shadow-[#A8B5A0]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#A8B5A0] animate-pulse" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  С Kill Switch в Happ и INCY
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#A8B5A0]/20 text-[#A8B5A0] border border-[#A8B5A0]/40">
                100% ИЗОЛЯЦИЯ
              </span>
            </div>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Мгновенная блокировка системных сокетов</strong>
                  Клиент Happ или INCY на аппаратном уровне глушит любые сетевые пакеты вне зашифрованного туннеля.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Ноль пакетов данных наружу</strong>
                  Ни один байт трансляции, ни один запрос браузера не уйдет в сеть через домашнего провайдера.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold">Стрим безопасно замирает</strong>
                  Трансляция просто встанет на паузу в OBS, а твой реальный домашний адрес останется неприкосновенным.
                </span>
              </li>
            </ul>

            <div className="p-3.5 rounded-xl bg-[#131b26] border border-[#A8B5A0]/30 text-xs font-mono text-[#A8B5A0]">
              Статус при сбое: <span className="text-[#A8B5A0] font-bold">ПОТОК ЗАБЛОКИРОВАН [IP В ТАЙНЕ]</span>
            </div>
          </div>

        </div>

        {/* Live Simulation Box */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#A8B5A0]" />
                Интерактивный тест: Смоделировать обрыв связи Wi-Fi
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Посмотри наглядно, как ведут себя сетевые сокеты в момент секундного падения коннекта
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={simulationActive}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                simulationActive
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-[#A8B5A0] hover:bg-[#97a58f] text-[#0b0f19] shadow-lg shadow-[#A8B5A0]/15'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{simulationActive ? 'Идет симуляция обрыва...' : 'Запустить симуляцию сбоя'}</span>
            </button>
          </div>

          {/* Simulation Visualization */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            
            {/* Visual 1: Normal VPN */}
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2 font-mono text-xs">
              <div className="text-gray-400 font-semibold uppercase tracking-wider">
                Обычный VPN (Без Kill Switch):
              </div>
              {simState === 'normal' ? (
                <div className="text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Соединение стабильно (VPN IP)</span>
                </div>
              ) : (
                <div className="text-red-400 bg-red-950/50 p-2.5 rounded border border-red-500/40 space-y-1 animate-pulse">
                  <div className="font-bold flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Сбой VPN! Трафик пошел напрямую</span>
                  </div>
                  <div className="text-[11px] text-red-300">
                    УТЕЧКА: Домашний IP [178.62.xx.xx • Провайдер РФ] раскрыт!
                  </div>
                </div>
              )}
            </div>

            {/* Visual 2: Happ / INCY Kill Switch */}
            <div className="p-4 rounded-xl bg-gray-950/80 border border-[#A8B5A0]/30 space-y-2 font-mono text-xs">
              <div className="text-[#A8B5A0] font-semibold uppercase tracking-wider">
                AdultVPN + Happ / INCY Kill Switch:
              </div>
              {simState === 'normal' ? (
                <div className="text-[#A8B5A0] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A8B5A0] animate-pulse" />
                  <span>Защищенный VLESS туннель активен</span>
                </div>
              ) : (
                <div className="text-[#A8B5A0] bg-[#1a251e] p-2.5 rounded border border-[#A8B5A0]/50 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Сбой сети: Kill Switch заблокировал сокет</span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    РЕЗУЛЬТАТ: 0 байт наружу. Домашний IP скрыт на 100%.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-[#121924] border border-[#A8B5A0]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Laptop className="w-5 h-5 text-[#A8B5A0]" />
              <Smartphone className="w-5 h-5 text-[#A8B5A0]" />
              Включение Kill Switch занимает ровно 10 секунд
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              В приложении <strong className="text-white">Happ</strong> или <strong className="text-white">INCY</strong> перейди в «Настройки» → включи тумблер «Kill Switch / Блокировать трафик вне VPN». В нашем боте есть наглядный фото-гайд.
            </p>
          </div>

          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-[#A8B5A0] hover:bg-[#97a58f] text-[#0b0f19] font-bold text-xs sm:text-sm font-mono shrink-0 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Инструкция в боте</span>
          </a>
        </div>

      </div>
    </section>
  );
};
