import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { contactService } from '../services/contact.service';
import type { Contact } from '../services/contact.service';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { CreateContactModal } from '../components/CreateContactModal';

export const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.getAll();
      setContacts(res.data);
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

  useEffect(() => {
    let isMounted = true;

    contactService
      .getAll()
      .then((res) => {
        if (isMounted) {
          setContacts(res.data);
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
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;

    try {
      await contactService.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  // Filtro de búsqueda reactivo
  const filteredContacts = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      (c.lastName && c.lastName.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout>
      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total de Contactos</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{contacts.length}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
            #
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Con Correo Registrado</p>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {contacts.filter((c) => !!c.email).length}
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
            @
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Con Teléfono Activo</p>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {contacts.filter((c) => !!c.phone).length}
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold">
            Ph
          </div>
        </div>
      </div>

      {/* Card de la Tabla */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Barra de Acciones y Búsqueda */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <span className="text-sm leading-none">+</span> {t('contacts.addContact')}
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <div className="py-16 text-center text-xs font-medium text-slate-500">{t('common.loading')}</div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            {search ? 'No se encontraron contactos que coincidan con la búsqueda.' : 'No hay contactos registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Contacto</th>
                  <th className="py-3.5 px-5">{t('contacts.email')}</th>
                  <th className="py-3.5 px-5">{t('contacts.phone')}</th>
                  <th className="py-3.5 px-5 text-right">{t('contacts.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">
                            {contact.firstName} {contact.lastName || ''}
                          </p>
                          <p className="text-[10px] text-slate-500">ID: {contact.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      {contact.email || '-'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      {contact.phone || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {canDelete ? (
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="px-2.5 py-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[11px] font-medium transition"
                        >
                          {t('contacts.delete')}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">Lectura</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadContacts}
      />
    </DashboardLayout>
  );
};