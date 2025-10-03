'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RouteProtectionProps {
  children: React.ReactNode;
}

export default function RouteProtection({ children }: RouteProtectionProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = useMemo(() => ['/login', '/register', '/pricing', '/subscription-inactive', '/auth/confirm'], []);
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!user && !isPublicRoute) {
      // User is not authenticated and trying to access protected route
      router.push('/login');
    } else if (user && isPublicRoute && pathname !== '/pricing' && pathname !== '/subscription-inactive' && pathname !== '/register') {
      // User is authenticated but trying to access login
      router.push('/');
    } else if (user && !isPublicRoute && subscriptionStatus !== 'active') {
      // User is authenticated but subscription is not active
      router.push('/subscription-inactive');
    }
  }, [user, loading, subscriptionStatus, isPublicRoute, router, pathname]);

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

  // Don't render auth pages if user is already authenticated (except pricing, subscription-inactive, and register)
  if (user && isPublicRoute && pathname !== '/pricing' && pathname !== '/subscription-inactive' && pathname !== '/register') {
    return null;
  }

  // Don't render protected content if user doesn't have active subscription
  if (user && !isPublicRoute && subscriptionStatus !== 'active') {
    return null;
  }

  return <>{children}</>;
}
