# Kerian backend

Express.js, Sequelize és PostgreSQL backend a Kerian webshophoz.

A teljes szakdolgozati README — futtatás, környezeti változók, demo
felhasználók, ismert korlátok, bíráláshoz tartozó információk — a repó
gyökerében található.

- [`../README.md`](../README.md) (magyar)
- [`../README.en.md`](../README.en.md) (angol)

## Backend-specifikus tudnivalók

```bash
npm install
npx sequelize-cli db:migrate     # adatbázis-séma létrehozása
npx sequelize-cli db:seed:all    # demo userek (admin@gmail.com / admin, erik@gmail.com / 1234)
npm run startWatch               # nodemon, port 3000
npm run seedProducts             # opcionális: ~10 demo termék betöltése
```

Környezeti változók: másold le a [`.env.example`](.env.example) fájlt
`.env` néven és töltsd ki. A változók részletes leírása és a "minimális
futtatáshoz mi kötelező" kérdés a gyökér README-ben van.

## Route-modulok

A backend domain-szerinti route-modulokra van bontva. Az `auth.js` a helyi
bejelentkezést és regisztrációt szolgálja `/auth` prefixszel, az `oauth/`
mappa a Google OAuth callback és handoff végpontokat `/auth/google/*`
alatt. A `productRoutes.js` adja a nyilvános termék-böngészést és szűrést
`/api/products` alatt, a `wishlistRoutes.js` a bejelentkezett user
kívánságlistáját `/api/wishlist` alatt. Az `orderRoutes.js` kezeli a
rendelésfeladást, e-mailt és állapotot `/api` alatt, a `reviewRoutes.js`
a termékvéleményeket `/api/reviews` alatt. A `recommendationsRoutes.js`
a Claude-alapú AI ajánlót `/api/recommendations` alatt, a
`twoFactorRoutes.js` a TOTP setup, enable, verify végpontokat `/api/2fa`
alatt. Az `adminRoutes.js` az admin termék-, rendelés- és analitika
kezelést `/api/admin` alatt, a `stripeWebhook.js` pedig a Stripe
esemény-feldolgozást `/api/stripe/webhook` alatt.

A pontos végpont-listát az `index.js` mounting-blokkja és az egyes
route-fájlok mutatják.

## Sequelize migrációk

```bash
npx sequelize-cli db:migrate           # minden függő migráció lefuttatása
npx sequelize-cli db:migrate:undo      # az utolsó migráció visszavonása
npx sequelize-cli migration:generate --name <new-migration-name>
```
