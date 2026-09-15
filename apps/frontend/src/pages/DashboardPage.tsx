import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { analyticsService, type DashboardMetrics } from '../services/analytics.service';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await analyticsService.getDashboardData();
      if (isMountedRef.current) {
        setData(res);
        setError(null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || t('common.error'));
        } else {
          setError(t('common.error'));
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- falso positivo: loadDashboardData es async y todos los setState ocurren después del await.
    loadDashboardData();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboardData]);

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
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-main)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
            Rol: <strong className="text-[var(--text-main)]">{user?.role || 'USER'}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Métricas Globales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.kpis.pipelineValue')}</p>
          <p className="text-2xl font-black text-[var(--text-main)] mt-2">
            {loading ? t('common.loading') : `$${(data?.kpis.totalPipelineValue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {data?.kpis.totalDeals || 0} oportunidades activas
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.kpis.wonValue')}</p>
          <p className="text-2xl font-black text-[var(--color-secondary)] mt-2">
            {loading ? t('common.loading') : `$${(data?.kpis.wonValue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[11px] text-[var(--color-secondary)] mt-1 block font-medium">
            {data?.kpis.wonCount || 0} tratos ganados
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.kpis.winRate')}</p>
          <p className="text-2xl font-black text-[var(--color-primary)] mt-2">
            {loading ? t('common.loading') : `${data?.kpis.winRate || 0}%`}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Efectividad comercial
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.kpis.contacts')}</p>
          <p className="text-2xl font-black text-[var(--text-main)] mt-2">
            {loading ? t('common.loading') : data?.kpis.totalContacts || 0}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Cartera de contactos
          </span>
        </div>
      </div>

      {/* Distribución y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('dashboard.pipelineBreakdown')}
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">{t('common.loading')}</div>
          ) : !data?.stageDistribution || data.stageDistribution.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic py-6 text-center">
              No hay oportunidades en el pipeline.
            </p>
          ) : (
            <div className="space-y-3">
              {data.stageDistribution.map((stg) => {
                const total = data.kpis.totalPipelineValue;
                const percentage = total > 0 ? Math.round((stg.value / total) * 100) : 0;

                return (
                  <div key={stg.stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-main)]">{t(`deals.stages.${stg.stage}`)}</span>
                      <span className="font-mono text-[var(--text-muted)]">
                        ${stg.value.toLocaleString('es-AR')} ({stg.count})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('dashboard.recentActivity')}
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">{t('common.loading')}</div>
          ) : !data?.recentActivities || data.recentActivities.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">
              {t('dashboard.noActivities')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--color-primary)] font-mono uppercase">{act.type}</span>
                    <span>{new Date(act.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-main)]">{act.title}</p>
                  {act.contact && (
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      👤 {act.contact.firstName} {act.contact.lastName || ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};