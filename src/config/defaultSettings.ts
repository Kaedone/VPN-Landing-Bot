import { PricingPlan, SiteSettings } from '../types/vpn';

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan_7d',
    name: '7 дней',
    duration: '7 дней',
    price: 79,
    currency: '₽',
    periodLabel: 'за 7 дней',
    devices: 3,
    trafficHighlight: 'Полный безлимит + ГБ обхода глушилок',
    features: [
      '3 устройства одновременно',
      'Полный безлимит на скоростных серверах',
      'ГБ для обхода белых списков и глушилок',
      'Kill Switch в клиентах Happ и INCY',
      'Протокол VLESS Reality (маскировка трафика)',
    ],
  },
  {
    id: 'plan_30d',
    name: '30 дней',
    duration: '30 дней',
    price: 199,
    currency: '₽',
    periodLabel: 'за месяц',
    devices: 3,
    popular: true,
    badge: 'Выбор стримеров',
    trafficHighlight: 'Полный безлимит + ГБ обхода глушилок',
    features: [
      '3 устройства (ПК для стрима + телефон + планшет)',
      'Полный безлимит на скоростных серверах',
      'ГБ для обхода белых списков и глушилок',
      'Высокий битрейт для OBS / 1080p / 4K',
      'Kill Switch защита от обрыва связи',
      'Оплата через Telegram Stars без выписок банка',
    ],
  },
  {
    id: 'plan_90d',
    name: '90 дней',
    duration: '90 дней',
    price: 499,
    currency: '₽',
    periodLabel: 'за 3 месяца',
    devices: 3,
    trafficHighlight: 'Полный безлимит + ГБ обхода глушилок',
    features: [
      '3 устройства одновременно',
      'Полный безлимит на скоростных серверах',
      'ГБ для обхода глушилок',
      'Выделенный приоритетный трафик',
      'Kill Switch в Happ и INCY',
      'Экономия по сравнению с помесячной оплатой',
    ],
  },
  {
    id: 'plan_180d',
    name: '180 дней',
    duration: '180 дней',
    price: 899,
    currency: '₽',
    periodLabel: 'за полгода',
    devices: 3,
    trafficHighlight: 'Полный безлимит + ГБ обхода глушилок',
    features: [
      '3 устройства одновременно',
      'Полный безлимит на всех локациях',
      'Расширенный пакет обхода глушилок',
      'Приоритетный пинг для трансляций',
      'Поддержка всех платформ (Windows, macOS, iOS, Android)',
    ],
  },
  {
    id: 'plan_365d',
    name: '365 дней',
    duration: '365 дней',
    price: 1499,
    currency: '₽',
    periodLabel: 'за год (~125 ₽/мес)',
    devices: 3,
    badge: 'Максимальная скидка',
    trafficHighlight: 'Полный безлимит + максимальный пакет обхода',
    features: [
      '3 устройства на целый год',
      'Всего ~125 ₽ в месяц',
      'Полный безлимит 24/7',
      'Максимальный пакет обхода глушилок и блокировок РКН',
      'Личный приоритет при обращениях в бот',
      'Пожизненная фиксация цены',
    ],
  },
  {
    id: 'plan_family',
    name: '👥 Семейный тариф',
    duration: '30 дней',
    price: 349,
    currency: '₽',
    periodLabel: 'за месяц',
    devices: 5,
    type: 'special',
    badge: 'Для команды / студии',
    trafficHighlight: '5 устройств • 100 ГБ обхода (БС)',
    features: [
      '5 устройств одновременно (для студии, команды или всей семьи)',
      '100 ГБ скоростного обхода глушилок (БС)',
      'Полный безлимит на обычных серверах',
      'Независимые подключения на каждое устройство',
      'Абсолютная конфиденциальность каждого потока',
    ],
  },
  {
    id: 'plan_bypass_only',
    name: '⚪ Только обход глушилок',
    duration: 'Гибкий срок',
    price: 139,
    currency: '₽',
    periodLabel: 'пакет 15 ГБ',
    devices: 2,
    type: 'special',
    badge: 'Специальный пакет',
    trafficHighlight: '2 устройства • 15 ГБ',
    features: [
      '2 устройства одновременно',
      '15 ГБ специализированного трафика обхода глушилок',
      'Пробивает жесткие фильтры мобильных операторов и белые списки',
      'Работает там, где все остальные VPN блокируются намертво',
    ],
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'AdultVPN',
  botUsername: 'AdultVPN_bot',
  defaultStartParam: 'landing',
  announcementText: '🔥 Работает без перебоев на мобильном интернете и домашних провайдерах. Оплата анонимно через Telegram Stars ⭐',
  showAnnouncement: true,
  supportLink: 'https://t.me/AdultVPN_bot?start=support',
  pricing: DEFAULT_PRICING_PLANS,
};

const STORAGE_KEY = 'adult_vpn_settings_v1';

export function loadSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      pricing: Array.isArray(parsed.pricing) && parsed.pricing.length > 0 ? parsed.pricing : DEFAULT_PRICING_PLANS,
    };
  } catch (e) {
    console.error('Failed to load saved settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function resetSiteSettings(): SiteSettings {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_SETTINGS;
}

export function buildTelegramLink(botUsername: string, startParam?: string): string {
  const cleanUsername = botUsername.replace(/^@/, '').trim() || 'AdultVPN_bot';
  const param = startParam?.trim() || 'landing';
  return `https://t.me/${cleanUsername}?start=${encodeURIComponent(param)}`;
}
