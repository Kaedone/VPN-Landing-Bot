import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  KeyRound,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { SiteSettings, PricingPlan } from '../types/vpn';
import { resetSiteSettings, buildTelegramLink } from '../config/defaultSettings';

interface AdminPageProps {
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
  onBack: () => void;
}

const PIN_STORAGE_KEY = 'adultvpn_admin_pin';
const AUTH_STORAGE_KEY = 'adultvpn_admin_authenticated';
const DEFAULT_PIN = 'admin2026';

export const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // New PIN management
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState({ text: '', type: '' });

  // Settings form state
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'security' | 'backup'>('general');
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const getStoredPin = (): string => {
    if (typeof window === 'undefined') return DEFAULT_PIN;
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = getStoredPin();
    if (pinInput.trim() === storedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setPinError('');
    } else {
      setPinError('Неверный PIN-код администратора');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPinInput('');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePriceFieldChange = (id: string, field: keyof PricingPlan, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMessage({ text: 'PIN-код должен быть не менее 4 символов', type: 'error' });
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinChangeMessage({ text: 'Новые PIN-коды не совпадают', type: 'error' });
      return;
    }
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    setNewPin('');
    setConfirmNewPin('');
    setPinChangeMessage({ text: 'PIN-код администратора успешно обновлён!', type: 'success' });
    setTimeout(() => setPinChangeMessage({ text: '', type: '' }), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `adultvpn-settings-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.brandName && Array.isArray(parsed.pricing)) {
            setFormData(parsed);
            onSave(parsed);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
          } else {
            alert('Ошибка: Некорректная структура файла настроек.');
          }
        } catch (err) {
          alert('Ошибка чтения JSON файла: ' + (err as Error).message);
        }
      };
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Сбросить все настройки к начальным значениям по умолчанию?')) {
      const def = resetSiteSettings();
      setFormData({ ...def });
      onSave(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // 1. Authorization Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a11] text-[#f3f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A8B5A0] via-emerald-400 to-[#8d9c84]"></div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#131b26] border border-[#A8B5A0]/40 flex items-center justify-center text-[#A8B5A0] shadow-lg shadow-[#A8B5A0]/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white font-mono tracking-tight">Панель администратора</h1>
            <p className="text-xs text-gray-400">
              Вход защищён PIN-кодом для предотвращения несанкционированного доступа
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1.5">PIN-код администратора</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#A8B5A0] font-mono tracking-widest text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pinError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>{pinError}</span>
                </div>
              )}
              <p className="text-[11px] text-gray-500 font-mono mt-2">
                * Стандартный PIN по умолчанию: <code className="text-[#A8B5A0]">admin2026</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#A8B5A0] hover:bg-[#96a48e] text-[#0b0f19] font-bold text-sm shadow-lg shadow-[#A8B5A0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Войти в систему</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-gray-900 text-gray-400 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Вернуться на лендинг</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#070a11] text-[#f3f4f6] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0b0f19]/95 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            title="Вернуться на сайт"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">На сайт</span>
          </button>
          <div className="h-5 w-px bg-gray-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-white text-base sm:text-lg tracking-tight">
              {formData.brandName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A8B5A0]/20 text-[#A8B5A0] border border-[#A8B5A0]/30 uppercase font-semibold">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Сохранено!</span>
            </div>
          )}

          <button
            onClick={() => handleSave()}
            className="px-4 py-2 rounded-xl bg-[#A8B5A0] hover:bg-[#96a48e] text-[#0b0f19] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-[#A8B5A0]/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-900 hover:bg-red-500/10 hover:text-red-400 border border-gray-800 text-gray-400 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Выйти из админки"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Выйти</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#131b26] text-[#A8B5A0] border border-[#A8B5A0]/40 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Брендинг & Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#131b26] text-[#A8B5A0] border border-[#A8B5A0]/40 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Тарифы и цены</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#131b26] text-[#A8B5A0] border border-[#A8B5A0]/40 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>PIN-код доступа</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#131b26] text-[#A8B5A0] border border-[#A8B5A0]/40 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Резервная копия & Сброс</span>
          </button>
        </div>

        {/* Tab 1: General & Telegram */}
        {activeTab === 'general' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#A8B5A0]" />
                <span>Основные настройки сервиса и интеграция с Telegram</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Эти параметры определяют название сайта, юзернейм бота и верхнюю плашку объявлений
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Название бренда</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="AdultVPN"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Юзернейм бота в Telegram</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={formData.botUsername.replace(/^@/, '')}
                    onChange={(e) => setFormData({ ...formData, botUsername: e.target.value.replace(/^@/, '') })}
                    placeholder="adult_vpn_bot"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Стартовый реферальный параметр бота</label>
                <input
                  type="text"
                  value={formData.defaultStartParam}
                  onChange={(e) => setFormData({ ...formData, defaultStartParam: e.target.value })}
                  placeholder="web_funnel_2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
                <p className="text-[11px] text-gray-500 font-mono mt-1">
                  Генерирует ссылку вида: {buildTelegramLink(formData.botUsername, formData.defaultStartParam)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Ссылка на поддержку в Telegram</label>
                <input
                  type="text"
                  value={formData.supportLink}
                  onChange={(e) => setFormData({ ...formData, supportLink: e.target.value })}
                  placeholder="https://t.me/adult_support"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">Верхняя плашка с объявлением (Banner)</h3>
                  <p className="text-xs text-gray-400">Показывается в самой шапке лендинга над навигацией</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAnnouncement}
                    onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#A8B5A0]"></div>
                </label>
              </div>

              {formData.showAnnouncement && (
                <div>
                  <input
                    type="text"
                    value={formData.announcementText}
                    onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                    placeholder="Работает без перебоев на мобильном интернете и домашних провайдерах..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Pricing */}
        {activeTab === 'pricing' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#A8B5A0]" />
                <span>Управление тарифами и ценами</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Цены обновляются мгновенно на лендинге во всех карточках тарифов
              </p>
            </div>

            <div className="space-y-4">
              {formData.pricing.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 md:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-base">{plan.name}</span>
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A8B5A0]/20 text-[#A8B5A0] border border-[#A8B5A0]/30 font-semibold">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{plan.periodLabel}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{plan.trafficHighlight}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:w-2/3">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Цена (₽)</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => handlePriceFieldChange(plan.id, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-sm focus:border-[#A8B5A0] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Бейдж (метка)</label>
                      <input
                        type="text"
                        value={plan.badge || ''}
                        onChange={(e) =>
                          handlePriceFieldChange(plan.id, 'badge', e.target.value || undefined)
                        }
                        placeholder="ХИТ / ВЫГОДНО"
                        className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-xs focus:border-[#A8B5A0] focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300">
                        <input
                          type="checkbox"
                          checked={Boolean(plan.popular)}
                          onChange={(e) => handlePriceFieldChange(plan.id, 'popular', e.target.checked)}
                          className="rounded border-gray-700 text-[#A8B5A0] focus:ring-[#A8B5A0]"
                        />
                        <span>Хит продаж</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security / PIN Code */}
        {activeTab === 'security' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#A8B5A0]" />
                <span>Смена PIN-кода администратора</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Защитите доступ к панели управления персональным PIN-кодом
              </p>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Новый PIN-код</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Минимум 4 символа"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Подтвердите новый PIN-код</label>
                <input
                  type="password"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  placeholder="Повторите ввод"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
              </div>

              {pinChangeMessage.text && (
                <div
                  className={`text-xs font-mono flex items-center gap-2 p-3 rounded-lg ${
                    pinChangeMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {pinChangeMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pinChangeMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-[#A8B5A0] hover:text-[#0b0f19] text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Обновить PIN-код
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Backup & Reset */}
        {activeTab === 'backup' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Download className="w-5 h-5 text-[#A8B5A0]" />
                <span>Резервная копия, экспорт и сброс</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Сохраняйте копию настроек на свой компьютер или восстанавливайте из файла
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#A8B5A0]" />
                  <span>Экспорт настроек в JSON</span>
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Скачивает файл со всеми текущими ценами, юзернеймами бота и параметрами.
                </p>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать JSON-файл</span>
                </button>
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Импорт настроек из JSON</span>
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Загрузите ранее сохранённый JSON-файл для мгновенного применения настроек.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Выбрать JSON-файл</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div>
                  <h4 className="text-sm font-mono font-bold text-red-400">Сброс к заводским настройкам</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Сбрасывает все тарифы, описания и ссылки к исходным значениям приложения.
                  </p>
                </div>
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Сбросить всё</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
