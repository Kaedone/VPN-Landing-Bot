import React, { useState } from 'react';
import { X, Save, RotateCcw, Send, Settings, Check, Sparkles } from 'lucide-react';
import { SiteSettings, PricingPlan } from '../types/vpn';
import { resetSiteSettings, buildTelegramLink } from '../config/defaultSettings';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, newPrice: number) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) => (p.id === id ? { ...p, price: newPrice } : p)),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (confirm('Сбросить все настройки и цены к заводским?')) {
      const def = resetSiteSettings();
      setFormData({ ...def });
      onSave(def);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1500);
    }
  };

  const currentPreviewLink = buildTelegramLink(formData.botUsername, formData.defaultStartParam);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0e1420] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#131b26] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#A8B5A0]/20 text-[#A8B5A0]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Панель управления воронкой</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#A8B5A0]/15 text-[#A8B5A0] border border-[#A8B5A0]/30 font-mono">
                  Owner Admin
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Здесь ты можешь в 1 клик изменить бота, UTM-метку и скорректировать цены тарифов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Telegram Bot Link Config */}
          <div className="space-y-4 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Send className="w-4 h-4 text-[#A8B5A0]" />
              <span>Настройка Telegram-бота</span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Юзернейм бота (без @ или с @):
                </label>
                <input
                  type="text"
                  value={formData.botUsername}
                  onChange={(e) => setFormData({ ...formData, botUsername: e.target.value })}
                  placeholder="AdultVPN_bot"
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white font-mono text-sm focus:border-[#A8B5A0] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Стартовый параметр (по умолчанию):
                </label>
                <input
                  type="text"
                  value={formData.defaultStartParam}
                  onChange={(e) => setFormData({ ...formData, defaultStartParam: e.target.value })}
                  placeholder="landing"
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white font-mono text-sm focus:border-[#A8B5A0] outline-none"
                />
              </div>
            </div>

            {/* Link Preview */}
            <div className="p-3 rounded-lg bg-gray-950 border border-gray-800/80 text-xs font-mono flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-gray-400 shrink-0">Итоговая ссылка:</span>
              <span className="text-[#A8B5A0] truncate">{currentPreviewLink}</span>
            </div>
          </div>

          {/* Announcement Banner Config */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Верхний баннер оповещения
              </label>
              <input
                type="checkbox"
                checked={formData.showAnnouncement}
                onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                className="w-4 h-4 accent-[#A8B5A0] rounded"
              />
            </div>
            {formData.showAnnouncement && (
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white text-xs focus:border-[#A8B5A0] outline-none"
                placeholder="Текст оповещения..."
              />
            )}
          </div>

          {/* Pricing Adjuster */}
          <div className="space-y-4 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#A8B5A0]" />
              <span>Редактирование цен тарифов (₽)</span>
            </h4>
            <p className="text-xs text-gray-400">
              Цены мгновенно обновятся во всех карточках лендинга:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.pricing.map((plan: PricingPlan) => (
                <div key={plan.id} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                  <span className="text-[11px] font-mono text-gray-400 block truncate">
                    {plan.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handlePriceChange(plan.id, Number(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white text-sm font-mono focus:border-[#A8B5A0] outline-none"
                    />
                    <span className="text-xs text-gray-400">₽</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 font-mono transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить к исходным</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Отмена
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#A8B5A0] hover:bg-[#97a58f] text-[#0b0f19] font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#A8B5A0]/20 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Сохранено!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Применить</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
