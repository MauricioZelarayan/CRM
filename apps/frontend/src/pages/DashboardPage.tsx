import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { contactService, type Contact } from '../services/contact.service';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    contactService
      .getAll()
      .then((res) => {
        if (isMounted) setContacts(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalContacts = contacts.length;
  const withEmail = contacts.filter((c) => Boolean(c.email)).length;
  const withPhone = contacts.filter((c) => Boolean(c.phone)).length;
  const completionRate = totalContacts > 0 ? Math.round((withEmail / totalContacts) * 100) : 0;

  return (
    <DashboardLayout>
      {/* Saludo y Contexto del Tenant */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm transition-colors">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            {t('dashboard.welcome', { name: user?.firstName || '' })}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas Globales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.totalContacts')}</p>
          <p className="text-3xl font-black text-[var(--text-main)] mt-2">
            {loading ? t('common.loading') : totalContacts}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">{t('dashboard.totalContactsDesc')}</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.validatedEmails')}</p>
          <p className="text-3xl font-black text-[var(--color-secondary)] mt-2">
            {loading ? t('common.loading') : withEmail}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">{t('dashboard.validatedEmailsDesc')}</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.registeredPhones')}</p>
          <p className="text-3xl font-black text-[var(--color-primary)] mt-2">
            {loading ? t('common.loading') : withPhone}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">{t('dashboard.registeredPhonesDesc')}</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.completionRate')}</p>
          <p className="text-3xl font-black text-[var(--color-primary)] mt-2">
            {loading ? t('common.loading') : `${completionRate}%`}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">{t('dashboard.completionRateDesc')}</span>
        </div>
      </div>

      {/* Actividad Reciente / Últimos Registros */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl transition-colors">
        <h2 className="text-sm font-bold text-[var(--text-main)] mb-4">{t('dashboard.recentContacts')}</h2>
        {contacts.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">{t('dashboard.noData')}</p>
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--color-primary)] font-bold text-xs flex items-center justify-center">
                    {contact.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-main)]">
                      {contact.firstName} {contact.lastName || ''}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {contact.email || t('dashboard.noEmail')}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">ID: {contact.id.slice(0, 6)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};