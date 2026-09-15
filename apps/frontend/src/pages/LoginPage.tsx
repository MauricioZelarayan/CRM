import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';
import { authService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from '../components/LanguageSelector';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isDev = import.meta.env.DEV;
    if (!isDev && !turnstileToken) {
      setError('Por favor completa la verificación CAPTCHA.');
      return;
    }

    try {
      setSubmitting(true);
      await authService.login({
        email: email.trim().toLowerCase(),
        password,
        turnstileToken: turnstileToken || '',
      });
      await checkAuth();
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const validationErrors = err.response?.data?.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          setError(validationErrors.map((i: { message: string }) => i.message).join(' | '));
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4 transition-colors">
      <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl p-8 transition-colors">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-bold text-xs">
                C
              </div>
              <span className="font-extrabold tracking-tight text-sm text-[var(--text-main)]">CRM SaaS</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">{t('auth.loginTitle')}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Ingresa tus credenciales para continuar.</p>
          </div>
          <LanguageSelector />
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition"
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-center my-3">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-text)] text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {submitting ? t('common.loading') : t('auth.submitLogin')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] pt-4">
          <Link to="/register" className="text-[var(--color-primary)] hover:underline font-semibold transition">
            {t('auth.dontHaveAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}; 