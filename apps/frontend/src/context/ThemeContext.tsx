import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ThemeContext, type Theme } from './theme.context';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // 1. Inicialización pura: lee localStorage o prefiere el sistema
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 2. Hidratación desde el backend: SOLO si este navegador no tenía
  // ninguna preferencia local guardada. Usamos useState (no useRef) para
  // trackear "el render anterior", que es el patrón que React soporta
  // para ajustar estado durante el render sin pasar por un efecto.
  const [hadStoredPreference, setHadStoredPreference] = useState<boolean>(
    () => localStorage.getItem('theme') !== null
  );
  const [prevUserTheme, setPrevUserTheme] = useState<string | null | undefined>(undefined);

  if (!hadStoredPreference && user?.theme !== prevUserTheme) {
    setPrevUserTheme(user?.theme);

    if (user?.theme) {
      const userBackendTheme = user.theme.toLowerCase() as Theme;
      if (userBackendTheme === 'light' || userBackendTheme === 'dark') {
        setThemeState(userBackendTheme);
        setHadStoredPreference(true);
      }
    }
  }

  // 3. Función única para aplicar al DOM + persistir localmente
  const updateDomTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', newTheme);
  };

  // Único efecto real: sincroniza React -> DOM/localStorage cada vez que theme cambia
  useEffect(() => {
    updateDomTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);

    if (user) {
      api.patch('/users/preferences', {
        theme: nextTheme.toUpperCase(),
      }).catch((err) => console.error('Error al sincronizar preferencia:', err));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};