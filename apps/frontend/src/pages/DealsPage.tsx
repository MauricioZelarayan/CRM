import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { dealService, type Deal, type DealStage } from '../services/deal.service';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { CreateDealModal } from '../components/CreateDealModal';

const STAGES: DealStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export const DealsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const loadDeals = () => {
    dealService
      .getAll()
      .then((res: { data: { data: Deal[] } }) => {
        setDeals(res.data.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || t('common.error'));
        } else {
          setError(t('common.error'));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;

    dealService
      .getAll()
      .then((res: { data: { data: Deal[] } }) => {
        if (isMounted) {
          setDeals(res.data.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || t('common.error'));
          } else {
            setError(t('common.error'));
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      await dealService.updateStage(dealId, newStage);
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oportunidad?')) return;
    try {
      await dealService.delete(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  const totalPipelineValue = deals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
  const wonValue = deals
    .filter((d) => d.stage === 'WON')
    .reduce((acc, curr) => acc + Number(curr.value || 0), 0);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('deals.totalPipeline')}</p>
          <p className="text-3xl font-black text-[var(--text-main)] mt-1">
            ${totalPipelineValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('deals.wonDeals')}</p>
          <p className="text-3xl font-black text-[var(--color-secondary)] mt-1">
            ${wonValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">Oportunidades Activas</p>
            <p className="text-3xl font-black text-[var(--color-primary)] mt-1">
              {deals.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST').length}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition"
          >
            + {t('deals.addDeal')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stg) => {
            const stageDeals = deals.filter((d) => d.stage === stg);
            const stageTotal = stageDeals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

            return (
              <div
                key={stg}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 flex flex-col min-w-[210px] shadow-sm transition-colors"
              >
                <div className="pb-3 border-b border-[var(--border-color)] mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-main)] truncate">
                      {t(`deals.stages.${stg}`)}
                    </span>
                    <span className="text-[10px] font-mono bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--border-color)] text-[var(--text-muted)]">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[var(--color-primary)] mt-1 font-semibold">
                    ${stageTotal.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl hover:border-[var(--color-primary)]/60 transition shadow-sm"
                    >
                      <p className="text-xs font-bold text-[var(--text-main)] leading-tight">{deal.title}</p>
                      <p className="text-xs font-mono font-bold text-[var(--color-secondary)] mt-1">
                        ${Number(deal.value).toLocaleString()}
                      </p>

                      {deal.contact && (
                        <p className="text-[10px] text-[var(--text-muted)] truncate mt-1">
                          👤 {deal.contact.firstName} {deal.contact.lastName || ''}
                        </p>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-1">
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                          className="text-[10px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg p-1 outline-none w-full"
                        >
                          {STAGES.map((targetStage) => (
                            <option key={targetStage} value={targetStage}>
                              {t(`deals.stages.${targetStage}`)}
                            </option>
                          ))}
                        </select>

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(deal.id)}
                            title="Eliminar"
                            className="text-[var(--color-danger)] p-1 hover:bg-[var(--color-danger-bg)] rounded-md transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="py-6 text-center text-[10px] text-[var(--text-muted)] italic">
                      Sin oportunidades
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadDeals}
      />
    </DashboardLayout>
  );
};