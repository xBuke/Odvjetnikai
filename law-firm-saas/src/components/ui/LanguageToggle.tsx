'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  // Safe access to language context
  let language: 'en' | 'hr' = 'hr';
  let toggleLanguage: () => void = () => {};
  let t: (key: string) => string = (key: string) => key;
  
  try {
    const languageContext = useLanguage();
    language = languageContext.language;
    toggleLanguage = languageContext.toggleLanguage;
    t = languageContext.t;
  } catch {
    // Fallback values if context is not available
    console.warn('Language context not available, using fallback values');
  }

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={t('language.toggle')}
      title={`${t('language.toggle')}: ${language === 'en' ? t('language.croatian') : t('language.english')}`}
    >
      <Languages className="h-4 w-4" />
      <span className="absolute -top-1 -right-1 text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
