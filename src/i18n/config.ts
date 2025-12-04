import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import rw from './locales/rw.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

i18n
  .use(LanguageDetector) // Auto-detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      rw: { translation: rw },
      fr: { translation: fr },
      sw: { translation: sw },
    },
    fallbackLng: 'en', // Default if language not found
    interpolation: {
      escapeValue: false, // React handles XSS automatically
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Remember choice in local storage
    },
  });

export default i18n;