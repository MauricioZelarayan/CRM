import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  workflowService,
  type TriggerEvent,
  type ActionType,
} from '../services/workflow.service';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<TriggerEvent>('DEAL_WON');
  const [actionType, setActionType] = useState<ActionType>('CREATE_TASK');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const payload: Record<string, unknown> = {};
      if (actionType === 'CREATE_TASK') {
        payload.title = taskTitle.trim() || 'Seguimiento automático';
        payload.description = taskDescription.trim() || 'Tarea creada por regla automática';
      } else if (actionType === 'NOTIFY_TEAM') {
        payload.message = taskTitle.trim() || 'Alerta disparada por workflow';
      } else {
        payload.templateId = 'template_default';
      }

      await workflowService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        triggerEvent,
        active: true,
        actions: [
          {
            actionType,
            payload,
          },
        ],
      });

      setName('');
      setDescription('');
      setTaskTitle('');
      setTaskDescription('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('common.error'));
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h3 className="text-base font-bold text-[var(--text-main)]">{t('workflows.create')}</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Nombre de la Regla *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Tarea de Bienvenida al Ganar Deal"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Descripción Opcional
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué automatiza este disparador"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Evento Disparador *
              </label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value as TriggerEvent)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="DEAL_WON">{t('workflows.triggers.DEAL_WON')}</option>
                <option value="DEAL_STAGE_CHANGED">{t('workflows.triggers.DEAL_STAGE_CHANGED')}</option>
                <option value="CONTACT_CREATED">{t('workflows.triggers.CONTACT_CREATED')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Acción a Ejecutar *
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="CREATE_TASK">{t('workflows.actionTypes.CREATE_TASK')}</option>
                <option value="NOTIFY_TEAM">{t('workflows.actionTypes.NOTIFY_TEAM')}</option>
                <option value="SEND_EMAIL">{t('workflows.actionTypes.SEND_EMAIL')}</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-[var(--color-primary)] block uppercase tracking-wider">
              Parámetros de la Acción
            </span>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Título / Mensaje *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Título de la nota o tarea automática"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            {actionType === 'CREATE_TASK' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Instrucciones automáticas para el asesor comercial"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-main)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? t('common.loading') : 'Crear Automatización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};