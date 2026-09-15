import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { workflowService, type Workflow } from '../services/workflow.service';
import { DashboardLayout } from '../components/DashboardLayout';
import { CreateWorkflowModal } from '../components/CreateWorkflowModal';

export const WorkflowsPage: React.FC = () => {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workflowService.getAll();
      setWorkflows(data);
      setError(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('common.error'));
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkflows();
  }, [loadWorkflows]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta automatización?')) return;
    try {
      await workflowService.delete(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[var(--border-color)] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">{t('workflows.title')}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('workflows.subtitle')}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          + {t('workflows.create')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">{t('workflows.table.name')}</th>
                <th className="py-3 px-4">{t('workflows.table.trigger')}</th>
                <th className="py-3 px-4">{t('workflows.table.actions')}</th>
                <th className="py-3 px-4">{t('workflows.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('workflows.table.actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-medium text-[var(--text-muted)]">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : workflows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-muted)] text-xs">
                    {t('workflows.noWorkflows')}
                  </td>
                </tr>
              ) : (
                workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[var(--text-main)]">{wf.name}</p>
                      {wf.description && (
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{wf.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--color-primary)]">
                        {t(`workflows.triggers.${wf.triggerEvent}`)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {wf.actions.map((act) => (
                          <span
                            key={act.id}
                            className="text-[10px] font-medium bg-[var(--bg-main)] px-2 py-0.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)]"
                          >
                            {t(`workflows.actionTypes.${act.actionType}`)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          wf.active
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                            : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-500'
                        }`}
                      >
                        {wf.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(wf.id)}
                        className="px-2.5 py-1 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 rounded-lg text-[11px] font-medium transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadWorkflows}
      />
    </DashboardLayout>
  );
};