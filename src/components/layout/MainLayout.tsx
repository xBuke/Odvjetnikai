'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumb from '../ui/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items = [];

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      
      // Skip dynamic route segments (numbers)
      if (segment.match(/^\d+$/)) {
        continue;
      }
      
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = i === pathSegments.length - 1;
      
      items.push({
        label,
        href: isLast ? undefined : currentPath
      });
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Topbar */}
      <Topbar onMenuClick={toggleSidebar} />
      
      {/* Main content area */}
      <div className="lg:ml-64 lg:pt-16">
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Breadcrumb */}
            {pathname !== '/' && (
              <div className="mb-6">
                <Breadcrumb items={getBreadcrumbItems()} />
              </div>
            )}
            <div className="w-full overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
