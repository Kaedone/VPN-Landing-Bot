import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ru } from './locales/ru';
import { en } from './locales/en';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('adultvpn_lang') : null;
const browserLanguage = typeof window !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'ru';
const initialLang = savedLanguage || browserLanguage || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: initialLang,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lng: 'ru' | 'en') => {
  i18n.changeLanguage(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('adultvpn_lang', lng);
  }
};

export default i18n;
