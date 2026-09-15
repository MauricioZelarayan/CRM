import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { contactService } from '../services/contact.service';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      await contactService.create({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorDetails = err.response?.data?.errors;
        if (Array.isArray(errorDetails) && errorDetails.length > 0) {
          setError(errorDetails.map((item: { message: string }) => item.message).join(' | '));
        } else {
          setError(err.response?.data?.message || t('common.error'));
        }
      } else {
        setError(t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h3 className="text-base font-bold text-[var(--text-main)]">Nuevo Contacto</h3>
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              placeholder="Ej: Martín"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              placeholder="Ej: González"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              placeholder="ejemplo@empresa.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};