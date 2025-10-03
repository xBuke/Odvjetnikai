'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Get user subscription status from Supabase
        const { data, error } = await supabase.rpc('get_user_subscription_status', {
          user_id: user.id
        });

        if (error) {
          console.error('Error checking subscription status:', error);
          setSubscriptionStatus('inactive');
        } else {
          setSubscriptionStatus(data || 'inactive');
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus('inactive');
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, authLoading, router]);

  // Show loading spinner while checking authentication and subscription
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to subscription inactive page if user doesn't have active subscription
  if (user && subscriptionStatus !== 'active') {
    router.push('/subscription-inactive');
    return null;
  }

  // Show children if user has active subscription
  return <>{children}</>;
}
