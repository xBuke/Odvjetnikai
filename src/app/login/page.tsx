'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, Mail, Lock, Scale, UserPlus, CreditCard } from 'lucide-react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, checkSubscriptionStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    // Fallback function if context is not available
    t = (key: string) => key;
  }

  // Price formatting function - always use EUR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get price from environment variable or fallback
  const monthlyPrice = process.env.NEXT_PUBLIC_PRICE_PER_MONTH 
    ? parseFloat(process.env.NEXT_PUBLIC_PRICE_PER_MONTH) 
    : 147; // Fallback to €147

  // Handle URL parameter to set initial tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
      setError(''); // Reset error when switching to register tab
    } else if (tab === 'login') {
      setActiveTab('login');
      setError(''); // Reset error when switching to login tab
    }
  }, [searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Custom validation
    if (!email || !password) {
      setError(t('auth.fillInAllFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Molimo unesite valjanu adresu e-pošte');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError('Lozinka mora imati barem 8 znakova');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Check subscription status after successful login
        const subscriptionStatus = await checkSubscriptionStatus();
        
        if (subscriptionStatus === 'active') {
          router.push('/');
        } else {
          // Redirect to pricing page with message for inactive users
          router.push('/pricing?message=subscription_inactive');
        }
      }
    } catch {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Custom validation
    if (!email || !password) {
      setError(t('auth.fillInAllFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Molimo unesite valjanu adresu e-pošte');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError('Lozinka mora imati barem 8 znakova');
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-lg">
            <Scale className="h-8 w-8 text-navy" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground font-serif">
            OdvjetnikAI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeTab === 'login' ? t('auth.signInAccount') : 'Pridružite se našoj platformi'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-gold border-b-2 border-gold bg-gold/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Prijava</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-gold border-b-2 border-gold bg-gold/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Registracija</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'login' ? (
              /* Login Form */
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
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
                      autoComplete="current-password"
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
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-navy bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy mr-2"></div>
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-2">
                    {t('auth.emailAddress')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                      placeholder={t('auth.enterEmail')}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-2">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        7-dnevni besplatni trial
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Počnite odmah s 7-dnevnim besplatnim trial-om. Nakon isteka, automatski će se naplatiti {formatPrice(monthlyPrice)}/mjesec ako se ne otkaže.
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
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-navy bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy mr-2"></div>
                      Kreiranje računa...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Registriraj se i počni trial
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Registracijom se slažete s našim{' '}
                  <Link href="/terms" className="text-gold hover:text-gold-dark underline transition-colors">
                    uvjetima korištenja
                  </Link>
                  {' '}i{' '}
                  <Link href="/privacy" className="text-gold hover:text-gold-dark underline transition-colors">
                    politikom privatnosti
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
