'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  FolderOpen, 
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { name: 'nav.dashboard', href: '/', icon: LayoutDashboard },
  { name: 'nav.clients', href: '/clients', icon: Users },
  { name: 'nav.cases', href: '/cases', icon: FileText },
  { name: 'nav.calendar', href: '/calendar', icon: Calendar },
  { name: 'nav.documents', href: '/documents', icon: FolderOpen },
  { name: 'nav.billing', href: '/billing', icon: CreditCard },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    // Fallback function if context is not available
    t = (key: string) => key;
  }
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-[var(--navy)] border-r border-[var(--navy-light)] z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-auto
        w-64 shadow-xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--navy-light)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--gold)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[var(--navy)] font-bold text-xl font-serif">L</span>
            </div>
            <span className="text-xl font-semibold text-white font-serif">LawFirm</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md hover:bg-[var(--navy-light)] transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 pb-20">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-[var(--gold)] text-[var(--navy)] shadow-lg' 
                        : 'text-white/80 hover:bg-[var(--navy-light)] hover:text-white hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-[var(--navy)]' : 'text-white/80 group-hover:text-white group-hover:drop-shadow-sm'
                    }`} />
                    <span className="font-medium">{t(item.name)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--navy-light)] bg-[var(--navy)]">
          <div className="text-xs text-white/60 text-center">
            © 2024 LawFirm SaaS
          </div>
        </div>
      </div>
    </>
  );
}

