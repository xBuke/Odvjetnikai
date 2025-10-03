'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RouteProtectionProps {
  children: React.ReactNode;
}

export default function RouteProtection({ children }: RouteProtectionProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = useMemo(() => ['/login', '/register'], []);
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!user && !isPublicRoute) {
      // User is not authenticated and trying to access protected route
      router.push('/login');
    } else if (user && isPublicRoute) {
      // User is authenticated but trying to access login/register
      router.push('/');
    }
  }, [user, loading, isPublicRoute, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if user is not authenticated and not on public route
  if (!user && !isPublicRoute) {
    return null;
  }

  // Don't render auth pages if user is already authenticated
  if (user && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
