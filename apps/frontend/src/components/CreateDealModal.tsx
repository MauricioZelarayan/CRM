import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { dealService, type DealStage, type CreateDealDTO } from '../services/deal.service';
import { contactService, type Contact } from '../services/contact.service';
import { productService, type Product } from '../services/product.service'; // Importante importar esto

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STAGES: DealStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export const CreateDealModal: React.FC<CreateDealModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  
  // Estados básicos
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<DealStage>('LEAD');
  const [contactId, setContactId] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Estados para inventario y cotización
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [manualValue, setManualValue] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      contactService.getAll().then((res) => setContacts(res.data)).catch(() => setContacts([]));
      // Traemos solo los productos activos para cotizar
      productService.getAll().then((data) => setProducts(data.filter(p => p.active))).catch(() => setProducts([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const calculatedTotal = selectedProduct 
    ? Number(selectedProduct.price) * quantity 
    : Number(manualValue) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación defensiva visual
    if (selectedProduct && stage === 'WON' && (selectedProduct.stock ?? 0) < quantity) {
      setError(`Stock insuficiente para "${selectedProduct.name}". Disponible: ${selectedProduct.stock ?? 0}`);
      return;
    }

    try {
      setSubmitting(true);

      // Despachador de tipo de cotización (Cumpliendo el Discriminated Union de TS)
      const payload: CreateDealDTO = selectedProductId
        ? {
            quoteType: 'CATALOG',
            title: title.trim(),
            stage,
            contactId: contactId || null,
            productId: selectedProductId,
            quantity,
          }
        : {
            quoteType: 'MANUAL',
            title: title.trim(),
            stage,
            contactId: contactId || null,
            manualValue: Number(manualValue) || 0,
          };

      await dealService.create(payload);

      setTitle('');
      setSelectedProductId('');
      setQuantity(1);
      setManualValue('');
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
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition">
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
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('deals.form.title')} *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Implementación CRM Enterprise"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('deals.form.stage')}</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>{t(`deals.stages.${stg}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('deals.form.contact')}</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
              >
                <option value="">{t('deals.form.selectContact')}</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloque visual para Producto / Valor Manual */}
          <div className="p-4 bg-[var(--bg-main)]/50 border border-[var(--border-color)] rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Producto del Catálogo (Opcional)</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
              >
                <option value="">-- Cotización Manual Libre --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${Number(p.price).toLocaleString()}) - Stock: {p.stock ?? 0}
                  </option>
                ))}
              </select>
            </div>

            {selectedProductId ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Precio Unit.</label>
                  <div className="w-full bg-[var(--bg-card)]/50 border border-[var(--border-color)] rounded-xl p-2.5 text-xs font-mono text-[var(--text-muted)]">
                    ${Number(selectedProduct?.price || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('deals.form.value')} ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-main)] outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
              <span className="font-semibold text-[var(--text-muted)]">Total Calculado:</span>
              <span className="font-mono font-bold text-sm text-[var(--color-primary)]">
                ${calculatedTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl transition">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50">
              {submitting ? t('common.loading') : t('deals.addDeal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};