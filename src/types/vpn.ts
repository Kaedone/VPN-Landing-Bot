export interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  periodLabel: string;
  devices: number;
  popular?: boolean;
  badge?: string;
  type?: 'regular' | 'special';
  features: string[];
  trafficHighlight: string;
}

export interface SiteSettings {
  brandName: string;
  botUsername: string; // e.g. "AdultVPN_bot"
  defaultStartParam: string;
  announcementText: string;
  showAnnouncement: boolean;
  supportLink: string;
  pricing: PricingPlan[];
}

export type PlatformId =
  'onlyfans' | 'fansly' | 'chaturbate' | 'stripchat' | 'bongacams' | 'telegram_private' | 'other';

export type MethodId = 'mirrors' | 'shine_browser' | 'other_vpn';

export type FearId = 'ip_deanonymization' | 'stream_drop' | 'rkn_block' | 'legal_police';

export interface QuizState {
  platform: PlatformId | null;
  method: MethodId | null;
  fear: FearId | null;
}
