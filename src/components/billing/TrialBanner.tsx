'use client';

import Link from 'next/link';
import { Profile, isTrial, isTrialExpired, daysLeft, trialLimit } from '@/lib/subscription';
import { Clock, XCircle } from 'lucide-react';

interface TrialBannerProps {
  profile: Profile;
}

export default function TrialBanner({ profile }: TrialBannerProps) {
  // Only show banner for trial users
  if (!isTrial(profile)) {
    return null;
  }

  const expired = isTrialExpired(profile);
  const days = daysLeft(profile);
  const limit = trialLimit(profile);

  return (
    <div className={`rounded-xl p-4 mb-6 ${
      expired 
        ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' 
        : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${
          expired ? 'text-red-500' : 'text-amber-500'
        }`}>
          {expired ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              {expired ? (
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Trial je istekao
                </h3>
              ) : (
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Trial aktiviran
                </h3>
              )}
              
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {expired ? (
                  <p>Trial je istekao. Nadogradi plan za nastavak korištenja aplikacije.</p>
                ) : (
                  <p>
                    Preostalo {days} {days === 1 ? 'dan' : 'dana'} triala. 
                    Limit: {limit} entiteta (klijenti, predmeti, dokumenti).
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Link
                href="/pricing"
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                  expired
                    ? 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                }`}
              >
                Nadogradi plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
