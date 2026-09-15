import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { productService, type Product } from '../services/product.service';
import { DashboardLayout } from '../components/DashboardLayout';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de creación
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(''); // <-- Solución al error TS2304

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
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
    loadProducts();
  }, [loadProducts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '' || stock === '') return;

    try {
      await productService.create({
        name: name.trim(),
        sku: sku.trim() || undefined,
        price: Number(price),
        stock: Number(stock),
      });

      setName('');
      setSku('');
      setPrice('');
      setStock('');
      setIsAdding(false);
      loadProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
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
          <h2 className="text-xl font-bold text-[var(--text-main)]">{t('products.title')}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('products.subtitle')}</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          {isAdding ? 'Cancelar' : `+ ${t('products.create')}`}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            required
            placeholder="Nombre del Producto *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="text"
            placeholder="SKU / Código (Opcional)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="number"
            step="0.01"
            required
            placeholder="Precio Base *"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="number"
            min="0"
            required
            placeholder="Stock Inicial *"
            value={stock}
            onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="bg-[var(--color-secondary)] text-white text-xs font-bold rounded-xl px-4 py-2 transition hover:opacity-90"
          >
            Guardar Producto
          </button>
        </form>
      )}

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
                <th className="py-3 px-4">{t('products.table.name')}</th>
                <th className="py-3 px-4">{t('products.table.price')}</th>
                <th className="py-3 px-4">Inventario</th>
                <th className="py-3 px-4">{t('products.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('products.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-medium text-[var(--text-muted)]">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-muted)] text-xs">
                    {t('products.noProducts')}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[var(--text-main)]">{p.name}</p>
                      {p.sku && <p className="text-[10px] font-mono text-[var(--text-muted)]">SKU: {p.sku}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--color-primary)]">
                      ${Number(p.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.stock > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      }`}>
                        {p.stock} unidades
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        {p.active ? 'Disponible' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
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
    </DashboardLayout>
  );
};