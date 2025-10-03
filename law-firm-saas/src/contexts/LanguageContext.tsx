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
    'nav.pricing': 'Pricing',
    'nav.subscription-inactive': 'Subscription Inactive',
    
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
    'billing.editTimeEntry': 'Edit Time Entry',
    'billing.notes': 'Notes',
    'billing.failedToLoadClients': 'Failed to load clients. Please try again.',
    'billing.failedToLoadCases': 'Failed to load cases. Please try again.',
    'billing.failedToLoadBillingEntries': 'Failed to load billing entries. Please try again.',
    'billing.unknownClient': 'Unknown Client',
    'billing.unknownCase': 'Unknown Case',
    'billing.fillAllFields': 'Please fill in all fields with valid values',
    'billing.failedToCreateEntry': 'Failed to create billing entry. Please try again.',
    'billing.failedToUpdateEntry': 'Failed to update billing entry. Please try again.',
    'billing.confirmDelete': 'Are you sure you want to delete this billing entry?',
    'billing.failedToDeleteEntry': 'Failed to delete billing entry. Please try again.',
    'billing.selectEntriesForInvoice': 'Please select at least one billing entry to generate an invoice',
    'billing.loadingEntries': 'Loading billing entries...',
    'billing.noBillingEntries': 'No Billing Entries',
    'billing.getStarted': 'Get started by adding your first time entry.',
    'billing.selectClient': 'Select a client',
    'billing.selectCase': 'Select a case',
    'billing.optionalNotes': 'Optional notes about this time entry',
    'billing.updateEntry': 'Update Entry',
    
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
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your law firm\'s key metrics and activities.',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.openCases': 'Open Cases',
    'dashboard.upcomingDeadlines': 'Upcoming Deadlines',
    'dashboard.documentsUploaded': 'Documents Uploaded',
    'dashboard.recentCases': 'Recent Cases',
    'dashboard.thisMonth': 'this month',
    'dashboard.thisWeek': 'this week',
    'dashboard.urgent': 'urgent',
    'dashboard.hoursAgo': 'hours ago',
    'dashboard.daysAgo': 'days ago',
    'dashboard.due': 'Due',
    
    // Cases
    'cases.title': 'Cases',
    'cases.subtitle': 'Manage your law firm\'s legal cases and matters.',
    'cases.addCase': 'Add Case',
    'cases.editCase': 'Edit Case',
    'cases.addNewCase': 'Add New Case',
    'cases.caseTitle': 'Case Title',
    'cases.enterCaseTitle': 'Enter case title',
    'cases.linkedClient': 'Linked Client',
    'cases.selectClient': 'Select a client',
    'cases.createdDate': 'Created Date',
    'cases.caseNotes': 'Case Notes',
    'cases.enterCaseNotes': 'Enter case notes and details',
    'cases.updateCase': 'Update Case',
    'cases.noCasesFound': 'No cases found',
    'cases.getStarted': 'Get started by adding your first case.',
    'cases.loadingCases': 'Loading cases...',
    'cases.deleteConfirm': 'Are you sure you want to delete this case?',
    'cases.open': 'Open',
    'cases.inProgress': 'In Progress',
    'cases.closed': 'Closed',
    
    // Clients
    'clients.title': 'Clients',
    'clients.subtitle': 'Manage your law firm\'s client database.',
    'clients.addClient': 'Add Client',
    'clients.editClient': 'Edit Client',
    'clients.addNewClient': 'Add New Client',
    'clients.name': 'Name',
    'clients.email': 'Email',
    'clients.phone': 'Phone',
    'clients.oib': 'OIB',
    'clients.notes': 'Notes',
    'clients.enterName': 'Enter client name',
    'clients.enterEmail': 'Enter email address',
    'clients.enterPhone': 'Enter phone number',
    'clients.enterOIB': 'Enter OIB (11 digits)',
    'clients.enterNotes': 'Enter any additional notes',
    'clients.updateClient': 'Update Client',
    'clients.noClientsFound': 'No clients found',
    'clients.getStarted': 'Get started by adding your first client.',
    'clients.tryAdjusting': 'Try adjusting your search terms.',
    'clients.loadingClients': 'Loading clients...',
    'clients.searchPlaceholder': 'Search by name or OIB...',
    'clients.deleteConfirm': 'Are you sure you want to delete this client?',
    'clients.fillAllFields': 'Please fill in all required fields.',
    'clients.oibLength': 'OIB must be exactly 11 digits.',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.addDeadline': 'Add Deadline',
    'calendar.editDeadline': 'Edit Deadline',
    'calendar.addNewDeadline': 'Add New Deadline',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.upcomingDeadlines': 'Upcoming Deadlines',
    'calendar.noDeadlinesFound': 'No deadlines found',
    'calendar.getStarted': 'Get started by adding your first deadline.',
    'calendar.loadingCalendar': 'Loading calendar...',
    'calendar.loadingDeadlines': 'Loading deadlines...',
    'calendar.enterDeadlineTitle': 'Enter deadline title',
    'calendar.selectCase': 'Select a case',
    'calendar.dueDate': 'Due Date',
    'calendar.time': 'Time',
    'calendar.updateDeadline': 'Update Deadline',
    'calendar.deleteConfirm': 'Are you sure you want to delete this deadline?',
    'calendar.fillAllFields': 'Please fill in all fields',
    'calendar.at': 'at',
    
    // Documents
    'documents.title': 'Documents',
    'documents.subtitle': 'Manage your law firm\'s documents and templates.',
    'documents.uploadDocument': 'Upload Document',
    'documents.download': 'Download',
    'documents.delete': 'Delete',
    'documents.case': 'Case',
    'documents.uploadedDate': 'Uploaded Date',
    'documents.documentName': 'Document Name',
    'documents.linkToCase': 'Link to Case',
    'documents.documentType': 'Document Type',
    'documents.selectFile': 'Select File',
    'documents.enterDocumentName': 'Enter document name',
    'documents.noCaseLinked': 'No case linked',
    'documents.selectType': 'Select type',
    'documents.contract': 'Contract',
    'documents.legalDocument': 'Legal Document',
    'documents.draftDocument': 'Draft Document',
    'documents.financialDocument': 'Financial Document',
    'documents.correspondence': 'Correspondence',
    'documents.evidence': 'Evidence',
    'documents.selected': 'Selected',
    'documents.size': 'Size',
    'documents.type': 'Type',
    'documents.uploading': 'Uploading...',
    'documents.noDocumentsFound': 'No documents found',
    'documents.getStarted': 'Get started by uploading your first document.',
    'documents.loadingDocuments': 'Loading documents...',
    'documents.deleteConfirm': 'Are you sure you want to delete this document?',
    'documents.selectFileUpload': 'Please select a file to upload',
    'documents.enterDocumentNameUpload': 'Please enter a document name',
    'documents.templates': 'Templates',
    'documents.templatesSubtitle': 'Pre-built document templates for common legal documents.',
    'documents.unknownSize': 'Unknown size',
    'documents.unknownType': 'Unknown type',
    
    // Auth
    'auth.welcomeBack': 'Welcome back',
    'auth.signInAccount': 'Sign in to your LawFirm SaaS account',
    'auth.emailAddress': 'Email address',
    'auth.enterEmail': 'Enter your email',
    'auth.password': 'Password',
    'auth.enterPassword': 'Enter your password',
    'auth.signingIn': 'Signing in...',
    'auth.signIn': 'Sign in',
    'auth.dontHaveAccount': 'Don\'t have an account?',
    'auth.createOne': 'Create one',
    'auth.createAccount': 'Create your account',
    'auth.joinLawFirm': 'Join LawFirm SaaS to manage your legal practice',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmYourPassword': 'Confirm your password',
    'auth.allFieldsRequired': 'All fields are required',
    'auth.passwordsDoNotMatch': 'Passwords do not match',
    'auth.passwordMinLength': 'Password must be at least 6 characters',
    'auth.creatingAccount': 'Creating account...',
    'auth.createAccountButton': 'Create account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.registrationSuccessful': 'Registration successful! Please check your email to confirm your account.',
    'auth.fillInAllFields': 'Please fill in all fields',
    'auth.unexpectedError': 'An unexpected error occurred',
    
    // Status
    'status.active': 'Active',
    'status.inReview': 'In Review',
    'status.pending': 'Pending',
    'status.open': 'Open',
    'status.inProgress': 'In Progress',
    'status.closed': 'Closed',
    'status.high': 'High',
    'status.medium': 'Medium',
    'status.low': 'Low',
    
    // Priority
    'priority.high': 'High',
    'priority.medium': 'Medium',
    'priority.low': 'Low',
    
    // Subscription
    'subscription.inactive': 'Subscription Inactive',
    'subscription.inactiveDescription': 'Your subscription is currently inactive. Please renew to continue using our services.',
    'subscription.accountInfo': 'Account Information',
    'subscription.status': 'Status',
    'subscription.inactiveStatus': 'Inactive',
    'subscription.renewSubscription': 'Renew Subscription',
    'subscription.signOut': 'Sign Out',
    'subscription.needHelp': 'Need Help?',
    'subscription.supportEmail': 'support@lawfirmsaas.com',
    'subscription.supportPhone': '+1 (555) 123-4567',
    'subscription.errorMessage': 'If you believe this is an error, please contact our support team. We\'re here to help you get back to managing your law practice.',
  },
  hr: {
    // Navigation
    'nav.dashboard': 'Nadzorna ploča',
    'nav.cases': 'Predmeti',
    'nav.clients': 'Klijenti',
    'nav.documents': 'Dokumenti',
    'nav.calendar': 'Kalendar',
    'nav.billing': 'Naplata',
    'nav.pricing': 'Cijene',
    'nav.subscription-inactive': 'Neaktivna pretplata',
    
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
    'billing.editTimeEntry': 'Uredi vremenski unos',
    'billing.notes': 'Napomene',
    'billing.failedToLoadClients': 'Neuspješno učitavanje klijenata. Molimo pokušajte ponovno.',
    'billing.failedToLoadCases': 'Neuspješno učitavanje predmeta. Molimo pokušajte ponovno.',
    'billing.failedToLoadBillingEntries': 'Neuspješno učitavanje unosa naplate. Molimo pokušajte ponovno.',
    'billing.unknownClient': 'Nepoznat klijent',
    'billing.unknownCase': 'Nepoznat predmet',
    'billing.fillAllFields': 'Molimo ispunite sva polja s valjanim vrijednostima',
    'billing.failedToCreateEntry': 'Neuspješno stvaranje unosa naplate. Molimo pokušajte ponovno.',
    'billing.failedToUpdateEntry': 'Neuspješno ažuriranje unosa naplate. Molimo pokušajte ponovno.',
    'billing.confirmDelete': 'Jeste li sigurni da želite obrisati ovaj unos naplate?',
    'billing.failedToDeleteEntry': 'Neuspješno brisanje unosa naplate. Molimo pokušajte ponovno.',
    'billing.selectEntriesForInvoice': 'Molimo odaberite najmanje jedan unos naplate za generiranje računa',
    'billing.loadingEntries': 'Učitavanje unosa naplate...',
    'billing.noBillingEntries': 'Nema unosa naplate',
    'billing.getStarted': 'Počnite dodavanjem vašeg prvog vremenskog unosa.',
    'billing.selectClient': 'Odaberite klijenta',
    'billing.selectCase': 'Odaberite predmet',
    'billing.optionalNotes': 'Opcionalne napomene o ovom vremenskom unosu',
    'billing.updateEntry': 'Ažuriraj unos',
    
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
    
    // Dashboard
    'dashboard.title': 'Nadzorna ploča',
    'dashboard.subtitle': 'Pregled ključnih metrika i aktivnosti vašeg odvjetničkog ureda.',
    'dashboard.totalClients': 'Ukupno klijenata',
    'dashboard.openCases': 'Otvoreni predmeti',
    'dashboard.upcomingDeadlines': 'Nadolazeći rokovi',
    'dashboard.documentsUploaded': 'Preneseni dokumenti',
    'dashboard.recentCases': 'Nedavni predmeti',
    'dashboard.thisMonth': 'ovaj mjesec',
    'dashboard.thisWeek': 'ovaj tjedan',
    'dashboard.urgent': 'hitno',
    'dashboard.hoursAgo': 'sati prije',
    'dashboard.daysAgo': 'dana prije',
    'dashboard.due': 'Dospijeva',
    
    // Cases
    'cases.title': 'Predmeti',
    'cases.subtitle': 'Upravljaj pravnim predmetima i stvarima vašeg odvjetničkog ureda.',
    'cases.addCase': 'Dodaj predmet',
    'cases.editCase': 'Uredi predmet',
    'cases.addNewCase': 'Dodaj novi predmet',
    'cases.caseTitle': 'Naziv predmeta',
    'cases.enterCaseTitle': 'Unesite naziv predmeta',
    'cases.linkedClient': 'Povezani klijent',
    'cases.selectClient': 'Odaberite klijenta',
    'cases.createdDate': 'Datum kreiranja',
    'cases.caseNotes': 'Bilješke predmeta',
    'cases.enterCaseNotes': 'Unesite bilješke i detalje predmeta',
    'cases.updateCase': 'Ažuriraj predmet',
    'cases.noCasesFound': 'Nisu pronađeni predmeti',
    'cases.getStarted': 'Počnite dodavanjem svog prvog predmeta.',
    'cases.loadingCases': 'Učitavanje predmeta...',
    'cases.deleteConfirm': 'Jeste li sigurni da želite obrisati ovaj predmet?',
    'cases.open': 'Otvoren',
    'cases.inProgress': 'U tijeku',
    'cases.closed': 'Zatvoren',
    
    // Clients
    'clients.title': 'Klijenti',
    'clients.subtitle': 'Upravljaj bazom podataka klijenata vašeg odvjetničkog ureda.',
    'clients.addClient': 'Dodaj klijenta',
    'clients.editClient': 'Uredi klijenta',
    'clients.addNewClient': 'Dodaj novog klijenta',
    'clients.name': 'Ime',
    'clients.email': 'E-pošta',
    'clients.phone': 'Telefon',
    'clients.oib': 'OIB',
    'clients.notes': 'Bilješke',
    'clients.enterName': 'Unesite ime klijenta',
    'clients.enterEmail': 'Unesite adresu e-pošte',
    'clients.enterPhone': 'Unesite broj telefona',
    'clients.enterOIB': 'Unesite OIB (11 znamenki)',
    'clients.enterNotes': 'Unesite dodatne bilješke',
    'clients.updateClient': 'Ažuriraj klijenta',
    'clients.noClientsFound': 'Nisu pronađeni klijenti',
    'clients.getStarted': 'Počnite dodavanjem svog prvog klijenta.',
    'clients.tryAdjusting': 'Pokušajte prilagoditi uvjete pretraživanja.',
    'clients.loadingClients': 'Učitavanje klijenata...',
    'clients.searchPlaceholder': 'Pretraži po imenu ili OIB-u...',
    'clients.deleteConfirm': 'Jeste li sigurni da želite obrisati ovog klijenta?',
    'clients.fillAllFields': 'Molimo ispunite sva obavezna polja.',
    'clients.oibLength': 'OIB mora imati točno 11 znamenki.',
    
    // Calendar
    'calendar.title': 'Kalendar',
    'calendar.addDeadline': 'Dodaj rok',
    'calendar.editDeadline': 'Uredi rok',
    'calendar.addNewDeadline': 'Dodaj novi rok',
    'calendar.month': 'Mjesec',
    'calendar.week': 'Tjedan',
    'calendar.day': 'Dan',
    'calendar.upcomingDeadlines': 'Nadolazeći rokovi',
    'calendar.noDeadlinesFound': 'Nisu pronađeni rokovi',
    'calendar.getStarted': 'Počnite dodavanjem svog prvog roka.',
    'calendar.loadingCalendar': 'Učitavanje kalendara...',
    'calendar.loadingDeadlines': 'Učitavanje rokova...',
    'calendar.enterDeadlineTitle': 'Unesite naziv roka',
    'calendar.selectCase': 'Odaberite predmet',
    'calendar.dueDate': 'Datum dospijeća',
    'calendar.time': 'Vrijeme',
    'calendar.updateDeadline': 'Ažuriraj rok',
    'calendar.deleteConfirm': 'Jeste li sigurni da želite obrisati ovaj rok?',
    'calendar.fillAllFields': 'Molimo ispunite sva polja',
    'calendar.at': 'u',
    
    // Documents
    'documents.title': 'Dokumenti',
    'documents.subtitle': 'Upravljaj dokumentima i predlošcima vašeg odvjetničkog ureda.',
    'documents.uploadDocument': 'Prenesi dokument',
    'documents.download': 'Preuzmi',
    'documents.delete': 'Obriši',
    'documents.case': 'Predmet',
    'documents.uploadedDate': 'Datum prijenosa',
    'documents.documentName': 'Naziv dokumenta',
    'documents.linkToCase': 'Poveži s predmetom',
    'documents.documentType': 'Vrsta dokumenta',
    'documents.selectFile': 'Odaberi datoteku',
    'documents.enterDocumentName': 'Unesite naziv dokumenta',
    'documents.noCaseLinked': 'Nije povezan s predmetom',
    'documents.selectType': 'Odaberite vrstu',
    'documents.contract': 'Ugovor',
    'documents.legalDocument': 'Pravni dokument',
    'documents.draftDocument': 'Nacrt dokumenta',
    'documents.financialDocument': 'Financijski dokument',
    'documents.correspondence': 'Korespondencija',
    'documents.evidence': 'Dokazni materijal',
    'documents.selected': 'Odabrano',
    'documents.size': 'Veličina',
    'documents.type': 'Vrsta',
    'documents.uploading': 'Prijenos...',
    'documents.noDocumentsFound': 'Nisu pronađeni dokumenti',
    'documents.getStarted': 'Počnite prijenosom svog prvog dokumenta.',
    'documents.loadingDocuments': 'Učitavanje dokumenata...',
    'documents.deleteConfirm': 'Jeste li sigurni da želite obrisati ovaj dokument?',
    'documents.selectFileUpload': 'Molimo odaberite datoteku za prijenos',
    'documents.enterDocumentNameUpload': 'Molimo unesite naziv dokumenta',
    'documents.templates': 'Predlošci',
    'documents.templatesSubtitle': 'Unaprijed pripremljeni predlošci dokumenata za uobičajene pravne dokumente.',
    'documents.unknownSize': 'Nepoznata veličina',
    'documents.unknownType': 'Nepoznata vrsta',
    
    // Auth
    'auth.welcomeBack': 'Dobrodošli natrag',
    'auth.signInAccount': 'Prijavite se u svoj LawFirm SaaS račun',
    'auth.emailAddress': 'Adresa e-pošte',
    'auth.enterEmail': 'Unesite svoju e-poštu',
    'auth.password': 'Lozinka',
    'auth.enterPassword': 'Unesite svoju lozinku',
    'auth.signingIn': 'Prijava...',
    'auth.signIn': 'Prijava',
    'auth.dontHaveAccount': 'Nemate račun?',
    'auth.createOne': 'Kreirajte ga',
    'auth.createAccount': 'Kreirajte svoj račun',
    'auth.joinLawFirm': 'Pridružite se LawFirm SaaS-u za upravljanje svojom pravnom praksom',
    'auth.confirmPassword': 'Potvrdite lozinku',
    'auth.confirmYourPassword': 'Potvrdite svoju lozinku',
    'auth.allFieldsRequired': 'Sva polja su obavezna',
    'auth.passwordsDoNotMatch': 'Lozinke se ne podudaraju',
    'auth.passwordMinLength': 'Lozinka mora imati najmanje 6 znakova',
    'auth.creatingAccount': 'Kreiranje računa...',
    'auth.createAccountButton': 'Kreiraj račun',
    'auth.alreadyHaveAccount': 'Već imate račun?',
    'auth.registrationSuccessful': 'Registracija uspješna! Molimo provjerite svoju e-poštu za potvrdu računa.',
    'auth.fillInAllFields': 'Molimo ispunite sva polja',
    'auth.unexpectedError': 'Dogodila se neočekivana greška',
    
    // Status
    'status.active': 'Aktivan',
    'status.inReview': 'U pregledu',
    'status.pending': 'Na čekanju',
    'status.open': 'Otvoren',
    'status.inProgress': 'U tijeku',
    'status.closed': 'Zatvoren',
    'status.high': 'Visok',
    'status.medium': 'Srednji',
    'status.low': 'Nizak',
    
    // Priority
    'priority.high': 'Visok',
    'priority.medium': 'Srednji',
    'priority.low': 'Nizak',
    
    // Subscription
    'subscription.inactive': 'Neaktivna pretplata',
    'subscription.inactiveDescription': 'Vaša pretplata je trenutno neaktivna. Molimo obnovite je da biste nastavili koristiti naše usluge.',
    'subscription.accountInfo': 'Informacije o računu',
    'subscription.status': 'Status',
    'subscription.inactiveStatus': 'Neaktivan',
    'subscription.renewSubscription': 'Obnovi pretplatu',
    'subscription.signOut': 'Odjava',
    'subscription.needHelp': 'Trebate pomoć?',
    'subscription.supportEmail': 'support@lawfirmsaas.com',
    'subscription.supportPhone': '+1 (555) 123-4567',
    'subscription.errorMessage': 'Ako smatrate da je ovo greška, molimo kontaktirajte naš tim za podršku. Ovdje smo da vam pomognemo da se vratite upravljanju svojom odvjetničkom praksom.',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('hr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved language preference or default to Croatian
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
    return <div suppressHydrationWarning>{children}</div>;
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
