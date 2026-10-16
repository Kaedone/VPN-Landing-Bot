import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  History,
  Timer,
} from 'lucide-react';
import { SiteSettings, PricingPlan } from '../types/vpn';
import { buildTelegramLink } from '../config/defaultSettings';

interface AdminPageProps {
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
  onBack: () => void;
}

const TOKEN_STORAGE_KEY = 'adultvpn_admin_jwt';
const LOCKOUT_STORAGE_KEY = 'adultvpn_admin_lockout_until';

export const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate limit lockout state
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = sessionStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!stored) return 0;
    const unlockAtMs = parseInt(stored, 10);
    const diff = Math.ceil((unlockAtMs - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  // Settings form state
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'history' | 'backup'>('general');
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [settingsVersion, setSettingsVersion] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password confirmation modal for critical bot link change
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // History list
  const [historyList, setHistoryList] = useState<
    { id: number; version: number; data: SiteSettings; savedAt: number }[]
  >([]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem(LOCKOUT_STORAGE_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Check existing session via HttpOnly cookie on mount
  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Unauthenticated');
      })
      .then((data) => {
        setIsAuthenticated(true);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
        loadServerSettings();
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const loadServerSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.version) {
          setFormData(json.data);
          setSettingsVersion(json.version);
        }
      }
    } catch (e) {
      console.error('Failed to load server settings:', e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/settings/history', {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setHistoryList(json.history || []);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    if (!passwordInput.trim()) {
      setAuthError('Введите пароль администратора');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }

      if (res.status === 200) {
        setIsAuthenticated(true);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
        setPasswordInput('');
        setAuthError('');
        loadServerSettings();
      } else if (res.status === 429) {
        const retryAfter = data.retryAfter || 900;
        setLockoutSeconds(retryAfter);
        const unlockMs = Date.now() + retryAfter * 1000;
        sessionStorage.setItem(LOCKOUT_STORAGE_KEY, String(unlockMs));
        setAuthError(data.error || 'Слишком много попыток. Вход заблокирован на 15 минут.');
      } else if (res.status === 503) {
        setAuthError(data.error || 'Серверная конфигурация безопасности не завершена (ADMIN_PASSWORD_HASH не задан).');
      } else if (res.status === 401) {
        setAuthError(data.error || 'Неверный пароль администратора');
      } else if (res.status === 403) {
        setAuthError(data.error || 'Доступ запрещен (ошибка проверки Origin)');
      } else {
        setAuthError(data.error || `Ошибка сервера (${res.status})`);
      }
    } catch (err: any) {
      setAuthError(`Ошибка сети: ${err?.message || 'не удалось связаться с сервером'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCsrfToken(null);
    setPasswordInput('');
  };

  const handleSave = async (confirmedPassword?: string) => {
    setSaveError('');
    setSaveSuccess(false);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          version: settingsVersion,
          data: formData,
          confirmPassword: confirmedPassword,
        }),
      });

      const result = await res.json();

      if (res.status === 200 && result.success) {
        setSettingsVersion(result.version);
        onSave(result.data || formData);
        setSaveSuccess(true);
        setShowConfirmModal(false);
        setConfirmPasswordInput('');
        setConfirmPasswordError('');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else if (res.status === 401 && result.requiresPasswordConfirmation) {
        setShowConfirmModal(true);
      } else if (res.status === 401 && confirmedPassword) {
        setConfirmPasswordError('Неверный пароль подтверждения');
      } else if (res.status === 403) {
        setSaveError('Сессия устарела или неверный CSRF токен. Пожалуйста, обновите страницу.');
      } else if (res.status === 409) {
        setSaveError('Конфликт версий: настройки были изменены в другой вкладке. Обновите страницу.');
      } else {
        setSaveError(result.error || 'Ошибка при сохранении настроек');
      }
    } catch {
      // Fallback local save in dev
      onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleRollback = async (targetVersion: number) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const res = await fetch('/api/settings/rollback', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ targetVersion }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData(data.data);
        setSettingsVersion(data.version);
        onSave(data.data);
        setSaveSuccess(true);
        loadHistory();
      }
    } catch (e) {
      console.error('Failed to rollback:', e);
    }
  };

  const handlePriceFieldChange = (id: string, field: keyof PricingPlan, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
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
            handleSave();
          } else {
            setSaveError('Ошибка: Некорректная структура файла настроек.');
          }
        } catch (err) {
          setSaveError('Ошибка чтения JSON файла: ' + (err as Error).message);
        }
      };
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Clean Secure Authentication Screen (NO HINTS, NO DEFAULT CREDENTIALS)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a11] text-[#f3f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A8B5A0] via-emerald-400 to-[#8d9c84]"></div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#131b26] border border-[#A8B5A0]/40 flex items-center justify-center text-[#A8B5A0] shadow-lg shadow-[#A8B5A0]/10">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white font-mono tracking-tight">Панель администратора</h1>
            <p className="text-xs text-gray-400">Авторизация по паролю</p>
          </div>

          {lockoutSeconds > 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-sm font-bold">
                  <Timer className="w-4 h-4 animate-spin" />
                  <span>Вход заблокирован</span>
                </div>
                <p className="text-2xl font-black font-mono text-white tracking-widest">
                  {formatTimer(lockoutSeconds)}
                </p>
                <p className="text-[11px] text-gray-400">
                  Превышен лимит неудачных попыток. Повторите попытку после истечения таймера.
                </p>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Вернуться на сайт</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Пароль"
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#A8B5A0] font-mono tracking-wider text-center text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 mt-2 font-mono text-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#A8B5A0] hover:bg-[#96a48e] text-[#0b0f19] font-bold text-sm shadow-lg shadow-[#A8B5A0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Проверка...' : 'Войти'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Вернуться на сайт</span>
              </button>
            </form>
          )}
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
            <span className="font-mono">← На сайт</span>
          </button>
          <div className="h-5 w-px bg-gray-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-white text-base sm:text-lg tracking-tight">
              {formData.brandName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A8B5A0]/20 text-[#A8B5A0] border border-[#A8B5A0]/30 uppercase font-semibold">
              v{settingsVersion}
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

          {saveError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>{saveError}</span>
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
            title="Выйти из сессии"
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
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#131b26] text-[#A8B5A0] border border-[#A8B5A0]/40 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>История версий</span>
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
            <span>Резервная копия & Экспорт</span>
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
                <label className="block text-xs font-mono text-gray-300 mb-1.5">
                  Юзернейм бота в Telegram{' '}
                  <span className="text-amber-400 font-sans text-[11px]">(требует подтверждения паролем)</span>
                </label>
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
                <label className="block text-xs font-mono text-gray-300 mb-1.5">
                  Стартовый реферальный параметр бота
                </label>
                <input
                  type="text"
                  value={formData.defaultStartParam}
                  onChange={(e) => setFormData({ ...formData, defaultStartParam: e.target.value })}
                  placeholder="landing"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />
                <p className="text-[11px] text-gray-500 font-mono mt-1">
                  Генерирует ссылку вида: {buildTelegramLink(formData.botUsername, formData.defaultStartParam)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">
                  Ссылка на поддержку в Telegram{' '}
                  <span className="text-amber-400 font-sans text-[11px]">(https://t.me/...)</span>
                </label>
                <input
                  type="text"
                  value={formData.supportLink}
                  onChange={(e) => setFormData({ ...formData, supportLink: e.target.value })}
                  placeholder="https://t.me/AdultVPN_bot?start=support"
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
                        onChange={(e) => handlePriceFieldChange(plan.id, 'badge', e.target.value || undefined)}
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

        {/* Tab 3: History & Rollback */}
        {activeTab === 'history' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <History className="w-5 h-5 text-[#A8B5A0]" />
                <span>История изменений и мгновенный откат</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Сервер сохраняет до 20 последних ревизий настроек для защиты от случайных ошибок
              </p>
            </div>

            {historyList.length === 0 ? (
              <p className="text-xs text-gray-400 font-mono">
                История пока пуста. При сохранении настроек здесь появятся ревизии.
              </p>
            ) : (
              <div className="space-y-3">
                {historyList.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">Версия {entry.version}</span>
                        <span className="text-[11px] font-mono text-gray-500">
                          {new Date(entry.savedAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Бренд: {entry.data.brandName} • Бот: @{entry.data.botUsername} • Тарифов:{' '}
                        {entry.data.pricing.length}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRollback(entry.version)}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-[#A8B5A0] hover:text-[#0b0f19] text-xs font-mono text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Откатить</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Backup & Export */}
        {activeTab === 'backup' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Download className="w-5 h-5 text-[#A8B5A0]" />
                <span>Резервная копия и экспорт</span>
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
                  Загрузите ранее сохранённый JSON-файл для применения настроек.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Выбрать JSON-файл</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Confirmation Modal for critical bot link change */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-white text-base">Подтверждение паролем</h3>
                <p className="text-xs text-gray-400">Изменение ссылки или юзернейма бота</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Вы меняете целевую ссылку на бота в Telegram. Для защиты от подмены ссылок введите пароль администратора:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(confirmPasswordInput);
              }}
              className="space-y-4"
            >
              <div>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => {
                    setConfirmPasswordInput(e.target.value);
                    setConfirmPasswordError('');
                  }}
                  placeholder="Пароль администратора"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#A8B5A0] font-mono text-sm"
                />

                {confirmPasswordError && (
                  <p className="text-xs text-red-400 font-mono mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{confirmPasswordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmPasswordInput('');
                    setConfirmPasswordError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#A8B5A0] hover:bg-[#96a48e] text-[#0b0f19] font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  Подтвердить и сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
