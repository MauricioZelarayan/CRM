import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { dealService, type DealStage } from '../services/deal.service';
import { contactService, type Contact } from '../services/contact.service';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STAGES: DealStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export const CreateDealModal: React.FC<CreateDealModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [stage, setStage] = useState<DealStage>('LEAD');
  const [contactId, setContactId] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      contactService
        .getAll()
        .then((res) => setContacts(res.data))
        .catch(() => setContacts([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await dealService.create({
        title,
        value: Number(value) || 0,
        stage,
        contactId: contactId || null,
      });
      setTitle('');
      setValue('');
      setStage('LEAD');
      setContactId('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('common.error'));
      } else {
        setError(t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]/50">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">{t('deals.addDeal')}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Ingresa los datos de la oportunidad comercial.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="m-6 p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label>{t('deals.form.title')} *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Implementación CRM Enterprise"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>{t('deals.form.value')} *</label>
              <input
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <label>{t('deals.form.stage')}</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {t(`deals.stages.${stg}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label>{t('deals.form.contact')}</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
            >
              <option value="">{t('deals.form.selectContact')}</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName || ''} ({c.email || 'Sin correo'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl transition"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('deals.addDeal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};