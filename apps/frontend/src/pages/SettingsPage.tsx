import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { teamService, type TeamMember, type Role } from '../services/team.service';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { InviteUserModal } from '../components/InviteUserModal';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamService.getMembers();
      setMembers(data);
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
    const init = async () => {
      await loadMembers();
    };
    init();
  }, [loadMembers]);

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    if (memberId === user?.id) {
      alert('No puedes modificar tu propio rol.');
      return;
    }

    const previousMembers = [...members];
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      await teamService.updateRole(memberId, newRole);
    } catch (err: unknown) {
      setMembers(previousMembers);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || t('common.error'));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[var(--border-color)] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">{t('settings.title')}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('settings.subtitle')}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          + {t('settings.invite')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('settings.team')} ({members.length})
          </h3>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">{t('settings.columns.user')}</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">{t('settings.columns.role')}</th>
                <th className="py-3 px-4">{t('settings.columns.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs font-medium text-[var(--text-muted)]">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[var(--text-muted)] text-xs">
                    No hay miembros registrados.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isCurrentSessionUser = member.id === user?.id;

                  return (
                    <tr key={member.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-bold text-xs">
                            {member.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-main)]">
                              {member.firstName} {member.lastName || ''}
                              {isCurrentSessionUser && (
                                <span className="ml-2 text-[10px] text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded font-mono">
                                  Tú
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {member.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          disabled={isCurrentSessionUser}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                        >
                          <option value="USER">{t('settings.roles.USER')}</option>
                          <option value="ADMIN">{t('settings.roles.ADMIN')}</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMembers}
      />
    </DashboardLayout>
  );
};