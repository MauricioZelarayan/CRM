import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { contactService, type Contact } from '../services/contact.service';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { CreateContactModal } from '../components/CreateContactModal';
import { ActivityTimeline } from '../components/ActivityTimeline';

export const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Estados principales
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // OWASP #3: Control de acceso visual por rol
  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await contactService.getAll();
      setContacts(res.data);
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

  // 2. Solución a ESLint: Envolvemos la llamada en una ejecución asíncrona interna
  useEffect(() => {
    const initFetch = async () => {
      await loadContacts();
    };
    initFetch();
  }, [loadContacts]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se seleccione la fila al hacer clic en eliminar
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
    try {
      await contactService.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

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
      {/* 1. Tarjetas de Métricas Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.totalContacts') || 'Total Contactos'}</p>
            <p className="text-3xl font-black text-[var(--text-main)] mt-1">{contacts.length}</p>
          </div>
          <div className="h-10 w-10 bg-[var(--bg-main)] text-[var(--color-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center font-bold">
            #
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.validatedEmails') || 'Emails Validados'}</p>
            <p className="text-3xl font-black text-[var(--color-secondary)] mt-1">
              {contacts.filter((c) => Boolean(c.email)).length}
            </p>
          </div>
          <div className="h-10 w-10 bg-[var(--bg-main)] text-[var(--color-secondary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center font-bold">
            @
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{t('dashboard.registeredPhones') || 'Teléfonos'}</p>
            <p className="text-3xl font-black text-[var(--color-primary)] mt-1">
              {contacts.filter((c) => Boolean(c.phone)).length}
            </p>
          </div>
          <div className="h-10 w-10 bg-[var(--bg-main)] text-[var(--color-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center font-bold">
            Ph
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 2. Contenedor Grid (Maestro-Detalle) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Tabla de Contactos */}
        <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${selectedContact ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          
          {/* Barra superior de la tabla */}
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface)]">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl !pl-10 pr-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition shrink-0"
            >
              <span className="text-sm leading-none font-black">+</span> {t('contacts.addContact') || 'Agregar Contacto'}
            </button>
          </div>

          {/* Tabla Responsive */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">{t('contacts.email') || 'Email'}</th>
                  <th className="py-3 px-4">{t('contacts.phone') || 'Teléfono'}</th>
                  <th className="py-3 px-4 text-right">{t('contacts.actions') || 'Acciones'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs font-medium text-[var(--text-muted)]">
                      {t('common.loading') || 'Cargando...'}
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--text-muted)] text-xs">
                      {search ? 'No se encontraron contactos.' : 'No hay contactos registrados.'}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      onClick={() => setSelectedContact(contact)}
                      className={`cursor-pointer transition-colors ${selectedContact?.id === contact.id ? 'bg-[var(--color-primary)]/10 border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-[var(--bg-main)]/50'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                            {contact.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-main)] truncate">
                              {contact.firstName} {contact.lastName || ''}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] font-mono">ID: {contact.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)] truncate">
                        {contact.email || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)] truncate">
                        {contact.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canDelete ? (
                          <button
                            onClick={(e) => handleDelete(contact.id, e)}
                            className="px-2.5 py-1 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 rounded-lg text-[11px] font-medium transition"
                          >
                            {t('contacts.delete') || 'Eliminar'}
                          </button>
                        ) : (
                          <span className="text-[var(--text-muted)] text-[11px] italic">Lectura</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA: Detalle y Timeline (Solo visible si hay un contacto seleccionado) */}
        {selectedContact && (
          <div className="lg:col-span-1 space-y-4 animate-in slide-in-from-right-4 duration-300">
            
            {/* Tarjeta de Resumen del Perfil */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 flex justify-between items-start shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] leading-tight">
                  {selectedContact.firstName} {selectedContact.lastName || ''}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  {selectedContact.email || 'Sin correo registrado'}
                </p>
                {selectedContact.phone && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                    {selectedContact.phone}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition shrink-0"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Aquí inyectamos tu componente de Actividades */}
            <ActivityTimeline contactId={selectedContact.id} />
            
          </div>
        )}
      </div>

      <CreateContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadContacts();
        }}
      />
    </DashboardLayout>
  );
};