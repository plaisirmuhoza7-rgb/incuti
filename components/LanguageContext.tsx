'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.rw;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('rw');

  useEffect(() => {
    const saved = localStorage.getItem('incuti_language') as Language;
    if (saved && (saved === 'rw' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('incuti_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'rw' ? 'en' : 'rw';
    setLanguage(nextLang);
  };

  const t = translations[language] || translations.rw;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200 shadow-2xs ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('rw')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold transition ${
          language === 'rw'
            ? 'bg-[#145726] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Kinyarwanda"
      >
        <span>🇷🇼</span>
        <span>RW</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold transition ${
          language === 'en'
            ? 'bg-[#145726] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
