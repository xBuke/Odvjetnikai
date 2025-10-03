'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Scale, Mail, Lock, Eye, EyeOff, UserPlus, CreditCard } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const router = useRouter();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback function if context is not available
    t = (key: string) => key;
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.fillInAllFields'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // User registered successfully, they will get 7-day trial automatically
        // Redirect to dashboard after successful registration
        router.push('/?message=trial_started');
      }
    } catch {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* App Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gold to-gold-dark rounded-3xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800">
            <Scale className="h-10 w-10 text-navy" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-foreground font-serif tracking-tight">
            OdvjetnikAI
          </h1>
          <p className="mt-3 text-base text-muted-foreground font-medium">
            Profesionalna pravna platforma
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 px-8 py-8 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-navy" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-serif">Registracija</h2>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.enterPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-100 dark:hover:bg-slate-600 rounded-r-xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Trial Info */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                    <Scale className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Besplatna 7-dnevna proba
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Započnite odmah s potpuno besplatnom 7-dnevnom probom. Nema skrivenih troškova, nema potrebe za karticom. 
                      Nakon isteka probnog razdoblja, možete odabrati plan koji vam odgovara.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-bold text-navy bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy mr-2"></div>
                    Kreiranje računa...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registriraj se
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Registracijom se slažete s našim{' '}
                <button
                  onClick={() => router.push('/terms')}
                  className="text-gold hover:text-gold-dark underline transition-colors"
                >
                  uvjetima korištenja
                </button>
                {' '}i{' '}
                <button
                  onClick={() => router.push('/privacy')}
                  className="text-gold hover:text-gold-dark underline transition-colors"
                >
                  politikom privatnosti
                </button>
                .
              </p>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Već imate račun?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="font-medium text-gold hover:text-gold-dark transition-colors"
                >
                  Prijavite se
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
