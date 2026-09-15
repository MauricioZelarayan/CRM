import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { activityService, type Activity, type ActivityType } from '../services/activity.service';

interface ActivityTimelineProps {
  contactId: string;
}

const TYPE_ICONS: Record<ActivityType, string> = {
  NOTE: '📝',
  CALL: '📞',
  MEETING: '🤝',
  EMAIL: '✉️',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contactId }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('NOTE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = useCallback(() => {
    activityService
      .getByContact(contactId)
      .then((res) => setActivities(res.data.data))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [contactId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      await activityService.create({
        contactId,
        title,
        type,
        description: description.trim() || null,
      });
      setTitle('');
      setDescription('');
      fetchActivities();
    } catch {
      alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar registro?')) return;
    try {
      await activityService.delete(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert(t('common.error'));
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-6">
      <h3 className="text-sm font-bold text-[var(--text-main)]">{t('activities.title')}</h3>

      {/* Formulario rápido para registrar interacciones */}
      <form onSubmit={handleCreate} className="space-y-3 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
            className="bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg p-2 text-xs outline-none"
          >
            <option value="NOTE">📝 {t('activities.types.NOTE')}</option>
            <option value="CALL">📞 {t('activities.types.CALL')}</option>
            <option value="MEETING">🤝 {t('activities.types.MEETING')}</option>
            <option value="EMAIL">✉️ {t('activities.types.EMAIL')}</option>
          </select>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('activities.form.title')}
            className="sm:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('activities.form.description')}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--color-primary)] resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-3.5 py-1.5 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition"
          >
            {submitting ? t('common.loading') : t('activities.addActivity')}
          </button>
        </div>
      </form>

      {/* Timeline de Actividades */}
      {loading ? (
        <p className="text-xs text-center text-[var(--text-muted)] py-4">{t('common.loading')}</p>
      ) : activities.length === 0 ? (
        <p className="text-xs text-center text-[var(--text-muted)] py-4 italic">{t('activities.empty')}</p>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[var(--border-color)]">
          {activities.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4 group">
              <div className="h-7 w-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-xs shrink-0 z-10 shadow-sm">
                {TYPE_ICONS[item.type]}
              </div>
              <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--text-main)]">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-[var(--text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 whitespace-pre-wrap">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};