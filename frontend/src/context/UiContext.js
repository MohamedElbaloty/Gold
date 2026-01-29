import React, { createContext, useEffect, useMemo, useState } from 'react';

const UiContext = createContext();

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function applyDir(lang) {
  const root = document.documentElement;
  root.lang = lang === 'ar' ? 'ar' : 'en';
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export const UiProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('ui.theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('ui.lang') || 'ar');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('ui.theme', theme);
  }, [theme]);

  useEffect(() => {
    applyDir(lang);
    localStorage.setItem('ui.lang', lang);
  }, [lang]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === 'ar' ? 'en' : 'ar'))
    }),
    [theme, lang]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export default UiContext;

