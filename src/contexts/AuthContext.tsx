'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/lib/subscription';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: string | null;
  profile: Profile | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  checkSubscriptionStatus: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const checkSubscriptionStatus = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_user_subscription_status', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking subscription status:', error);
        return 'inactive';
      }

      const status = data || 'inactive';
      setSubscriptionStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return 'inactive';
    }
  }, [user]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      setProfile(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_status, subscription_plan, trial_expires_at, trial_limit, role, full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Create a basic profile from user data if profile doesn't exist
        setProfile({
          id: user.id,
          email: user.email || '',
          subscription_status: 'inactive',
          subscription_plan: 'basic',
          trial_expires_at: undefined,
          trial_limit: 20,
          role: 'user',
          full_name: user.user_metadata?.full_name || '',
          username: user.user_metadata?.username || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription status when user changes
        if (session?.user) {
          await checkSubscriptionStatus();
          await refreshProfile();
        } else {
          setSubscriptionStatus(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkSubscriptionStatus, refreshProfile]);

  // Separate useEffect for subscription status checking
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      refreshProfile();
    }
  }, [user, checkSubscriptionStatus, refreshProfile]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setSubscriptionStatus(null);
    setProfile(null);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    subscriptionStatus,
    profile,
    signUp,
    signIn,
    signOut,
    checkSubscriptionStatus,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
