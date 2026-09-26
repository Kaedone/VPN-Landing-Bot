export interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: string;
  period: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  botUsername: string;
  provider: {
    name: string;
    policyUrl: string;
    compatibility: string[];
  };
  pricing: PricingPlan[];
  links: {
    telegramBot: string;
    telegramWeb: string;
    iphey: string;
    dnsleaktest: string;
  };
}

export const siteConfig: SiteConfig = {
  title: "HAPP VPN — Твой трафик никто не видит",
  description: "Приватный VPN для авторов контента и стримеров. Защита от утечек IP, Kill Switch, 10+ локаций. Работает там, где другие падают.",
  url: "https://vpn-landing.pages.dev",
  botUsername: "happ_vpn_bot",
  provider: {
    name: "HAPP VPN",
    policyUrl: "https://t.me/",
    compatibility: ["Hiddify", "v2rayN", "Nekoray", "Streisand", "Happ Client"]
  },
  links: {
    telegramBot: "https://t.me/happ_vpn_bot?start=landing",
    telegramWeb: "https://web.telegram.org/k/#@happ_vpn_bot",
    iphey: "https://iphey.com",
    dnsleaktest: "https://dnsleaktest.com"
  },
  pricing: [
    {
      id: "trial",
      name: "Тест",
      duration: "3 дня",
      price: "0 ₽",
      period: "бесплатно",
      badge: "Без автопродления",
      features: ["Все 10+ локаций", "Без ограничения скорости", "Kill Switch инструкция", "Ручной выбор (без подписки)"]
    },
    {
      id: "1m",
      name: "Месяц",
      duration: "30 дней",
      price: "290 ₽",
      period: "в месяц",
      features: ["Все 10+ локаций", "Максимальная скорость", "Поддержка стримов", "Приоритетный бот поддержки"]
    },
    {
      id: "3m",
      name: "Квартал",
      duration: "90 дней",
      price: "750 ₽",
      period: "за 3 месяца",
      badge: "Экономия 15%",
      popular: true,
      features: ["Все 10+ локаций", "Максимальная скорость", "Стабильный IP", "Выделенный канал"]
    },
    {
      id: "12m",
      name: "Год",
      duration: "365 дней",
      price: "2490 ₽",
      period: "за год",
      badge: "Лучшая цена",
      features: ["Все 10+ локаций", "Максимальная экономия (~200₽/мес)", "Личный менеджер в боте", "Пожизненная гарантия соединения"]
    }
  ]
};

export function getTgLink(action: string = 'landing'): string {
  return `https://t.me/${siteConfig.botUsername}?start=${action}`;
}
