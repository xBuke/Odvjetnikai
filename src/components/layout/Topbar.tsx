'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
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
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
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
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 lg:px-6 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          
          {/* Page title - dynamic based on current page */}
          <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-foreground font-serif">
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
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'lawyer@firm.com'}
              </p>
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

