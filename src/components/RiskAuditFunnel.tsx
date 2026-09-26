import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Send, 
  RotateCcw, 
  Cpu, 
  Globe2, 
  WifiOff, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { SiteSettings, PlatformId, MethodId, FearId, QuizState } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface RiskAuditFunnelProps {
  settings: SiteSettings;
}

interface PlatformOption {
  id: PlatformId;
  name: string;
  tag: string;
}

interface MethodOption {
  id: MethodId;
  name: string;
  desc: string;
  dangerBadge: string;
}

interface FearOption {
  id: FearId;
  name: string;
  desc: string;
}

export const RiskAuditFunnel: React.FC<RiskAuditFunnelProps> = ({ settings }) => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizState>({
    platform: null,
    method: null,
    fear: null,
  });

  const platforms: PlatformOption[] = [
    { id: 'onlyfans', name: 'OnlyFans', tag: 'Подписки & Приваты' },
    { id: 'fansly', name: 'Fansly', tag: 'Контент & Стримы' },
    { id: 'chaturbate', name: 'Chaturbate', tag: 'WebCam трансляции' },
    { id: 'stripchat', name: 'StripChat', tag: 'WebCam трансляции' },
    { id: 'bongacams', name: 'BongaCams', tag: 'WebCam трансляции' },
    { id: 'telegram_private', name: 'Приватный TG канал', tag: 'Платные доступы' },
    { id: 'other', name: 'Другая площадка / Студия', tag: 'Adult медиа' },
  ];

  // Exactly as requested: Зеркала / Shine Browser / Другой VPN
  const methods: MethodOption[] = [
    {
      id: 'mirrors',
      name: 'Зеркала',
      desc: 'Вход через альтернативные домены и прокси без постоянного шифрования',
      dangerBadge: 'Высокий риск фишинга и кражи сессии',
    },
    {
      id: 'shine_browser',
      name: 'Shine Browser',
      desc: 'Специализированный антидетект/браузер со встроенными надстройками',
      dangerBadge: 'Встроенный скрытый криптомайнер + утечки WebRTC',
    },
    {
      id: 'other_vpn',
      name: 'Другой VPN',
      desc: 'Обычный публичный или бесплатный VPN из стора (App Store / Play Market / расширения)',
      dangerBadge: 'Нет Kill Switch для стрима, риск бана и слива IP',
    },
  ];

  // Includes user request: падение стрима, деанон, РКН, полиция/ст. 242
  const fears: FearOption[] = [
    {
      id: 'stream_drop',
      name: 'Падение стрима и потеря донатов',
      desc: 'Разрыв соединения посреди приватной трансляции, зависание OBS и потеря топовых клиентов',
    },
    {
      id: 'ip_deanonymization',
      name: 'Слив реального IP и деанон',
      desc: 'Определение домашнего адреса хейтерами, зрителями или модераторами через утечку WebRTC',
    },
    {
      id: 'legal_police',
      name: 'Внимание органов и ст. 242 УК РФ',
      desc: 'Фиксация трафика провайдером в СОРМ, передача данных по запросам органов',
    },
    {
      id: 'rkn_block',
      name: 'Блокировки РКН посреди работы',
      desc: 'Резкое отключение протокола из-за регулярных блокировок зарубежных серверов',
    },
  ];

  const handleSelectPlatform = (id: PlatformId) => {
    setAnswers((prev) => ({ ...prev, platform: id }));
    setStep(2);
  };

  const handleSelectMethod = (id: MethodId) => {
    setAnswers((prev) => ({ ...prev, method: id }));
    setStep(3);
  };

  const handleSelectFear = (id: FearId) => {
    setAnswers((prev) => ({ ...prev, fear: id }));
    setStep(4);
  };

  const resetQuiz = () => {
    setAnswers({ platform: null, method: null, fear: null });
    setStep(1);
  };

  const calculateRiskScore = () => {
    let score = 75;
    if (answers.method === 'shine_browser') score += 18;
    if (answers.method === 'mirrors') score += 14;
    if (answers.method === 'other_vpn') score += 10;
    if (answers.fear === 'stream_drop') score += 5;
    if (answers.fear === 'legal_police') score += 6;
    return Math.min(score, 98);
  };

  const riskScore = calculateRiskScore();
  const botAuditLink = buildTelegramLink(
    settings.botUsername, 
    `audit_${answers.platform || 'adult'}_${answers.method || 'net'}`
  );

  return (
    <section id="audit" className="py-16 sm:py-24 bg-[#0d131f] border-y border-gray-800/80 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Экспресс-тест безопасности рабочего места</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Проверь, грозит ли тебе <span className="text-red-400">деанон или срыв стрима</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Ответь на 3 вопроса о своем текущем подключении, чтобы мгновенно выявить критические уязвимости.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-[#A8B5A0]'
                    : s < step
                    ? 'w-6 bg-[#A8B5A0]/50'
                    : 'w-4 bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Platform */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-white text-center mb-6">
              Шаг 1 из 3: На какой площадке ты работаешь или стримишь?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlatform(p.id)}
                  className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-[#A8B5A0]/60 hover:bg-gray-850 text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white group-hover:text-[#A8B5A0] transition-colors block text-base">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{p.tag}</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-gray-800 group-hover:bg-[#A8B5A0] group-hover:text-black text-gray-400 flex items-center justify-center text-xs font-bold transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Connection Method (Зеркала / Shine Browser / Другой VPN) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Назад к выбору площадки
              </button>
              <span className="text-xs font-mono text-[#A8B5A0]">Шаг 2 из 3</span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-white text-center mb-2">
              Как ты выходишь в сеть сейчас?
            </h3>
            <p className="text-xs text-gray-400 text-center mb-6">
              Выбери инструмент, который используешь в данный момент для доступа к сайтам и стримам
            </p>

            <div className="space-y-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMethod(m.id)}
                  className="w-full p-4 sm:p-5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-[#A8B5A0]/60 hover:bg-gray-850 text-left transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white group-hover:text-[#A8B5A0] text-lg transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 self-start sm:self-auto">
                      {m.dangerBadge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Biggest Fear / Pain Point */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Назад к способу подключения
              </button>
              <span className="text-xs font-mono text-[#A8B5A0]">Шаг 3 из 3</span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-white text-center mb-2">
              Что больше всего беспокоит во время работы?
            </h3>
            <p className="text-xs text-gray-400 text-center mb-6">
              Главный фактор риска, который мешает спокойно вести трансляции и зарабатывать
            </p>

            <div className="space-y-3">
              {fears.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFear(f.id)}
                  className="w-full p-4 sm:p-5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-[#A8B5A0]/60 hover:bg-gray-850 text-left transition-all group flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white group-hover:text-[#A8B5A0] text-base sm:text-lg transition-colors block">
                      {f.name}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gray-800 group-hover:bg-[#A8B5A0] group-hover:text-black text-gray-300 flex items-center justify-center text-xs font-bold transition-colors mt-1">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Diagnosis Results & Personalized Bridge to Bot */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-400">
            
            {/* Risk Gauge Card */}
            <div className="bg-gradient-to-b from-red-950/40 via-gray-900/90 to-gray-900/90 border border-red-500/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Результаты анализа конфигурации
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Критический уровень уязвимости: <span className="text-red-400">{riskScore}%</span>
                  </h3>
                </div>
                <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold text-center">
                  ТРЕБУЕТСЯ СРОЧНАЯ ИЗОЛЯЦИЯ
                </div>
              </div>

              {/* Specific Vulnerability Callouts based on selections */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">
                  Обнаруженные критические точки:
                </h4>

                {answers.method === 'shine_browser' && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
                    <Cpu className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <strong className="text-white block font-semibold">
                        Угроза: Встроенный скрытый криптомайнер в Shine Browser
                      </strong>
                      <p className="text-gray-400">
                        Shine Browser скрыто утилизирует ресурсы видеокарты и процессора для фонового майнинга. 
                        Это приводит к внезапному перегреву железа, падению FPS и битрейта трансляции в OBS, 
                        а также к неконтролируемым утечкам локальных IP-адресов через протокол WebRTC.
                      </p>
                    </div>
                  </div>
                )}

                {answers.method === 'mirrors' && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
                    <Globe2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <strong className="text-white block font-semibold">
                        Угроза: Фишинг, перехват токенов и деанон через зеркала
                      </strong>
                      <p className="text-gray-400">
                        Зеркала не обеспечивают сквозного шифрования между тобой и платформой. 
                        Твой интернет-провайдер в РФ видит все DNS-запросы и фиксирует активность в базе СОРМ, 
                        а при открытии прямых медиа-потоков домашний IP уходит в открытый доступ.
                      </p>
                    </div>
                  </div>
                )}

                {answers.method === 'other_vpn' && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
                    <WifiOff className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <strong className="text-white block font-semibold">
                        Угроза: Отсутствие аварийного Kill Switch и заезженные IP
                      </strong>
                      <p className="text-gray-400">
                        В обычных VPN при кратком обрыве Wi-Fi соединение падает напрямую на домашнего оператора. 
                        Площадка мгновенно регистрирует твой реальный домашний IP, а зрители или модераторы видят город и провайдера.
                      </p>
                    </div>
                  </div>
                )}

                {answers.fear === 'stream_drop' && (
                  <div className="p-4 rounded-xl bg-[#131b26] border border-[#A8B5A0]/30 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <strong className="text-white block font-semibold">
                        Решение для стримов: Happ и INCY на выделенных 10Gbps каналах
                      </strong>
                      <p className="text-gray-400">
                        VLESS Reality обеспечивает непрерывный стабильный поток 60 FPS в 1080p/4K. 
                        Никаких срывов приватных чатов и потери чаевых.
                      </p>
                    </div>
                  </div>
                )}

                {answers.fear === 'legal_police' && (
                  <div className="p-4 rounded-xl bg-[#131b26] border border-[#A8B5A0]/30 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#A8B5A0] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <strong className="text-white block font-semibold">
                        Защита от органов и проверок: 0 логов + офшорные серверы
                      </strong>
                      <p className="text-gray-400">
                        Трафик маскируется под обычный защищенный просмотр сайтов через протокол Reality. 
                        Провайдер не может зафиксировать посещение adult-ресурсов или факт трансляции.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Box to Telegram */}
              <div className="pt-4 border-t border-gray-800 space-y-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-bold text-white">
                    Забери изолированный VLESS-ключ с Kill Switch для Happ / INCY
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Бот выдаст персональный конфиг и пошаговый гайд по включению Kill Switch за 10 секунд.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={botAuditLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-[#A8B5A0] to-[#8d9c84] text-[#0b0f19] font-black text-center text-base shadow-xl shadow-[#A8B5A0]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-mono"
                  >
                    <Send className="w-5 h-5 fill-current" />
                    <span>Забрать безопасный конфиг в Telegram</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>

                  <button
                    onClick={resetQuiz}
                    className="px-4 py-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-mono transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Пройти заново</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
