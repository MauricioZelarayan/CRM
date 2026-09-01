import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export const UserMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] transition focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center font-bold text-xs text-[var(--color-primary)]">
          {user?.firstName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-[var(--text-main)] leading-tight">
            {user?.firstName} {user?.lastName}
          </p>
          <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">
            {user?.role}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
          <div className="px-4 py-2 border-b border-[var(--border-color)]">
            <p className="text-xs font-semibold text-[var(--text-main)] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">{user?.email}</p>
          </div>

          {/* Selector de Modo Claro / Oscuro */}
          <div className="px-4 py-2.5 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-main)] font-medium">Tema</span>
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] hover:border-[var(--color-primary)] transition flex items-center gap-1.5"
            >
              {theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
            </button>
          </div>

          {/* Selector de Idioma */}
          <div className="px-4 py-2.5 border-b border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
              {t('userMenu.language')}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)]">
              {(['es', 'en', 'pt'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`py-1 text-[10px] font-bold rounded-lg transition uppercase ${
                    i18n.language === lang
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] flex items-center gap-2 transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('userMenu.logout')}
          </button>
        </div>
      )}
    </div>
  );
};