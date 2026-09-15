import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative inline-block w-full">
      <select
        value={i18n.language.split('-')[0]}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full appearance-none bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-xs rounded-xl px-3 py-2 pr-8 outline-none focus:border-[var(--color-primary)] transition cursor-pointer shadow-sm"
      >
        <option value="es" className="bg-[var(--bg-card)] text-[var(--text-main)]">
          Español (ES)
        </option>
        <option value="en" className="bg-[var(--bg-card)] text-[var(--text-main)]">
          English (EN)
        </option>
        <option value="pt" className="bg-[var(--bg-card)] text-[var(--text-main)]">
          Português (PT)
        </option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[var(--text-muted)]">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};