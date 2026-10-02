import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  Radio, 
  ArrowUpRight, 
  Sparkles, 
  Server,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface ServerLocation {
  id: string;
  city: string;
  country: string;
  flag: string;
  region: 'eu' | 'us' | 'anti_jam';
  coords: { x: number; y: number }; // SVG map coordinates (0-1000, 0-500)
  ping: number; // in ms
  jitter: number; // in ms
  bandwidth: string;
  uptime: string;
  obsSuitability: 'Идеально (60 FPS)' | 'Отлично (60 FPS)' | 'Стабильно (30-60 FPS)';
  platforms: string[];
  description: string;
  badge?: string;
  startParam: string;
}

const SERVER_LOCATIONS: ServerLocation[] = [
  {
    id: 'helsinki',
    city: 'Хельсинки',
    country: 'Финляндия',
    flag: '🇫🇮',
    region: 'eu',
    coords: { x: 550, y: 140 },
    ping: 9,
    jitter: 0.3,
    bandwidth: '10 Gbps',
    uptime: '99.99%',
    obsSuitability: 'Идеально (60 FPS)',
    platforms: ['OnlyFans', 'StripChat', 'Chaturbate', 'Fansly'],
    description: 'Минимальный физический маршрут из РФ и СНГ. Нулевая задержка чата и мгновенный отклик интерактивных игрушек (Lovense).',
    badge: 'Рекордный пинг: 9ms',
    startParam: 'loc_helsinki',
  },
  {
    id: 'amsterdam',
    city: 'Амстердам',
    country: 'Нидерланды',
    flag: '🇳🇱',
    region: 'eu',
    coords: { x: 495, y: 175 },
    ping: 13,
    jitter: 0.4,
    bandwidth: '10 Gbps',
    uptime: '100%',
    obsSuitability: 'Идеально (60 FPS)',
    platforms: ['OnlyFans CDN', 'StripChat Live', 'BongaCams'],
    description: 'Главный видео-инжест Европы. Прямой пиринг с CDN серверами вебкам-платформ без промежуточных провайдеров.',
    badge: 'Топ выбор для OnlyFans',
    startParam: 'loc_amsterdam',
  },
  {
    id: 'frankfurt',
    city: 'Франкфурт',
    country: 'Германия',
    flag: '🇩🇪',
    region: 'eu',
    coords: { x: 512, y: 192 },
    ping: 16,
    jitter: 0.5,
    bandwidth: '10 Gbps',
    uptime: '99.98%',
    obsSuitability: 'Идеально (60 FPS)',
    platforms: ['Chaturbate RTMP', 'Fansly Ingest', 'StripChat'],
    description: 'Крупнейшая точка обмена трафиком DE-CIX. Выдерживает трансляции в 4K с битрейтом до 12 000 kbps без единого дропа кадров.',
    badge: 'Узел DE-CIX 10G',
    startParam: 'loc_frankfurt',
  },
  {
    id: 'stockholm',
    city: 'Стокгольм',
    country: 'Швеция',
    flag: '🇸🇪',
    region: 'eu',
    coords: { x: 532, y: 148 },
    ping: 14,
    jitter: 0.4,
    bandwidth: '10 Gbps',
    uptime: '99.99%',
    obsSuitability: 'Идеально (60 FPS)',
    platforms: ['OnlyFans', 'Telegram Private', 'Fansly'],
    description: 'Строжайшая юрисдикция защиты приватности. Полное отсутствие логов на уровне дата-центра и аппаратное шифрование в RAM.',
    badge: '100% no-logs юрисдикция',
    startParam: 'loc_stockholm',
  },
  {
    id: 'warsaw',
    city: 'Варшава',
    country: 'Польша',
    flag: '🇵🇱',
    region: 'eu',
    coords: { x: 538, y: 188 },
    ping: 19,
    jitter: 0.6,
    bandwidth: '10 Gbps',
    uptime: '99.97%',
    obsSuitability: 'Отлично (60 FPS)',
    platforms: ['StripChat', 'Fansly', 'CamSoda'],
    description: 'Надежный резервный маршрут для стриминга. Автоматическое переключение при перегрузках центральноевропейских каналов.',
    startParam: 'loc_warsaw',
  },
  {
    id: 'istanbul',
    city: 'Стамбул',
    country: 'Турция',
    flag: '🇹🇷',
    region: 'anti_jam',
    coords: { x: 580, y: 242 },
    ping: 28,
    jitter: 1.1,
    bandwidth: '10 Gbps',
    uptime: '99.95%',
    obsSuitability: 'Отлично (60 FPS)',
    platforms: ['Все платформы', 'Мобильный стриминг'],
    description: 'Специальный сервер с усиленным обходом глушилок сотовой связи и ТСПУ. Маскирует трафик даже при агрессивных белых списках провайдеров.',
    badge: 'Обход глушилок',
    startParam: 'loc_istanbul',
  },
  {
    id: 'miami',
    city: 'Майами',
    country: 'США (Флорида)',
    flag: '🇺🇸',
    region: 'us',
    coords: { x: 250, y: 255 },
    ping: 86,
    jitter: 1.6,
    bandwidth: '10 Gbps',
    uptime: '99.96%',
    obsSuitability: 'Стабильно (30-60 FPS)',
    platforms: ['OnlyFans US Ingest', 'Fansly Direct'],
    description: 'Прямой трансатлантический маршрут для работы с американскими платежными шлюзами и моментальной загрузки тяжелых 4K сетов.',
    badge: 'Прямой доступ в США',
    startParam: 'loc_miami',
  },
];

interface ServerMapSectionProps {
  settings: SiteSettings;
}

export const ServerMapSection: React.FC<ServerMapSectionProps> = ({ settings }) => {
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(SERVER_LOCATIONS[0]);
  const [hoveredServer, setHoveredServer] = useState<ServerLocation | null>(null);
  const [filter, setFilter] = useState<'all' | 'eu' | 'anti_jam' | 'us'>('all');
  const [isSimulatingTest, setIsSimulatingTest] = useState(false);
  const [livePings, setLivePings] = useState<Record<string, number>>({});

  // Active server being viewed in detail
  const active = hoveredServer || selectedServer;

  // Simulate subtle real-time micro-fluctuations for realistic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePings((prev) => {
        const next: Record<string, number> = { ...prev };
        SERVER_LOCATIONS.forEach((srv) => {
          const delta = (Math.random() - 0.5) * 1.4;
          next[srv.id] = Math.max(5, Math.round((srv.ping + delta) * 10) / 10);
        });
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const handleRunSpeedtest = () => {
    setIsSimulatingTest(true);
    setTimeout(() => {
      setIsSimulatingTest(false);
    }, 1200);
  };

  const filteredServers = SERVER_LOCATIONS.filter((s) => {
    if (filter === 'all') return true;
    return s.region === filter;
  });

  return (
    <section id="servers" className="py-20 sm:py-28 relative overflow-hidden bg-[#0a0e17] border-y border-gray-800/80">
      {/* Background cyber grid & glow */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #A8B5A0 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#A8B5A0]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131b26] border border-[#A8B5A0]/30 text-xs sm:text-sm font-mono text-[#A8B5A0] mb-4 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#A8B5A0]" />
            <span>Инфраструктура AdultVPN • 10 Gbps Uplink</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
            Серверная сеть без дропов в OBS
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-400 leading-relaxed font-sans">
            Прямые каналы до видео-инжестов <span className="text-[#A8B5A0] font-medium">OnlyFans, StripChat, Chaturbate и Fansly</span>. 
            Минимальный джиттер (&lt;1 ms) исключает зависание стрима посреди приватной трансляции.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                filter === 'all'
                  ? 'bg-[#A8B5A0] text-[#0b0f19] font-bold shadow-md shadow-[#A8B5A0]/20'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              Все локации ({SERVER_LOCATIONS.length})
            </button>
            <button
              onClick={() => setFilter('eu')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                filter === 'eu'
                  ? 'bg-[#A8B5A0] text-[#0b0f19] font-bold shadow-md shadow-[#A8B5A0]/20'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              Европа • Минимальный пинг (9-19 ms)
            </button>
            <button
              onClick={() => setFilter('anti_jam')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                filter === 'anti_jam'
                  ? 'bg-[#A8B5A0] text-[#0b0f19] font-bold shadow-md shadow-[#A8B5A0]/20'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              🛡️ Обход глушилок & ТСПУ
            </button>
            <button
              onClick={() => setFilter('us')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                filter === 'us'
                  ? 'bg-[#A8B5A0] text-[#0b0f19] font-bold shadow-md shadow-[#A8B5A0]/20'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              🇺🇸 США (Трансатлантика)
            </button>
          </div>
        </div>

        {/* Main Grid: Interactive Map + Active Server Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive World Map Canvas (7 cols on lg) */}
          <div className="lg:col-span-8 bg-[#0e1420]/90 rounded-2xl border border-gray-800 p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-gray-300">Live Topology Map</span>
                <span className="text-[11px] text-gray-500 hidden sm:inline">• Наведи на точку для замера пинга</span>
              </div>
              <button
                onClick={handleRunSpeedtest}
                disabled={isSimulatingTest}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-[#A8B5A0] hover:border-[#A8B5A0]/40 transition-colors disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 text-[#A8B5A0] ${isSimulatingTest ? 'animate-spin' : ''}`} />
                <span>{isSimulatingTest ? 'Замер пинга...' : 'Тест отклика'}</span>
              </button>
            </div>

            {/* SVG Map Container */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden bg-[#090d16] border border-gray-800/60 flex items-center justify-center">
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Cyber Grid Pattern */}
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
                  </pattern>

                  {/* Radial glow for selected node */}
                  <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#A8B5A0" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#A8B5A0" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#A8B5A0" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Grid background */}
                <rect width="1000" height="500" fill="url(#mapGrid)" />

                {/* Latitude & Longitude helper curves */}
                <g stroke="rgba(168, 181, 160, 0.08)" strokeWidth="0.7" fill="none" strokeDasharray="3 4">
                  <line x1="0" y1="125" x2="1000" y2="125" />
                  <line x1="0" y1="250" x2="1000" y2="250" />
                  <line x1="0" y1="375" x2="1000" y2="375" />
                  <line x1="250" y1="0" x2="250" y2="500" />
                  <line x1="500" y1="0" x2="500" y2="500" />
                  <line x1="750" y1="0" x2="750" y2="500" />
                </g>

                {/* World Map Continent Outlines (Stylized High-Tech Vector Silhouettes) */}
                <g fill="#141c28" stroke="#1d283a" strokeWidth="1" opacity="0.85">
                  {/* North America */}
                  <path d="M 120 70 L 260 70 L 310 110 L 330 160 L 280 200 L 290 240 L 240 270 L 210 240 L 160 210 L 140 140 Z" />
                  {/* Central America bridge */}
                  <path d="M 240 270 L 255 300 L 245 320 L 235 300 Z" />
                  {/* South America */}
                  <path d="M 260 320 L 330 350 L 340 410 L 290 480 L 260 440 L 250 370 Z" />
                  {/* Europe & Scandinavia */}
                  <path d="M 450 120 L 530 100 L 580 130 L 560 170 L 580 230 L 510 240 L 460 210 L 450 160 Z" />
                  {/* UK & Ireland */}
                  <circle cx="465" cy="165" r="10" />
                  {/* Africa */}
                  <path d="M 470 250 L 580 250 L 610 320 L 570 420 L 520 440 L 480 340 L 460 280 Z" />
                  {/* Asia / Eurasia */}
                  <path d="M 580 120 L 800 110 L 860 180 L 840 270 L 760 300 L 680 270 L 640 220 L 580 200 Z" />
                  {/* Australia */}
                  <path d="M 780 350 L 870 350 L 880 420 L 800 430 Z" />
                </g>

                {/* Optical Fiber Backbone Lines Connecting Key Hubs */}
                <g stroke="#A8B5A0" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" fill="none">
                  {/* Helsinki -> Stockholm */}
                  <line x1="550" y1="140" x2="532" y2="148" />
                  {/* Stockholm -> Amsterdam */}
                  <line x1="532" y1="148" x2="495" y2="175" />
                  {/* Amsterdam -> Frankfurt */}
                  <line x1="495" y1="175" x2="512" y2="192" />
                  {/* Frankfurt -> Warsaw */}
                  <line x1="512" y1="192" x2="538" y2="188" />
                  {/* Frankfurt -> Istanbul */}
                  <line x1="512" y1="192" x2="580" y2="242" />
                  {/* Transatlantic Amsterdam -> Miami */}
                  <path d="M 495 175 Q 360 160 250 255" />
                </g>

                {/* Animated Pulsing Light Packet on Transatlantic Cable */}
                <circle r="2.5" fill="#A8B5A0">
                  <animateMotion
                    path="M 495 175 Q 360 160 250 255"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Server Hotspots / Markers */}
                {SERVER_LOCATIONS.map((srv) => {
                  const isHovered = hoveredServer?.id === srv.id;
                  const isSelected = selectedServer.id === srv.id;
                  const isActive = isHovered || isSelected;
                  const currentPing = livePings[srv.id] || srv.ping;

                  return (
                    <g
                      key={srv.id}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredServer(srv)}
                      onMouseLeave={() => setHoveredServer(null)}
                      onClick={() => setSelectedServer(srv)}
                    >
                      {/* Outer pulse ring for active node */}
                      {isActive && (
                        <>
                          <circle
                            cx={srv.coords.x}
                            cy={srv.coords.y}
                            r="28"
                            fill="url(#beaconGlow)"
                            className="animate-pulse"
                          />
                          <circle
                            cx={srv.coords.x}
                            cy={srv.coords.y}
                            r="18"
                            fill="none"
                            stroke="#A8B5A0"
                            strokeWidth="1.5"
                            opacity="0.8"
                          >
                            <animate
                              attributeName="r"
                              from="6"
                              to="24"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.9"
                              to="0"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      )}

                      {/* Base Radar Beacon Dot */}
                      <circle
                        cx={srv.coords.x}
                        cy={srv.coords.y}
                        r={isActive ? 6 : 4}
                        fill={isActive ? '#A8B5A0' : '#4b5563'}
                        stroke="#0b0f19"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />

                      {/* On-Map Floating Micro-Badge */}
                      <g
                        transform={`translate(${srv.coords.x + 8}, ${srv.coords.y - 12})`}
                        className="pointer-events-none"
                      >
                        <rect
                          x="0"
                          y="0"
                          width={isActive ? 76 : 56}
                          height={isActive ? 22 : 18}
                          rx="4"
                          fill={isActive ? '#131b26' : '#0b0f19'}
                          stroke={isActive ? '#A8B5A0' : '#374151'}
                          strokeWidth="1"
                        />
                        <text
                          x="6"
                          y={isActive ? 15 : 13}
                          fill={isActive ? '#A8B5A0' : '#9ca3af'}
                          fontSize={isActive ? 11 : 9.5}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {currentPing}ms
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Bottom Map Legend */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-gray-400 bg-[#0b0f19]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#A8B5A0]"></span>
                    <span>10G Backbone</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>VLESS Reality</span>
                  </span>
                </div>
                <span className="text-gray-500 hidden sm:inline">
                  Текущий выбор: <strong className="text-white">{active.city} ({active.ping} ms)</strong>
                </span>
              </div>
            </div>

            {/* Quick Location Pills under map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {filteredServers.map((srv) => {
                const isSelected = selectedServer.id === srv.id;
                const currentPing = livePings[srv.id] || srv.ping;

                return (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedServer(srv)}
                    onMouseEnter={() => setHoveredServer(srv)}
                    onMouseLeave={() => setHoveredServer(null)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#131b26] border-[#A8B5A0] shadow-md shadow-[#A8B5A0]/10'
                        : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{srv.flag}</span>
                      <div className="truncate">
                        <div className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {srv.city}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {srv.country}
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className={`text-xs font-mono font-bold ${currentPing < 20 ? 'text-emerald-400' : 'text-[#A8B5A0]'}`}>
                        {currentPing}ms
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Server Details Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#131b26] to-[#0c121c] rounded-2xl border border-[#A8B5A0]/30 p-6 shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {active.uptime}
              </span>
            </div>

            {/* City Title & Flag */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl p-2 rounded-xl bg-gray-900/80 border border-gray-800 shadow-sm">
                {active.flag}
              </span>
              <div>
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <span>{active.city}</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono">{active.country} • VLESS Reality</p>
              </div>
            </div>

            {active.badge && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#A8B5A0]/15 text-[#A8B5A0] border border-[#A8B5A0]/30 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#A8B5A0]" />
                <span>{active.badge}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 font-sans">
              {active.description}
            </p>

            {/* Live Streaming Metrics Card */}
            <div className="space-y-3 bg-[#0b0f19]/80 rounded-xl p-4 border border-gray-800/80 mb-6 font-mono">
              {/* Latency */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-800/60">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Activity className="w-4 h-4 text-[#A8B5A0]" />
                  <span>Пинг (Latency):</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-emerald-400">
                    {livePings[active.id] || active.ping}
                  </span>
                  <span className="text-xs text-gray-400">ms</span>
                </div>
              </div>

              {/* Jitter */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-800/60">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Джиттер (разброс):</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-white">
                    ±{active.jitter}
                  </span>
                  <span className="text-xs text-gray-400">ms</span>
                </div>
              </div>

              {/* Bandwidth */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-800/60">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Канал сервера:</span>
                </div>
                <span className="text-xs font-bold text-gray-200">
                  {active.bandwidth} Dedicated
                </span>
              </div>

              {/* OBS Studio Status */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-[#A8B5A0]" />
                  <span>OBS 1080p60:</span>
                </div>
                <span className="text-xs font-bold text-[#A8B5A0]">
                  {active.obsSuitability}
                </span>
              </div>
            </div>

            {/* Platforms with direct peering */}
            <div className="mb-6">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                Прямой пиринг к платформам:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {active.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-900 border border-gray-800 text-gray-300"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Connect Action */}
            <a
              href={buildTelegramLink(settings.botUsername, active.startParam)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-bold text-sm shadow-lg shadow-[#A8B5A0]/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Подключить {active.city} в боте</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-gray-400 text-center mt-2.5 font-mono">
              ⭐ Ключ VLESS выдается мгновенно в @{settings.botUsername}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
