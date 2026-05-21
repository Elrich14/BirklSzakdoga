# Kerian webshop — Szakdolgozat repó

> English version: [`README.en.md`](README.en.md)

Ruházati cikkekkel foglalkozó full-stack webshop. A repó a szakdolgozat
gyakorlati részének teljes forráskódját tartalmazza: vásárlói felület,
adminisztrációs panel, REST backend, adatbázis-migrációk és seed adatok,
valamint a beépített Claude-alapú termékajánló rendszer.

A dolgozat szövege a [`docs/`](docs/) mappában található
(`Birkl Erik András szakdolgozat.docx`).

## Mit tud

Vásárlói oldal:

- regisztráció és bejelentkezés (e-mail + jelszó vagy Google OAuth)
- termékböngészés valós idejű (debounce-olt) kereséssel
- szűrés méret, szín, nem, ár szerint
- variáns-alapú kosárkezelés (méret + szín + nem kombináció)
- felhasználónkénti kosár-perzisztencia
- kívánságlista bejelentkezett felhasználóknak
- rendelésfeladás szállítási és számlázási címmel
- online bankkártyás fizetés Stripe Checkout integráción keresztül
- saját rendelések állapotának követése
- termékvélemény és csillagozás kézbesített rendelés után
- mesterséges intelligencia-alapú termékajánló (Claude Haiku 4.5):
  a kosár tartalmához stílusban, színben illő termékeket
  javasol, és csak olyat ajánl, ami még nincs a kosárban
- magyar/angol nyelv és sötét/világos téma váltás
- automatikus kijelentkezés 30 perc inaktivitás után

Admin oldal:

- belépés kötelező TOTP kétfaktoros (2FA) hitelesítéssel
- termékek létrehozása, szerkesztése, törlése képfeltöltéssel
- variánsonkénti készletszint kezelése
- rendelések listázása és állapotváltása
  (pending, paid, shipped, delivered, cancelled)
- analitikai dashboard: bevétel, rendelésszám, idősoros trendek
- vélemények moderációja

## Tech stack

Frontend: Next.js 15 (App Router, Turbopack), TypeScript, Material-UI v7
és Emotion, Zustand a kosárhoz, TanStack Query a szerveroldali adatokhoz,
Formik és Yup a űrlapokhoz, i18next a többnyelvűséghez.

Backend: Node.js, Express.js, Sequelize v6, Passport.js a Google OAuth-hoz,
otplib a TOTP-hez, Nodemailer az e-mail küldéshez, Multer a fájlfeltöltéshez.

Adatbázis: PostgreSQL 15. Lokálisan Docker Compose alól, élesben Supabase
managed szolgáltatáson.

Külső szolgáltatások: Cloudinary képtárolás, Stripe fizetés, Google OAuth,
Anthropic Claude AI ajánló, Gmail SMTP rendelési e-mailekhez.

Konténerizáció: Docker Compose a frontend, backend és postgres szervízekkel.

A pontos technológiai döntések indoklása a dolgozat 2. fejezetében olvasható.

## Architektúra

Háromrétegű (three-tier) architektúra. A prezentációs réteg a Next.js
frontend a 3001-es porton, MUI komponensekkel, Zustand-alapú kosárral és
React Query-vel a szerveroldali adatokhoz. Az alkalmazásréteg az Express
backend a 3000-as porton, JWT-alapú hitelesítéssel és route-onként
szervezett végpontokkal (`auth.js`, `productRoutes.js`, `orderRoutes.js`,
`wishlistRoutes.js`, `reviewRoutes.js`, `adminRoutes.js`,
`twoFactorRoutes.js`, `recommendationsRoutes.js`). Az adatréteg PostgreSQL
relációs adatbázis Sequelize ORM-en keresztül, Supabase-en hosztolva.

A rendelésfeladás pesszimista zárolással (Sequelize tranzakció és
`LOCK.UPDATE`) biztosítja, hogy a készlet ne mehessen negatívba egyidejű
vásárlások esetén.

## Lokális futtatás

### Előfeltételek

- Node.js 20+ és npm
- Docker és Docker Compose
- saját Supabase projekt (ingyenes), vagy alternatívaként a Docker
  Compose-ban szállított lokális Postgres
- opcionálisan saját kulcsok a többi külső szolgáltatáshoz (lásd a
  környezeti változók szekciót)

### Adatbázis: Supabase (ajánlott)

Az alkalmazás elsődlegesen a Supabase managed Postgres szolgáltatására
épül, és a bíráláshoz is ezt javasoljuk. Az alábbi lépéssor minimális,
ingyenes Supabase fiókkal kivitelezhető.

1. Hozz létre egy új projektet a https://supabase.com felületén.
2. A Project Settings → Database menüpont alatt másold ki a connection
   stringet, és tölts ki a `backend/.env`-be a `DB_HOST`, `DB_PORT`,
   `DB_USER`, `DB_PASSWORD`, `DB_NAME` mezőket. A `DB_HOST` értékében
   szerepelnie kell a "supabase" szövegnek — a backend és a Sequelize CLI
   ennek alapján kapcsolja be automatikusan az SSL-t.
3. A migrációk és seedek a saját Supabase adatbázisod ellen futnak (lásd
   az indítási parancsokat lent).

### Docker Compose-zal

```bash
git clone https://github.com/Elrich14/BirklSzakdoga.git
cd BirklSzakdoga

cp backend/.env.example backend/.env
cp frontend/kerian/.env.example frontend/kerian/.env.local
# szerkeszd a két fájlt — minimum a Supabase DB és JWT konfig kell

docker compose up --build
```

A frontend ezután a http://localhost:3001, a backend a http://localhost:3000
címen érhető el.

A séma létrehozásához és a demo felhasználók beültetéséhez egyszer
futtasd a migrációkat és a seedeket a backend containerben:

```bash
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
```

Ha a `package.json`-t módosítod, az új csomagok telepítéséhez törölni
kell a backend node_modules named volume-ját:

```bash
docker compose down
docker volume rm birklszakdoga_backend_node_modules
docker compose up --build
```

A `docker-compose.yml`-ben futó `db` szervíz egy lokális Postgres, amit
csak akkor érdemes használni, ha nem akarsz Supabase projektet
létrehozni. Ebben az esetben a `backend/.env`-ben állítsd be a
`DB_HOST=db`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, `DB_NAME=kerian`
értékeket. SSL ekkor automatikusan kikapcsol.

### Kézi indítás fejlesztéshez

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run startWatch

cd ../frontend/kerian
npm install
npm run dev
```

A migrációk Supabase ellen futnak ha a `DB_HOST` "supabase" szöveget
tartalmaz, lokális Postgres ellen ha nem.

## Környezeti változók

A backend `.env` fájlja az alábbi változókat olvassa.

Kötelezőek a minimális futáshoz:

- `DB_HOST` — PostgreSQL host. Supabase esetén a Project Settings →
  Database alatti connection host (tartalmazza a "supabase" szöveget,
  ennek alapján kapcsol be automatikusan az SSL). Docker Compose lokális
  fallback-jénél `db`, host gépről `localhost`.
- `DB_PORT` — általában `5432`.
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` — adatbáziskapcsolat. Supabase-nél
  a dashboard mutatja, lokális fallback-nél `postgres / postgres / kerian`.
- `JWT_SECRET` — JWT token aláíró kulcs. Generálható például
  `openssl rand -hex 32` paranccsal.
- `TOTP_ENCRYPTION_KEY` — a TOTP secretek titkosító kulcsa
  (32 byte, base64). Az admin 2FA flow-hoz kell.

Opcionális, csak az adott funkcióhoz kötelező:

- `EMAIL_ADMIN`, `EMAIL_PASS` — Gmail-cím és App Password a rendelési
  visszaigazoló e-mailekhez.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  — admin termékkép-feltöltéshez.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — a Google bejelentkezéshez.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — a fizetési flow-hoz
  (test módban). `EUR_TO_HUF_RATE` az árfolyam-konverzióhoz.
- `ANTHROPIC_API_KEY` — a Claude-alapú AI ajánlóhoz. Hiányában az ajánló
  üres listát ad vissza, így a kosároldalon nem jelennek meg javaslatok.
- `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` — a Google OAuth callback és
  redirect URL-jeihez.

A frontend `.env.local` fájlja két változót használ. A `NEXT_PUBLIC_API_URL`
a backend bázis URL-je, kötelező. A `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
csak a fizetési flow-hoz kell.

A teljes lista placeholder értékekkel a `backend/.env.example` és
`frontend/kerian/.env.example` fájlokban található.

## Demo felhasználók és adminként belépés

A `db:seed:all` lefuttatása után két demo user áll rendelkezésre.

- `admin@gmail.com` jelszóval `admin` — admin szerepkörrel, kezdetben
  2FA nélkül. Ezzel a profillal a bíráló közvetlenül be tud lépni, és
  azonnal eljut az `/admin` panelra.
- `erik@gmail.com` jelszóval `1234` — sima vásárlói szerepkör, a
  regisztrált vevői flow demonstrálásához.

### A 2FA flow kipróbálása

Mivel a seedelt admin kezdetben 2FA nélkül van, a bíráló közvetlenül
belép, és az `/admin` panel "Security" tabján bekapcsolhatja a kétfaktoros
hitelesítést. A flow:

1. Bejelentkezés `admin@gmail.com` / `admin`-nal a frontenden.
2. Az `/admin` oldalon a "Security" / Biztonság tabra navigálás.
3. "2FA bekapcsolása" gomb → a UI mutat egy QR-kódot.
4. A QR beolvasása egy authenticator alkalmazással (Google Authenticator,
   Authy, Microsoft Authenticator stb.).
5. Az app által mutatott 6 jegyű kód begépelése a UI-ba — ezzel a 2FA
   aktiválódik, és a backend visszaadja a recovery code-okat.
6. Kijelentkezés és újra belépés — most már a login a TOTP kódot is kéri,
   és csak helyes kóddal jut be újra az `/admin` panelra.

E-mail-megerősítés és külső verifikáció nincs a flow-ban — a QR-kód
beolvasása és a 6 jegyű kód megadása elegendő.

A szerző saját, ténylegesen használt admin accountja
(`elrich.020114@gmail.com`) 2FA-val védett — ezért a 2FA nem csupán
opcionális demo funkció, hanem aktívan használt biztonsági réteg a
rendszerben.

### E-mail tesztelés a vásárlói flow demonstrálásához

Admin szerepkörrel a rendszer szándéka szerint nem lehet vásárolni —
a `/admin` panel a bolt működtetésére szolgál, nem böngészésre.
Tehát a vásárlói és e-mail flow demonstrálásához egy vásárlói
szerepkörű user kell.

A seedelt `erik@gmail.com` egy nem valós cím, így vele leadott rendelés
visszaigazolója egy idegen postafiókba menne (ha létezik), nem a
bírálóhoz. Ehelyett **regisztrálj a frontenden egy új vásárlót saját,
valódi e-mail címmel** — azzal jelentkezz be és add le a teszt-rendelést.
A rendelési visszaigazoló e-mail abba a postafiókba érkezik, amit a
regisztrációnál megadtál.

Az admin oldali rendelés-értesítő ettől függetlenül **minden
teszt-rendelésnél** elindul: a `backend/.env`-ben beállított
`EMAIL_ADMIN` címre megy Nodemailer-rel, függetlenül attól, melyik
vásárlóval rendelt valaki. Ha tehát az `EMAIL_ADMIN`-ként a saját
Gmail-fiókodat adod meg a `.env`-ben, minden teszt-rendelésnél kapsz
egy értesítő e-mailt admin-szemszögből — még akkor is, ha a vásárló
felhasználó nem te magad vagy.

Fontos megkülönböztetés: az adatbázisban lévő `admin@gmail.com` (login
fiók) és a `.env`-ben lévő `EMAIL_ADMIN` (SMTP-feladó és admin-értesítő
címzett) **két teljesen különálló dolog** — semmilyen kód nem köti
össze őket. Az előbbi a bejelentkezéshez, az utóbbi az e-mail küldéshez
és fogadáshoz szolgál.

## Külső szolgáltatások

A rendszer az alábbi külső SaaS szolgáltatásokra épül.

A Supabase az elsődleges managed PostgreSQL szolgáltató — a fejlesztés és
a bírálati futtatás is ez ellen történik. Saját ingyenes projekt szükséges
hozzá. Az SSL-kapcsolat automatikusan bekapcsol, ha a `DB_HOST` tartalmazza
a "supabase" szöveget; ezt a `backend/dataBase.js` futás közben és a
`backend/config/config.js` a Sequelize CLI-hez egyaránt figyeli.
Alternatívaként a `docker-compose.yml`-ben szállított lokális
`postgres:15` is használható, ha nem akarsz Supabase projektet
létrehozni.

A Cloudinary tárolja és szolgálja ki a termékképeket.

A Stripe biztosítja a bankkártyás fizetést Checkout és webhook segítségével.
A repó csak test mode kulcsokkal van konfigurálva, éles fizetés nincs aktív.

A Google OAuth opcionális bejelentkezési mód. Saját Google Cloud projektet
kell létrehozni hozzá, az authorized redirect URI:
`<BACKEND_BASE_URL>/auth/google/callback`.

Az Anthropic Claude API a Haiku 4.5 modellt használja a kosár-alapú
termékajánlóhoz, cache-elt prompttal költségoptimalizálva.

A Gmail SMTP a rendelési visszaigazoló e-mailek küldésére szolgál
Nodemailer-en keresztül. Saját Gmail-fiók App Password szükséges hozzá.

## Ismert korlátok

A jelenlegi állapotban vállaltan ismert korlátok és a tudatosan
elhalasztott biztonsági továbbfejlesztések:

- Nincsenek automatizált tesztek. A verifikáció manuális, a tesztelési
  jegyzőkönyv a dolgozat tesztelési fejezetében található.
- A JWT a `localStorage`-ban van tárolva, ami XSS-érzékeny. A `httpOnly`
  cookie-ra való migráció a GitHub issue #50-en van követve.
- Az OAuth handoff store in-memory. Egyetlen backend példányon működik,
  több instance esetén Redis kell. GitHub issue #51.
- Nincs e-mail verifikáció a jelszavas regisztrációnál. A Google
  bejelentkezés viszont csak `email_verified: true` esetén enged be.
  GitHub issue #52.
- Nincs Google fiók összekapcsolása meglévő accounthoz UI a profil
  oldalon. GitHub issue #53.
- Nincs eszköz- és session-management. A felhasználó nem látja és nem
  vonhatja vissza az aktív session-jeit. GitHub issue #54.
- A Stripe csak test módban működik, éles kulcsok nincsenek a repóban.
- Az AI ajánló kikapcsol, ha az `ANTHROPIC_API_KEY` nincs beállítva — a
  kosároldalon ilyenkor nem jelennek meg javaslatok.

A teljes biztonsági roadmap az "OAuth hardening roadmap" umbrella issue
alatt található a GitHubon.

## Hivatkozások

- A dolgozat szövege: [`docs/Birkl Erik András szakdolgozat.docx`](docs/)
- Fejlesztési irányelvek: [`CLAUDE.md`](CLAUDE.md) (kódolási konvenciók,
  architektúra, projekt-specifikus szabályok).
- Kódstílus: [`code-style-guide.md`](code-style-guide.md)
- Részletes projektstruktúra: a `CLAUDE.md` "Project Structure" szekciója.
