'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    // Fallback function if context is not available
    const fallbackTranslations: Record<string, string> = {
      'nav.dashboard': 'Dashboard',
      'nav.clients': 'Clients',
      'nav.cases': 'Cases',
      'nav.calendar': 'Calendar',
      'nav.documents': 'Documents',
      'nav.billing': 'Billing',
      'user.logout': 'Logout',
    };
    t = (key: string) => fallbackTranslations[key] || key;
  }
  
  const handleLogout = () => {
    // Placeholder for logout functionality
    console.log('Logout clicked');
  };

  // Get page title based on current path
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return t('nav.dashboard');
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Handle dynamic routes (like [id])
    if (lastSegment.match(/^\d+$/)) {
      const parentSegment = pathSegments[pathSegments.length - 2];
      return parentSegment ? t(`nav.${parentSegment}`) : 'Details';
    }
    
    return t(`nav.${lastSegment}`);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white/95 backdrop-blur-md border-b border-border px-4 py-4 lg:px-6 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--light-gray)] transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-[var(--navy)]" />
          </button>
          
          {/* Page title - dynamic based on current page */}
          <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-[var(--navy)] font-serif">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Controls and User menu */}
        <div className="flex items-center space-x-4">
          {/* Theme and Language toggles */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          {/* User avatar and info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-[var(--navy)]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--navy)]">John Doe</p>
              <p className="text-xs text-muted-foreground">Senior Partner</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('user.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

