'use client';

import { useRouter } from 'next/navigation';
import { Scale, ArrowLeft, Shield, Eye, Lock, Database, Mail } from 'lucide-react';

export default function PrivacyPage() {
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
                <p className="text-sm text-muted-foreground">Politika privatnosti</p>
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
                <Shield className="w-4 h-4 text-navy" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-serif">Politika privatnosti</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Zadnja ažuriranja: 15. siječnja 2025.</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gold" />
                <span>1. Prikupljanje podataka</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Prikupljamo sljedeće vrste podataka:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li><strong>Osobni podaci:</strong> ime, e-pošta, kontakt informacije</li>
                  <li><strong>Profesionalni podaci:</strong> informacije o vašoj pravnici, klijentima, slučajevima</li>
                  <li><strong>Tehnički podaci:</strong> IP adresa, tip preglednika, informacije o uređaju</li>
                  <li><strong>Korištenje usluge:</strong> aktivnosti na platformi, pristupne logove</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Database className="w-5 h-5 text-gold" />
                <span>2. Kako koristimo vaše podatke</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Vaše podatke koristimo za:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>Pružanje i poboljšanje naše usluge</li>
                  <li>Komunikaciju s vama o vašem računu</li>
                  <li>Pružanje korisničke podrške</li>
                  <li>Sigurnosne svrhe i sprječavanje zlouporabe</li>
                  <li>Pridržavanje zakonskih obveza</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gold" />
                <span>3. Sigurnost podataka</span>
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Implementiramo najviše sigurnosne standarde:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li><strong>Enkripcija:</strong> Svi podaci su enkriptirani u prijenosu i mirovanju</li>
                  <li><strong>Sigurnosni protokoli:</strong> Koristimo SSL/TLS i najnovije sigurnosne protokole</li>
                  <li><strong>Pristup:</strong> Ograničen pristup podacima samo ovlaštenom osoblju</li>
                  <li><strong>Backup:</strong> Redovito sigurnosno kopiranje podataka</li>
                  <li><strong>Monitoring:</strong> Kontinuirano praćenje sigurnosnih prijetnji</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">4. Dijeljenje podataka</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Vaše podatke ne dijelimo s trećim stranama, osim u sljedećim slučajevima:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>S vašom izričitom suglasnošću</li>
                  <li>Kada je potrebno za pružanje usluge (pouzdani partneri)</li>
                  <li>Kada zahtijeva zakon ili sudska odluka</li>
                  <li>Za zaštitu naših prava ili sigurnosti</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">5. Vaša prava</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Imate sljedeća prava u odnosu na vaše podatke:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li><strong>Pristup:</strong> Možete zatražiti kopiju vaših podataka</li>
                  <li><strong>Ispravak:</strong> Možete zatražiti ispravak netočnih podataka</li>
                  <li><strong>Brisanje:</strong> Možete zatražiti brisanje vaših podataka</li>
                  <li><strong>Ograničenje:</strong> Možete ograničiti korištenje vaših podataka</li>
                  <li><strong>Prijenos:</strong> Možete zatražiti prijenos podataka</li>
                  <li><strong>Prigovor:</strong> Možete se usprotiviti obradi podataka</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">6. Kolačići (Cookies)</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Koristimo kolačiće za poboljšanje vašeg iskustva na našoj platformi. 
                  Možete upravljati kolačićima kroz postavke vašeg preglednika.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">7. Zadržavanje podataka</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Vaše podatke čuvamo samo onoliko dugo koliko je potrebno za pružanje usluge 
                  ili u skladu s zakonskim obvezama. Nakon otkazivanja računa, podaci se čuvaju 
                  30 dana, a zatim se sigurno brišu.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">8. Promjene politike</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Možemo ažurirati ovu politiku privatnosti. O značajnim promjenama ćemo vas 
                  obavijestiti putem e-pošte ili kroz platformu.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gold" />
                <span>Kontakt</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                Ako imate pitanja o ovoj politici privatnosti ili želite koristiti svoja prava, 
                kontaktirajte nas:
              </p>
              <p className="text-gold font-medium">privacy@odvjetnikai.com</p>
              <p className="text-sm text-muted-foreground mt-2">
                Odgovorit ćemo u roku od 30 dana.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
