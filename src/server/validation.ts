import { SiteSettings, PricingPlan } from '../types/vpn';
import { isValidBotUsername, isValidTelegramUrl } from './routes';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

/**
 * Validates a single PricingPlan item according to rigorous security & business rules:
 * - id: non-empty string, slug-like alphanumeric with hyphen/underscore, 1..40 chars
 * - name: string, 1..60 chars
 * - duration: non-empty string, 1..30 chars
 * - price: finite non-negative number (0 <= price <= 100,000)
 * - currency: valid currency string (e.g., '₽', 'RUB', 'USD', 'EUR'), 1..10 chars
 * - periodLabel: non-empty string, 1..30 chars
 * - devices: integer, 1..100
 * - popular: optional boolean
 * - badge: optional string, max 30 chars
 * - type: optional 'regular' | 'special'
 * - features: array of non-empty strings (1..20 items, each max 100 chars)
 * - trafficHighlight: non-empty string, max 60 chars
 */
export function validatePricingPlan(plan: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `pricing[${index}]`;

  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    return [{ field: prefix, message: 'Элемент тарифа должен быть объектом' }];
  }

  // id
  if (typeof plan.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(plan.id.trim())) {
    errors.push({
      field: `${prefix}.id`,
      message: 'Идентификатор тарифа должен содержать от 1 до 40 латинских символов, цифр, дефисов или подчеркиваний',
    });
  }

  // name
  if (typeof plan.name !== 'string' || plan.name.trim().length === 0 || plan.name.trim().length > 60) {
    errors.push({
      field: `${prefix}.name`,
      message: 'Название тарифа должно быть строкой длиной от 1 до 60 символов',
    });
  }

  // duration
  if (typeof plan.duration !== 'string' || plan.duration.trim().length === 0 || plan.duration.trim().length > 30) {
    errors.push({
      field: `${prefix}.duration`,
      message: 'Длительность тарифа должна быть строкой от 1 до 30 символов',
    });
  }

  // price
  if (
    typeof plan.price !== 'number' ||
    isNaN(plan.price) ||
    !isFinite(plan.price) ||
    plan.price < 0 ||
    plan.price > 100000
  ) {
    errors.push({
      field: `${prefix}.price`,
      message: 'Цена должна быть числом от 0 до 100 000 ₽',
    });
  }

  // currency
  if (typeof plan.currency !== 'string' || plan.currency.trim().length === 0 || plan.currency.trim().length > 10) {
    errors.push({
      field: `${prefix}.currency`,
      message: 'Валюта должна быть непустой строкой до 10 символов',
    });
  }

  // periodLabel
  if (
    typeof plan.periodLabel !== 'string' ||
    plan.periodLabel.trim().length === 0 ||
    plan.periodLabel.trim().length > 30
  ) {
    errors.push({
      field: `${prefix}.periodLabel`,
      message: 'Период тарифа должен быть непустой строкой до 30 символов',
    });
  }

  // devices
  if (typeof plan.devices !== 'number' || !Number.isInteger(plan.devices) || plan.devices < 1 || plan.devices > 100) {
    errors.push({
      field: `${prefix}.devices`,
      message: 'Количество устройств должно быть целым числом от 1 до 100',
    });
  }

  // popular (optional boolean)
  if (plan.popular !== undefined && typeof plan.popular !== 'boolean') {
    errors.push({
      field: `${prefix}.popular`,
      message: 'Поле popular должно быть булевым значением',
    });
  }

  // badge (optional string)
  if (plan.badge !== undefined && (typeof plan.badge !== 'string' || plan.badge.length > 30)) {
    errors.push({
      field: `${prefix}.badge`,
      message: 'Бейдж тарифа не должен превышать 30 символов',
    });
  }

  // type (optional 'regular' | 'special')
  if (plan.type !== undefined && plan.type !== 'regular' && plan.type !== 'special') {
    errors.push({
      field: `${prefix}.type`,
      message: 'Тип тарифа должен быть regular или special',
    });
  }

  // features (array of strings, 1..20 items)
  if (!Array.isArray(plan.features) || plan.features.length === 0 || plan.features.length > 20) {
    errors.push({
      field: `${prefix}.features`,
      message: 'Список преимуществ тарифа должен содержать от 1 до 20 пунктов',
    });
  } else {
    for (let fIdx = 0; fIdx < plan.features.length; fIdx++) {
      const feat = plan.features[fIdx];
      if (typeof feat !== 'string' || feat.trim().length === 0 || feat.length > 100) {
        errors.push({
          field: `${prefix}.features[${fIdx}]`,
          message: 'Каждый пункт преимуществ должен быть непустой строкой до 100 символов',
        });
        break;
      }
    }
  }

  // trafficHighlight
  if (
    typeof plan.trafficHighlight !== 'string' ||
    plan.trafficHighlight.trim().length === 0 ||
    plan.trafficHighlight.length > 60
  ) {
    errors.push({
      field: `${prefix}.trafficHighlight`,
      message: 'Выделение трафика должно быть строкой длиной от 1 до 60 символов',
    });
  }

  return errors;
}

/**
 * Validates the full SiteSettings object before persisting to database
 */
export function validateSiteSettings(data: any): ValidationResult<SiteSettings> {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ field: 'settings', message: 'Настройки должны быть объектом' }],
    };
  }

  // brandName
  if (typeof data.brandName !== 'string' || data.brandName.trim().length === 0 || data.brandName.trim().length > 60) {
    errors.push({
      field: 'brandName',
      message: 'Имя бренда должно быть непустой строкой длиной до 60 символов',
    });
  }

  // botUsername
  if (typeof data.botUsername !== 'string' || !isValidBotUsername(data.botUsername)) {
    errors.push({
      field: 'botUsername',
      message: 'Юзернейм Telegram-бота должен содержать от 5 до 32 символов (латиница, цифры, _)',
    });
  }

  // defaultStartParam
  if (
    typeof data.defaultStartParam !== 'string' ||
    data.defaultStartParam.length > 64 ||
    !/^[a-zA-Z0-9_-]*$/.test(data.defaultStartParam)
  ) {
    errors.push({
      field: 'defaultStartParam',
      message: 'Параметр deep link start должен содержать до 64 допустимых символов (латиница, цифры, -, _)',
    });
  }

  // announcementText
  if (typeof data.announcementText !== 'string' || data.announcementText.length > 200) {
    errors.push({
      field: 'announcementText',
      message: 'Текст объявления не должен превышать 200 символов',
    });
  }

  // showAnnouncement
  if (typeof data.showAnnouncement !== 'boolean') {
    errors.push({
      field: 'showAnnouncement',
      message: 'Поле showAnnouncement должно быть булевым',
    });
  }

  // supportLink
  if (data.supportLink && (typeof data.supportLink !== 'string' || !isValidTelegramUrl(data.supportLink))) {
    errors.push({
      field: 'supportLink',
      message: 'Ссылка на поддержку должна начинаться с https://t.me/ или https://telegram.me/',
    });
  }

  // pricing
  if (!Array.isArray(data.pricing) || data.pricing.length === 0 || data.pricing.length > 20) {
    errors.push({
      field: 'pricing',
      message: 'Список тарифов должен содержать от 1 до 20 тарифов',
    });
  } else {
    // Check for unique plan IDs
    const seenIds = new Set<string>();
    data.pricing.forEach((plan: any, index: number) => {
      const planErrors = validatePricingPlan(plan, index);
      errors.push(...planErrors);

      if (plan && typeof plan.id === 'string') {
        const cleanId = plan.id.trim();
        if (seenIds.has(cleanId)) {
          errors.push({
            field: `pricing[${index}].id`,
            message: `Идентификатор тарифа "${cleanId}" дублируется`,
          });
        }
        seenIds.add(cleanId);
      }
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize and return typed structure
  const sanitized: SiteSettings = {
    brandName: data.brandName.trim(),
    botUsername: data.botUsername.replace(/^@+/, '').trim(),
    defaultStartParam: (data.defaultStartParam || '').trim(),
    announcementText: (data.announcementText || '').trim(),
    showAnnouncement: Boolean(data.showAnnouncement),
    supportLink: (data.supportLink || '').trim(),
    pricing: data.pricing.map((p: any) => ({
      id: p.id.trim(),
      name: p.name.trim(),
      duration: p.duration.trim(),
      price: Math.round(p.price * 100) / 100, // round to 2 decimal places
      currency: p.currency.trim(),
      periodLabel: p.periodLabel.trim(),
      devices: Math.floor(p.devices),
      popular: Boolean(p.popular),
      badge: p.badge ? p.badge.trim() : undefined,
      type: p.type === 'special' ? 'special' : 'regular',
      features: p.features.map((f: string) => f.trim()),
      trafficHighlight: p.trafficHighlight.trim(),
    })),
  };

  return { isValid: true, errors: [], data: sanitized };
}
