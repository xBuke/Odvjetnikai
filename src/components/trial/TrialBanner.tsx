'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialBannerProps {
  onUpgrade?: () => void;
}

export default function TrialBanner({ onUpgrade }: TrialBannerProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [hoursLeft, setHoursLeft] = useState<number>(0);

  useEffect(() => {
    if (profile?.trial_expires_at) {
      const now = new Date();
      const trialEnd = new Date(profile.trial_expires_at);
      const diffMs = trialEnd.getTime() - now.getTime();
      
      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        setDaysLeft(days);
        setHoursLeft(hours);
      }
    }
  }, [profile]);

  if (!profile || profile.subscription_status !== 'trial') {
    return null;
  }

  const isExpiringSoon = daysLeft <= 2;
  const isExpired = daysLeft <= 0 && hoursLeft <= 0;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/pricing');
    }
  };

  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Trial je istekao
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Vaš 7-dnevni trial je istekao. Molimo odaberite plan da nastavite koristiti aplikaciju.
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Odaberi plan
          </button>
        </div>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Trial uskoro istječe
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {daysLeft > 0 ? (
                <>Vaš trial istječe za {daysLeft} {daysLeft === 1 ? 'dan' : 'dana'}</>
              ) : (
                <>Vaš trial istječe za {hoursLeft} {hoursLeft === 1 ? 'sat' : 'sati'}</>
              )}
              . Odaberite plan da nastavite koristiti aplikaciju.
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Odaberi plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-center">
        <CreditCard className="h-5 w-5 text-blue-400 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Besplatni trial aktiviran
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {daysLeft > 0 ? (
              <>Imate {daysLeft} {daysLeft === 1 ? 'dan' : 'dana'} besplatnog trial-a</>
            ) : (
              <>Imate {hoursLeft} {hoursLeft === 1 ? 'sat' : 'sati'} besplatnog trial-a</>
            )}
            . Nakon isteka, automatski će se naplatiti €147/mjesec ako se ne otkaže.
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Odaberi plan
        </button>
      </div>
    </div>
  );
}
