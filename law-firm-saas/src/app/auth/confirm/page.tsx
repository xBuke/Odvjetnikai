'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Scale, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const email = searchParams.get('email');

      console.log('Confirmation params:', { token, type, email });

      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Nevaljan ili nedostaje token za potvrdu.');
        return;
      }

      try {
        // Verify the OTP token using the correct method
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        console.log('Auth verification result:', { authData, authError });

        if (authError) {
          console.error('Email confirmation error:', authError);
          setStatus('error');
          setMessage(`Greška pri potvrdi e-mail adrese: ${authError.message}`);
          return;
        }

        if (authData.user) {
          setStatus('success');
          setMessage('Vaša e-mail adresa je potvrđena ✅ Dobivate besplatni 7-dnevni trial.');
          
          // Wait a bit for the database trigger to activate trial
          setTimeout(() => {
            router.push('/?message=email_confirmed');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Greška pri potvrdi e-mail adrese. Molimo pokušajte ponovno.');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('Dogodila se neočekivana greška. Molimo pokušajte ponovno.');
      }
    };

    confirmEmail();
  }, [searchParams, router]);

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

        {/* Confirmation Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
          <div className="p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-serif mb-4">
                  Potvrđujemo vaš račun...
                </h2>
                <p className="text-muted-foreground">
                  Molimo pričekajte dok potvrđujemo vašu e-mail adresu.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-serif mb-4">
                  Račun potvrđen!
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                      <Scale className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Besplatna 7-dnevna proba aktivirana
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        Vaš besplatni probni period je sada aktivan. Preusmjeravamo vas na dashboard...
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-serif mb-4">
                  Greška pri potvrdi
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Pokušajte ponovno
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
