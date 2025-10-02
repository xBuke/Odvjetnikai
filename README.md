# Odvjetnički SaaS - Hrvatski sustav upravljanja odvjetničkim uredom

Ovo je [Next.js](https://nextjs.org) aplikacija za upravljanje odvjetničkim uredom, lokalizirana za hrvatsko tržište.

## Značajke

- **Autentifikacija** - Sigurna prijava i registracija korisnika s Supabase
- **Upravljanje klijentima** - Kompletna baza podataka klijenata s hrvatskim imenima i podacima
- **Upravljanje slučajevima** - Praćenje pravnih slučajeva s hrvatskim kontekstom
- **Naplata i fakturiranje** - Sustav za praćenje radnih sati i izdavanje računa
- **Upravljanje dokumentima** - Arhiva pravnih dokumenata s hrvatskim nazivima
- **Kalendar** - Planiranje sastanaka i rokova
- **Dashboard** - Pregled ključnih metrika ureda

## Postavljanje

### 1. Supabase konfiguracija

1. Kreirajte novi projekt na [Supabase](https://supabase.com)
2. Idite na Settings > API u vašem Supabase projektu
3. Kopirajte URL i anon key
4. Kreirajte `.env.local` datoteku u root direktoriju:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Baza podataka

1. Idite na SQL Editor u vašem Supabase projektu
2. Kopirajte i pokrenite sadržaj `database-setup.sql` datoteke
3. Ovo će kreirati sve potrebne tablice i umetnuti uzorak podataka

### 3. Storage (Skladište)

1. Idite na Storage u vašem Supabase projektu
2. Kliknite "Create a new bucket"
3. Nazovite ga `documents`
4. Postavite ga kao **Public** (za preuzimanje datoteka)
5. Kliknite "Create bucket"

### 4. Pokretanje aplikacije

Prvo pokrenite development server:

```bash
npm run dev
# ili
yarn dev
# ili
pnpm dev
# ili
bun dev
```

Otvorite [http://localhost:3000](http://localhost:3000) u pregledniku da vidite rezultat.

### 5. Autentifikacija

Aplikacija koristi Supabase za autentifikaciju:
- **Registracija**: `/register` - Kreirajte novi račun
- **Prijava**: `/login` - Prijavite se u aplikaciju
- **Odjava**: Kliknite na logout gumb u gornjem desnom kutu

Sve rute su zaštićene - neautentificirani korisnici će biti preusmjereni na login stranicu.

## Rješavanje problema

### Greška "Error saving client: {}"

Ova greška se javlja kada:
1. **Supabase nije konfiguriran** - Provjerite da li su environment varijable postavljene
2. **Baza podataka nije postavljena** - Pokrenite `database-setup.sql` u Supabase SQL Editoru
3. **Tablica 'clients' ne postoji** - Kreirajte tablicu pomoću SQL skripte

### Greška "Bucket not found"

Ova greška se javlja kada:
1. **Storage bucket nije kreiran** - Kreirajte bucket "documents" u Supabase Storage
2. **Bucket nije javni** - Postavite bucket kao public za preuzimanje datoteka
3. **Storage policies nisu postavljene** - Konfigurirajte dozvole za autentificirane korisnike

### Provjera konfiguracije

1. Provjerite da li `.env.local` datoteka postoji i sadrži ispravne vrijednosti
2. Provjerite da li su sve tablice kreirane u Supabase
3. Provjerite da li je storage bucket "documents" kreiran
4. Provjerite konzolu preglednika za detaljnije greške

Možete početi uređivati stranicu modificiranjem `app/page.tsx`. Stranica se automatski ažurira dok uređujete datoteku.

Ovaj projekt koristi [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) za automatsku optimizaciju i učitavanje [Geist](https://vercel.com/font) fonta.

## Lokalizacija

Aplikacija je potpuno lokalizirana za hrvatsko tržište:
- Hrvatska imena klijenata i tvrtki
- Hrvatski pravni kontekst i nazivi slučajeva
- Hrvatski nazivi dokumenata i ugovora
- Hrvatski adrese i kontakt podaci
- Hrvatski nazivi za pravne termine

## Saznajte više

Za više informacija o Next.js-u, pogledajte sljedeće resurse:

- [Next.js dokumentacija](https://nextjs.org/docs) - naučite o Next.js značajkama i API-ju.
- [Learn Next.js](https://nextjs.org/learn) - interaktivni Next.js tutorial.

Možete pogledati [Next.js GitHub repozitorij](https://github.com/vercel/next.js) - vaši komentari i doprinosi su dobrodošli!

## Deploy na Vercel

Najlakši način za deploy Next.js aplikacije je korištenje [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) od stvaratelja Next.js-a.

Pogledajte našu [Next.js deployment dokumentaciju](https://nextjs.org/docs/app/building-your-application/deploying) za više detalja.
