'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hr';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.cases': 'Cases',
    'nav.clients': 'Clients',
    'nav.documents': 'Documents',
    'nav.calendar': 'Calendar',
    'nav.billing': 'Billing',
    
    // Common
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.total': 'Total',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.actions': 'Actions',
    'common.selectAll': 'Select All',
    'common.selected': 'selected',
    
    // Billing
    'billing.title': 'Billing',
    'billing.subtitle': 'Manage time entries and generate invoices for your clients.',
    'billing.totalOutstanding': 'Total Outstanding',
    'billing.addTimeEntry': 'Add Time Entry',
    'billing.recentInvoices': 'Recent Invoices',
    'billing.billingEntries': 'Billing Entries',
    'billing.generateInvoice': 'Generate Invoice',
    'billing.invoiceNumber': 'Invoice #',
    'billing.client': 'Client',
    'billing.case': 'Case',
    'billing.hours': 'Hours',
    'billing.rate': 'Rate',
    'billing.amount': 'Amount',
    'billing.paid': 'Paid',
    'billing.sent': 'Sent',
    'billing.overdue': 'Overdue',
    'billing.ratePerHour': 'Rate ($/hour)',
    'billing.enterClientName': 'Enter client name',
    'billing.enterCaseName': 'Enter case name',
    
    // User
    'user.logout': 'Logout',
    'user.profile': 'Profile',
    'user.settings': 'Settings',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.toggle': 'Toggle theme',
    
    // Language
    'language.english': 'English',
    'language.croatian': 'Croatian',
    'language.toggle': 'Toggle language',
  },
  hr: {
    // Navigation
    'nav.dashboard': 'Nadzorna ploča',
    'nav.cases': 'Predmeti',
    'nav.clients': 'Klijenti',
    'nav.documents': 'Dokumenti',
    'nav.calendar': 'Kalendar',
    'nav.billing': 'Naplata',
    
    // Common
    'common.add': 'Dodaj',
    'common.edit': 'Uredi',
    'common.delete': 'Obriši',
    'common.save': 'Spremi',
    'common.cancel': 'Odustani',
    'common.view': 'Prikaži',
    'common.search': 'Pretraži',
    'common.filter': 'Filtriraj',
    'common.export': 'Izvezi',
    'common.import': 'Uvezi',
    'common.loading': 'Učitavanje...',
    'common.error': 'Greška',
    'common.success': 'Uspjeh',
    'common.confirm': 'Potvrdi',
    'common.close': 'Zatvori',
    'common.back': 'Natrag',
    'common.next': 'Sljedeće',
    'common.previous': 'Prethodno',
    'common.total': 'Ukupno',
    'common.status': 'Status',
    'common.date': 'Datum',
    'common.actions': 'Radnje',
    'common.selectAll': 'Odaberi sve',
    'common.selected': 'odabrano',
    
    // Billing
    'billing.title': 'Naplata',
    'billing.subtitle': 'Upravljaj vremenskim unosima i generiraj račune za svoje klijente.',
    'billing.totalOutstanding': 'Ukupno neplaćeno',
    'billing.addTimeEntry': 'Dodaj vremenski unos',
    'billing.recentInvoices': 'Nedavni računi',
    'billing.billingEntries': 'Unosi naplate',
    'billing.generateInvoice': 'Generiraj račun',
    'billing.invoiceNumber': 'Broj računa',
    'billing.client': 'Klijent',
    'billing.case': 'Predmet',
    'billing.hours': 'Sati',
    'billing.rate': 'Stopa',
    'billing.amount': 'Iznos',
    'billing.paid': 'Plaćeno',
    'billing.sent': 'Poslano',
    'billing.overdue': 'Dospjelo',
    'billing.ratePerHour': 'Stopa (€/sat)',
    'billing.enterClientName': 'Unesite ime klijenta',
    'billing.enterCaseName': 'Unesite ime predmeta',
    
    // User
    'user.logout': 'Odjava',
    'user.profile': 'Profil',
    'user.settings': 'Postavke',
    
    // Theme
    'theme.light': 'Svjetlo',
    'theme.dark': 'Tamno',
    'theme.toggle': 'Promijeni temu',
    
    // Language
    'language.english': 'Engleski',
    'language.croatian': 'Hrvatski',
    'language.toggle': 'Promijeni jezik',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved language preference or default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'hr' : 'en');
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
