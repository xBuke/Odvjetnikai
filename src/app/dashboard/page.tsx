'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if no user
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gold to-gold-dark rounded-3xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 mb-6">
            <Loader2 className="h-10 w-10 text-navy animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground font-serif mb-2">
            Učitavanje...
          </h2>
          <p className="text-muted-foreground">
            Provjeravamo vašu autentifikaciju.
          </p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-lg">
              <Scale className="h-8 w-8 text-navy" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                👋 Dobrodošli, {user.email}
              </h1>
              <p className="text-muted-foreground mt-2">
                Vaš dashboard je spreman za korištenje.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Brze statistike</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Aktivni predmeti</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Klijenti</span>
                <span className="font-semibold text-foreground">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dokumenti</span>
                <span className="font-semibold text-foreground">45</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Nedavna aktivnost</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-foreground font-medium">Novi predmet kreiran</p>
                <p className="text-muted-foreground">Prije 2 sata</p>
              </div>
              <div className="text-sm">
                <p className="text-foreground font-medium">Dokument prenesen</p>
                <p className="text-muted-foreground">Prije 4 sata</p>
              </div>
              <div className="text-sm">
                <p className="text-foreground font-medium">Klijent dodan</p>
                <p className="text-muted-foreground">Jučer</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Brze akcije</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/cases')}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-gold/10 to-gold-light/10 hover:from-gold/20 hover:to-gold-light/20 transition-all duration-200 border border-gold/20"
              >
                <p className="font-medium text-foreground">Novi predmet</p>
                <p className="text-sm text-muted-foreground">Kreiraj novi predmet</p>
              </button>
              <button 
                onClick={() => router.push('/clients')}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-gold/10 to-gold-light/10 hover:from-gold/20 hover:to-gold-light/20 transition-all duration-200 border border-gold/20"
              >
                <p className="font-medium text-foreground">Novi klijent</p>
                <p className="text-sm text-muted-foreground">Dodaj novog klijenta</p>
              </button>
              <button 
                onClick={() => router.push('/documents')}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-gold/10 to-gold-light/10 hover:from-gold/20 hover:to-gold-light/20 transition-all duration-200 border border-gold/20"
              >
                <p className="font-medium text-foreground">Prenesi dokument</p>
                <p className="text-sm text-muted-foreground">Dodaj novi dokument</p>
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Informacije o računu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">E-mail adresa</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID korisnika</p>
              <p className="font-medium text-foreground font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail potvrđen</p>
              <p className="font-medium text-foreground">
                {user.email_confirmed_at ? '✅ Da' : '❌ Ne'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datum kreiranja</p>
              <p className="font-medium text-foreground">
                {new Date(user.created_at).toLocaleDateString('hr-HR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
