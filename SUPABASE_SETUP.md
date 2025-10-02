# Supabase Setup Instructions

## Problem
Aplikacija prikazuje "Error Loading Client" jer Supabase nije konfiguriran.

## Rješenje

### 1. Kreirajte Supabase projekt
1. Idite na [supabase.com](https://supabase.com)
2. Kreirajte novi projekt
3. Sačekajte da se projekt postavi

### 2. Konfigurirajte environment varijable
Kreirajte datoteku `.env.local` u root direktoriju projekta:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Postavite bazu podataka
1. Idite u Supabase Dashboard → SQL Editor
2. Kopirajte i pokrenite sadržaj iz `database-setup.sql` datoteke
3. Ovo će kreirati sve potrebne tablice i podatke

### 4. Restartajte development server
```bash
npm run dev
```

## Fallback funkcionalnost
Ako Supabase nije konfiguriran, aplikacija će automatski koristiti mock podatke za:
- Prikaz klijenata
- Prikaz predmeta
- Detalje klijenata
- Detalje predmeta

## Testiranje
1. **Bez Supabase**: Aplikacija će raditi s mock podacima
2. **S Supabase**: Aplikacija će koristiti pravu bazu podataka

## Mock podaci
Aplikacija uključuje 5 test klijenata i 5 test predmeta koji se koriste kada Supabase nije dostupan.

### Klijenti:
- Marko Marić (ID: 1)
- Ana Novak (ID: 2) 
- Petar Petrović (ID: 3)
- Ivana Ivanić (ID: 4)
- Tomislav Tomić (ID: 5)

### Predmeti:
- Corporate Merger (ID: 1)
- Divorce Settlement (ID: 2)
- Contract Dispute (ID: 3)
- Property Purchase (ID: 4)
- Employment Law (ID: 5)

## Napomene
- Kreiranje novih klijenata/predmeta zahtijeva Supabase konfiguraciju
- Mock podaci su samo za čitanje
- Sve funkcionalnosti rade kada je Supabase konfiguriran
