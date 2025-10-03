/**
 * Subscription utilities for trial and subscription management
 */

export interface Profile {
  id: string;
  email: string;
  subscription_status: string;
  subscription_plan?: string;
  trial_expires_at?: string;
  trial_limit?: number;
  role?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

/**
 * Check if user is on trial
 */
export function isTrial(profile: Profile): boolean {
  return profile.subscription_status === 'trial';
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(profile: Profile): boolean {
  if (!isTrial(profile) || !profile.trial_expires_at) {
    return false;
  }
  
  const now = new Date();
  const trialEnd = new Date(profile.trial_expires_at);
  return now > trialEnd;
}

/**
 * Get days left in trial
 */
export function daysLeft(profile: Profile): number {
  if (!isTrial(profile) || !profile.trial_expires_at) {
    return 0;
  }
  
  const now = new Date();
  const trialEnd = new Date(profile.trial_expires_at);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Get trial limit (default 20)
 */
export function trialLimit(profile: Profile): number {
  return profile.trial_limit || 20;
}

/**
 * Format database error messages to user-friendly Croatian messages
 */
export function formatDbErrorToUserMessage(error: string): string {
  if (error.includes('Trial limit')) {
    return 'Dosegnut je trial limit (20). Nadogradi plan za nastavak.';
  }
  
  if (error.includes('Trial expired')) {
    return 'Trial je istekao. Nadogradi plan za nastavak.';
  }
  
  // Default error message
  return 'Greška pri spremanju. Molimo pokušajte ponovno.';
}
