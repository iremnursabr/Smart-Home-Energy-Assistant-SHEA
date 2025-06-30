import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './locales/en.json';
import trTranslation from './locales/tr.json';

// Get user's preferred language from localStorage or browser
const getUserLanguage = (): string => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && ['en', 'tr'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Get browser language
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'tr'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'en'; // Default to English
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      tr: {
        translation: trTranslation
      }
    },
    lng: getUserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    // Nokta notasyonu ile nested anahtarlara erişim için
    keySeparator: '.',
    // Anahtarların olduğu gibi kullanılmasını sağlamak için (büyük/küçük harf değişimi olmadan)
    nsSeparator: false
  });

export default i18n; 