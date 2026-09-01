import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import ptTranslation from './locales/pt.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
      pt: { translation: ptTranslation },
    },
    lng: 'es', // Idioma inicial por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React ya previene XSS nativamente
    },
  });

export default i18n;