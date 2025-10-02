# Odvjetnički SaaS - Hrvatski sustav upravljanja odvjetničkim uredom

Ovo je [Next.js](https://nextjs.org) aplikacija za upravljanje odvjetničkim uredom, lokalizirana za hrvatsko tržište.

## Značajke

- **Upravljanje klijentima** - Kompletna baza podataka klijenata s hrvatskim imenima i podacima
- **Upravljanje slučajevima** - Praćenje pravnih slučajeva s hrvatskim kontekstom
- **Naplata i fakturiranje** - Sustav za praćenje radnih sati i izdavanje računa
- **Upravljanje dokumentima** - Arhiva pravnih dokumenata s hrvatskim nazivima
- **Kalendar** - Planiranje sastanaka i rokova
- **Dashboard** - Pregled ključnih metrika ureda

## Početak rada

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
