# 🌍 USA GeoArena - Geografsko-sportska kviz igra

Zabavna i adiktivna igra gde pogađaš lokacije svetskih sportskih stadiona, događaja i klubova! ⚽🏀🏈

**Live:** [geo-arena-six.vercel.app](https://geo-arena-six.vercel.app)  
**GitHub:** [bojandek/USA-Geo-Arena](https://github.com/bojandek/USA-Geo-Arena)

## ✨ Funkcionalnosti

### 🎯 Dnevni izazov
- 10 novih pitanja svakog dana
- Klikni na mapu da pogađaš lokacije
- Osvoji do 1000 poena po pitanju (zasnovano na tačnosti)
- Rezultati se čuvaju lokalno

### 🌐 Dve runde
- **USA** (`/daily`) - američka runda na ravnoj mapi, uokvirenoj na državu
- **World** (`/world`) - svetska runda na **3D globusu** (bez američkih pitanja)

### ⚔️ Battle Mode
- Takmičenje protiv AI protivnika (nije pravi multiplayer)
- 3 runde po 30 sekundi
- Brza i uzbudljiva akcija

### 🏆 Rang lista
- Vidi top 10 igrača
- Poređaj se sa drugima
- Prati najbolje rezultate

### 📊 Profil i napredak
- Sistem nivoa (1+ nivo po 5000 poena)
- Streak sistem - igraj svaki dan!
- Bedževi i dostignuća
- Statistika (najbolji skor, prosek, broj igara)

### 🔥 Gamifikacija
- **Streaks**: Igraj uzastopno da zadržiš streak
- **Bedževi**: Otključaj specijalne nagrade
- **Nivoi**: Napreduj kroz nivoe
- **Share cards**: Podeli rezultate sa emoji grafikom

## 🎮 Kako igrati

1. **Klikni "Počni igru"** na početnoj stranici
2. **Pročitaj pitanje** o sportskoj lokaciji
3. **Klikni na mapu** gde misliš da se lokacija nalazi
4. **Potvrdi odgovor** i vidi koliko si tačan
5. **Osvoji poene** na osnovu udaljenosti (bliže = više poena)

### Scoring sistem
- 0-25 km: 1000 poena 🎯
- 25-50 km: 950 poena ⭐
- 50-100 km: 900 poena 👍
- 100-200 km: 800 poena
- 200-500 km: 600 poena
- 500-1000 km: 400 poena
- 1000-2000 km: 200 poena
- 2000-5000 km: 100 poena
- 5000+ km: 50 poena

## 🛠️ Tehnologije

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI komponente
- **MapLibre GL 5** - Interaktivna mapa i 3D globus
- **react-map-gl** - React omotač za MapLibre
- **Framer Motion** - Animacije
- **React Router** - Navigacija
- **localStorage** - Lokalno čuvanje podataka

## 🚀 Razvoj

```bash
# Instalacija
npm install

# Pokretanje dev servera
npm run dev

# Unit testovi (node:test)
npm test

# Provera tipova
npm run typecheck

# Build za produkciju (typecheck + build)
npm run build
```

### Slike pitanja

Fotografije dolaze sa Wikimedia Commonsa i prikazuju se samo posle odgovora,
uz autora, licencu i link do originalne datoteke:

```bash
npm run images:fetch
```

Skripta traži stranicu mesta preko koordinata pitanja, proverava da se naziv
poklapa, pa uzima sliku sa Commonsa samo ako ima slobodnu licencu. Rezultat je
`src/lib/question-images.ts`; pitanje bez pouzdanog pogotka ostaje bez slike.
Keš se čuva u `scripts/.question-images-cache.json` (nije u gitu), pa se
prekinut posao nastavlja bez ponovnih API poziva. Za produkciju se može
podesiti `WIKIMEDIA_USER_AGENT` sa kontaktom.

Ako je u `.env` postavljen `PEXELS_API_KEY` (vidi `.env.example`), preostala
pitanja mogu dobiti ilustrativnu stock fotografiju:

```bash
npm run images:fetch -- --fill-pexels
```

Takve slike su u karti označene sa **Illustrative photo** i nose credit
fotografa i link do Pexelsa. Pexels se nikad ne poziva iz browsera.

### Brand ikona

Logotip „Arena" (tamna pločica, globus sa SAD-om i crvena orbita) se generiše
iz pravih geografskih podataka — granice država iz US Census fajla, ostali svet
iz Natural Earth:

```bash
node scripts/brand/generate-icon.cjs
node scripts/brand/generate-png-icons.cjs
node scripts/brand/generate-og-image.cjs
```

Prvi daje `public/brand-icon.svg`, iz kog drugi pravi PWA ikonice,
`favicon.ico` i `email-icon.png`, a treći socijalnu karticu `og-image.png` —
pa svi oni nikad ne mogu da se raziđu.

## 🎨 Dizajn

- **Primarna boja**: #FF4655 (Živo crvena/narandžasta)
- **Sekundarna boja**: #FF8B3D (Narandžasta)
- **Akcent boja**: #FFD700 (Zlatna)
- **Stil**: Energičan, gamified, sportski
- **Animacije**: Smooth i motivacione

## 📱 Responsive

Aplikacija je u potpunosti responsive i optimizovana za:
- 📱 Mobile uređaje
- 💻 Desktop računare
- 🖥️ Tablete

## 🎯 Buduća unapređenja

- [ ] Supabase integracija za backend
- [ ] Pravi multiplayer sa WebSocket-ima
- [ ] Više kategorija pitanja
- [ ] Težinski nivoi (easy, medium, hard)
- [ ] Globalna rang lista
- [ ] Social login (Google, Facebook)
- [ ] Push notifikacije za dnevne izazove
- [ ] Različiti game mode-ovi

## 🖥️ Server (Vercel)

Sajt ima osam server rutina. Izvor je u `server/`, a `npm run build` ih esbuild‑om pakuje u samostalne `api/*.js` funkcije za Vercel. Sve su **opcione** — dok nisu podešene, sajt radi potpuno isto, samo ih nema.

| Ruta | Šta radi |
|---|---|
| `server/share.ts` | Stranica na koju pokazuje deljeni link — nosi OG tagove i vodi igrača na igru |
| `server/newsletter.ts` | Dnevni email (cron) ili HTML pregled |
| `server/admin/newsletter.ts` | Zaštićeni admin pregled i izvoz emaila |
| `server/leaderboard.ts` | Globalna rang lista: čita i upisuje rezultate |
| `server/license.ts` | Proverava da li je licencni ključ aktivan |
| `server/checkout.ts` | Pravi checkout kod Lemon Squeezy‑ja |
| `server/webhook.ts` | Prima obaveštenje kad nešto kupi Pro |
| `server/submissions.ts` | Prima pitanja koja igrači pošalju |

> `api/` se generiše iz `server/`, ali je commitovan: Vercel prepoznaje funkcije po fajlovima koji su u repou prije builda, pa bez njih sve `/api` rute vraćaju 404. Ne menjaj ga ručno; menjaj `server/`, pokreni `npm run build:api` i commituj i `api/`. Test `tests/api-bundles.test.ts` pada kad je `api/` zastario.

### Podešavanje

1. **Supabase** (baza) — [supabase.com](https://supabase.com) → novi projekat → Settings → API
2. Pokreni `supabase/schema.sql` jednom (SQL editor u Supabase‑u) — pravi tri tabele
3. **Lemon Squeezy** (plaćanja) — [lemonsqueezy.com](https://www.lemonsqueezy.com) → Settings → API → ključ
4. U Vercel projektu dodaj Environment Variables:

```
SITE_URL=https://tvoj-domen.com
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_VARIANT_ID=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
```

> **Važno:** ove promenljive nisu `VITE_` — Vite bi ih stavio u JavaScript koji svako preuzima, pa bi ključevi bili javni. Oni se čitaju samo na serveru.

### Lokalno

```powershell
npm run dev          # sajt (Vite)
vercel dev          # sajt + server rute
```

Vite ne čita `.env` za server kod, pa za testiranje ruta treba `vercel dev`.

### Webhook

Lemon Squeezy → Settings → Webhooks → dodaj `https://tvoj-domen.com/api/webhook` i kopiraj secret u `LEMON_SQUEEZY_WEBHOOK_SECRET`.

---

## 📄 Licenca

MIT License - Slobodno koristi i prilagodi!

---

**Napravljeno sa ❤️ za ljubitelje sporta i geografije**

🌍⚽🏀🏈🎯
