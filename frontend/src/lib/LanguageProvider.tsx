'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translate, Language } from './translate';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
} | null>(null);

export function LanguageProvider({ children, initialLanguage = 'th' }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tor-language');
      if (saved === 'en' || saved === 'th') setLanguage(saved);
    } catch { /* Language switching still works when storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    if (ready) {
      try { localStorage.setItem('tor-language', language); } catch { /* Optional persistence. */ }
    }
  }, [language, ready]);
  const t = useCallback((text: string) => translate(text, language), [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage requires LanguageProvider.');
  return context;
}
