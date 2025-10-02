'use client';

import { 
  Users, 
  FileText, 
  Upload,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export default function Dashboard() {
  // Test Supabase connection
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from("clients").select("*");
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful! Clients data:', data);
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    };

    testSupabaseConnection();
  }, []);

  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback function if context is not available
    const fallbackTranslations: Record<string, string> = {
      'nav.dashboard': 'Nadzorna ploča',
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
      'status.active': 'Aktivan',
      'status.inReview': 'U pregledu',
      'status.pending': 'Na čekanju',
      'priority.high': 'Visok',
      'priority.medium': 'Srednji',
      'priority.low': 'Nizak',
    };
    t = (key: string) => fallbackTranslations[key] || key;
  }
  // Mock data for stat cards
  const stats = [
    { 
      name: t('dashboard.totalClients'), 
      value: '25', 
      icon: Users, 
      change: `+3 ${t('dashboard.thisMonth')}`, 
      changeType: 'positive',
      color: 'blue'
    },
    { 
      name: t('dashboard.openCases'), 
      value: '10', 
      icon: FileText, 
      change: `+2 ${t('dashboard.thisWeek')}`, 
      changeType: 'positive',
      color: 'green'
    },
    { 
      name: t('dashboard.upcomingDeadlines'), 
      value: '7', 
      icon: AlertCircle, 
      change: `3 ${t('dashboard.urgent')}`, 
      changeType: 'warning',
      color: 'orange'
    },
    { 
      name: t('dashboard.documentsUploaded'), 
      value: '142', 
      icon: Upload, 
      change: `+12 ${t('dashboard.thisWeek')}`, 
      changeType: 'positive',
      color: 'purple'
    },
  ];

  // Mock data for recent cases
  const recentCases = [
    { 
      id: 1, 
      title: 'Horvat protiv Zagrebačke banke', 
      client: 'Horvat & Partneri', 
      status: t('status.active'),
      statusColor: 'green',
      lastActivity: `2 ${t('dashboard.hoursAgo')}`,
      caseType: 'Spor ugovora'
    },
    { 
      id: 2, 
      title: 'Novak - Planiranje nasljedstva', 
      client: 'Obiteljski fond Novak', 
      status: t('status.inReview'),
      statusColor: 'yellow',
      lastActivity: `1 ${t('dashboard.daysAgo')}`,
      caseType: 'Planiranje nasljedstva'
    },
    { 
      id: 3, 
      title: 'Kovačević - Radni spor', 
      client: 'Kovačević & Suradnici', 
      status: t('status.active'),
      statusColor: 'green',
      lastActivity: `2 ${t('dashboard.daysAgo')}`,
      caseType: 'Radno pravo'
    },
    { 
      id: 4, 
      title: 'Babić - Nekretnine', 
      client: 'Babić Nekretnine', 
      status: t('status.pending'),
      statusColor: 'blue',
      lastActivity: `3 ${t('dashboard.daysAgo')}`,
      caseType: 'Nekretnine'
    },
    { 
      id: 5, 
      title: 'Jurić - Zahtjev za patent', 
      client: 'Jurić Tehnologija d.o.o.', 
      status: t('status.active'),
      statusColor: 'green',
      lastActivity: `4 ${t('dashboard.daysAgo')}`,
      caseType: 'Intelektualno vlasništvo'
    },
  ];

  // Mock data for upcoming deadlines
  const upcomingDeadlines = [
    { 
      id: 1, 
      title: 'Podnošenje zahtjeva za rješenje po osnovi', 
      case: 'Horvat protiv Zagrebačke banke', 
      dueDate: 'Sutra',
      priority: t('priority.high'),
      priorityColor: 'red'
    },
    { 
      id: 2, 
      title: 'Podnošenje odgovora na otkrivanje', 
      case: 'Kovačević - Radni spor', 
      dueDate: '15. pro. 2024',
      priority: t('priority.medium'),
      priorityColor: 'yellow'
    },
    { 
      id: 3, 
      title: 'Sastanak s klijentom - Planiranje nasljedstva', 
      case: 'Novak - Planiranje nasljedstva', 
      dueDate: '18. pro. 2024',
      priority: t('priority.medium'),
      priorityColor: 'yellow'
    },
    { 
      id: 4, 
      title: 'Pregled zahtjeva za patent', 
      case: 'Jurić - Zahtjev za patent', 
      dueDate: '20. pro. 2024',
      priority: t('priority.low'),
      priorityColor: 'green'
    },
    { 
      id: 5, 
      title: 'Sastanak za pregled ugovora', 
      case: 'Babić - Nekretnine', 
      dueDate: '22. pro. 2024',
      priority: t('priority.low'),
      priorityColor: 'green'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t('status.active'):
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case t('status.inReview'):
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case t('status.pending'):
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case t('priority.high'):
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case t('priority.medium'):
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case t('priority.low'):
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Welcome Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2">{t('dashboard.title')}</h2>
        <p className="text-muted-foreground text-sm sm:text-base">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
          };
          
          return (
            <div key={stat.name} className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.name}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout for Recent Cases and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Cases */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('dashboard.recentCases')}</h3>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentCases.map((caseItem) => (
                <div key={caseItem.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(caseItem.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{caseItem.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{caseItem.client}</p>
                    <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground truncate">{caseItem.caseType}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground truncate">{caseItem.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                      caseItem.statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      caseItem.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      caseItem.statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {caseItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('dashboard.upcomingDeadlines')}</h3>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-border rounded-lg hover:bg-accent transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {getPriorityIcon(deadline.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{deadline.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{deadline.case}</p>
                    <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{t('dashboard.due')}: {deadline.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                      deadline.priorityColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      deadline.priorityColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      deadline.priorityColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {deadline.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
