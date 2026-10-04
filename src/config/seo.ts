export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  ogSiteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

export const DEFAULT_SEO: Required<Omit<SEOProps, 'noindex' | 'canonicalUrl'>> = {
  title: 'AdultVPN — Защищенный VPN для моделей, стримеров и создателей контента',
  description:
    'Приватный VPN для авторов OnlyFans, Fansly, StripChat и вебкам-моделей. Защита от деанона, Kill Switch в клиентах Happ и INCY, стабильный стриминг без утечек IP.',
  keywords: [
    'VPN для моделей',
    'VPN для стримеров',
    'OnlyFans VPN',
    'Fansly VPN',
    'StripChat VPN',
    'Kill Switch VPN',
    'VLESS Reality',
    'Happ клиент',
    'INCY клиент',
    'защита от деанона',
    'Telegram VPN бот',
  ],
  ogTitle: 'AdultVPN — Защищенный VPN для моделей, стримеров и создателей контента',
  ogDescription:
    'Приватный VPN для авторов OnlyFans, Fansly, StripChat и вебкам-моделей. Защита от деанона, Kill Switch в клиентах Happ и INCY, стабильный стриминг без утечек IP.',
  ogImage: '/og-image.png',
  ogType: 'website',
  ogSiteName: 'AdultVPN',
  twitterCard: 'summary_large_image',
  twitterTitle: 'AdultVPN — Защищенный VPN для моделей, стримеров и создателей контента',
  twitterDescription:
    'Приватный VPN для авторов OnlyFans, Fansly, StripChat и вебкам-моделей. Защита от деанона, Kill Switch в клиентах Happ и INCY, стабильный стриминг без утечек IP.',
  twitterImage: '/og-image.png',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AdultVPN',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Windows, macOS, iOS, Android, Linux',
    description:
      'Персональный Telegram VPN-бот с поддержкой протоколов VLESS Reality и WireGuard, аварийной блокировкой Kill Switch и защитой от деанонимизации для контент-мейкеров.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: '79',
      highPrice: '1499',
      offerCount: '6',
    },
    featureList: [
      'Kill Switch в клиентах Happ и INCY',
      'Протокол VLESS Reality с маскировкой трафика под TLS',
      'Оплата анонимно через Telegram Stars без банковских выписок',
      'Выделенный битрейт для OBS и 4K стриминга',
    ],
  },
};
