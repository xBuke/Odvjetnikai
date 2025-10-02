'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground overflow-x-auto bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-border" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-[var(--gold)] transition-colors duration-200 flex-shrink-0 p-1 rounded-md hover:bg-[var(--light-gray)]"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-[var(--gold)] transition-colors duration-200 truncate max-w-[120px] sm:max-w-none p-1 rounded-md hover:bg-[var(--light-gray)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--navy)] font-semibold truncate max-w-[120px] sm:max-w-none">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
