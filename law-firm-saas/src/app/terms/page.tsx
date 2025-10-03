'use client';

import { useRouter } from 'next/navigation';
import { Scale, ArrowLeft, FileText, Shield, Users, CreditCard } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Nazad</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-serif">OdvjetnikAI</h1>
                <p className="text-sm text-muted-foreground">Uvjeti korištenja</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-navy" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-serif">Uvjeti korištenja</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Zadnja ažuriranja: 15. siječnja 2025.</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gold" />
                <span>1. Prihvaćanje uvjeta</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Korištenjem OdvjetnikAI platforme ("Usluga") pristajete na ove uvjete korištenja. 
                  Ako se ne slažete s bilo kojim dijelom ovih uvjeta, ne smijete koristiti našu uslugu.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-gold" />
                <span>2. Opis usluge</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  OdvjetnikAI je profesionalna pravna platforma koja pruža:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>Upravljanje klijentima i slučajevima</li>
                  <li>Generiranje pravnih dokumenata</li>
                  <li>Praćenje rokova i obaveza</li>
                  <li>Fakturiranje i naplata</li>
                  <li>Sigurno pohranjivanje dokumenata</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-gold" />
                <span>3. Besplatna proba i naplata</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Pružamo 7-dnevnu besplatnu probu bez potrebe za kreditnom karticom. 
                  Nakon isteka probnog razdoblja:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>Možete odabrati plan koji vam odgovara</li>
                  <li>Nema automatske naplate bez vaše suglasnosti</li>
                  <li>Možete otkazati pretplatu u bilo kojem trenutku</li>
                  <li>Podaci se čuvaju 30 dana nakon otkazivanja</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">4. Odgovornost korisnika</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Kao korisnik naše platforme, obvezujete se:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>Pružati točne i ažurne podatke</li>
                  <li>Čuvati sigurnost svojih pristupnih podataka</li>
                  <li>Koristiti uslugu u skladu s važećim zakonima</li>
                  <li>Ne dijeliti svoje pristupne podatke s trećim stranama</li>
                  <li>Poštovati prava intelektualnog vlasništva</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">5. Sigurnost podataka</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Važimo sigurnost vaših podataka. Koristimo najnovije sigurnosne protokole i enkripciju 
                  za zaštitu vaših informacija. Vaši podaci se ne dijele s trećim stranama bez vaše izričite suglasnosti.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">6. Ograničenje odgovornosti</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  OdvjetnikAI ne snosi odgovornost za bilo kakve gubitke ili štete koje mogu nastati 
                  korištenjem naše platforme. Platforma se pruža "kakva jest" bez jamstava.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">7. Promjene uvjeta</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Zadržavamo pravo mijenjati ove uvjete korištenja. O značajnim promjenama ćemo vas 
                  obavijestiti putem e-pošte ili kroz platformu.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Kontakt</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Ako imate pitanja o ovim uvjetima korištenja, kontaktirajte nas na:
              </p>
              <p className="text-gold font-medium mt-2">support@odvjetnikai.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
