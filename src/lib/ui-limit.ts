/**
 * UI limit utilities for trial subscription management
 */

import { Profile, isTrial, isTrialExpired, trialLimit } from './subscription';

export interface LimitCheckResult {
  ok: boolean;
  reason?: string;
}

/**
 * Check if user can create a new entity based on trial limits
 */
export function canCreateEntity(profile: Profile, currentCount: number): LimitCheckResult {
  // If not on trial, allow creation
  if (!isTrial(profile)) {
    return { ok: true };
  }
  
  // If trial expired, block creation
  if (isTrialExpired(profile)) {
    return { 
      ok: false, 
      reason: 'Trial je istekao. Nadogradi plan za nastavak.' 
    };
  }
  
  // If trial limit reached, block creation
  const limit = trialLimit(profile);
  if (currentCount >= limit) {
    return { 
      ok: false, 
      reason: `Dosegnut je trial limit (${limit}). Nadogradi plan za nastavak.` 
    };
  }
  
  // Trial is active and limit not reached
  return { ok: true };
}
