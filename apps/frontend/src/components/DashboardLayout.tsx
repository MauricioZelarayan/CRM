import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserMenu } from './UserMenu';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] antialiased overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar Lateral Fijo */}
      <aside className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col justify-between shrink-0 h-full transition-colors duration-200">
        <div>
          {/* Logo y Tenant Status */}
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <div className="h-8 w-8 bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-xl flex items-center justify-center font-bold shadow-md text-sm shrink-0">
              C
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-[var(--text-main)] block truncate">
                CRM Core
              </span>
              <span className="text-[10px] text-[var(--color-secondary)] font-medium px-2 py-0.5 bg-[var(--bg-main)] rounded-full inline-block border border-[var(--border-color)]">
                Tenant Active
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-3 space-y-1">
            {/* Inicio */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('navigation.home')}
            </NavLink>

            {/* Contactos */}
            <NavLink
              to="/contacts"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('navigation.contacts')}
            </NavLink>

            {/* Tratos / Deals */}
            <NavLink
              to="/deals"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('navigation.deals')}
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        <header className="h-14 border-b border-[var(--border-color)] px-6 flex items-center justify-between bg-[var(--bg-surface)] backdrop-blur-md shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">CRM</span>
            <span className="text-[var(--border-color)]">/</span>
            <span className="text-xs font-semibold text-[var(--text-main)]">{t('navigation.deals')}</span>
          </div>

          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="w-full min-w-0 space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
};