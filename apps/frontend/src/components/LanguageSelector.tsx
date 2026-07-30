import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 rounded ${i18n.language === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('pt')}
        className={`px-2 py-1 rounded ${i18n.language === 'pt' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        PT
      </button>
    </div>
  );
};