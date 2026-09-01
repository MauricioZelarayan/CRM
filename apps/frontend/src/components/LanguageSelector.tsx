import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-[#07111F] border border-[#22344A] rounded-xl p-1">
      {['es', 'en', 'pt'].map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition uppercase ${
            i18n.language === lang
              ? 'bg-[#7CC7D9] text-[#07111F]'
              : 'text-[#9AAABD] hover:text-[#F8F7F2]'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};