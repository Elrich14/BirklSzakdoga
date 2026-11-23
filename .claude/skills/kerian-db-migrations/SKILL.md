---
name: kerian-db-migrations
description: Sequelize migration rules for the Kerian database — naming, reversibility, backfill, indexes, keeping models in sync, and which operations need explicit human approval. Load before creating or editing anything under backend/migrations/ or backend/models/.
---

# Kerian database migrations

A migration is the only irreversible thing this system does. Treat it with more
care than any other file.

## Naming

Timestamp prefix plus a descriptive, English, verb-first name:

```
20260511120000-add-cancelled-at-to-orders.js
20260511121500-create-order-refunds.js
20260511123000-backfill-product-variant-stock.js
```

Wrong: `fix-orders.js`, `update2.js`, `migration-new.js`.

## Every migration has a working `down`

```js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "cancelledAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("orders", "cancelledAt");
  },
};
```

`down` is not a formality. Write it so it actually reverses `up`, and say in
your report if a true reversal is impossible (a dropped column's data is gone —
that is a fact to state, not to hide).

## Never edit an applied migration

If a migration has run anywhere, it is frozen. Fix it with a **new** migration.
Editing an applied file produces a database whose schema does not match its own
migration history, and nothing will tell you until something breaks.

## Model and migration stay in sync

Every schema change is two edits:

1. The migration in `backend/migrations/`
2. The model in `backend/models/`

A migration without the matching model change means the ORM cannot see the
column. A model change without a migration means production never gets it —
`sequelize.sync({ force: false })` runs only outside production, so dev will
silently "work" while production is broken. This is the most dangerous
inconsistency in this codebase; check for it every time.

## Adding a non-nullable column

Three steps, never one:

1. Add it nullable
2. Backfill existing rows
3. Add the `NOT NULL` constraint

A single `allowNull: false` with a `defaultValue` on a populated table either
fails or silently stamps every historical row with a value that is not true.

```js
async up(queryInterface, Sequelize) {
  await queryInterface.addColumn("orders", "currency", {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.sequelize.query(
    `UPDATE orders SET currency = 'HUF' WHERE currency IS NULL`
  );
  await queryInterface.changeColumn("orders", "currency", {
    type: Sequelize.STRING,
    allowNull: false,
  });
}
```

## Indexes

Add an index when you add a column that will be filtered, joined or sorted on.
The existing hot paths are `orders.userId`, `orderItems.orderId`,
`productVariants.productId` and the variant lookup tuple
`(productId, gender, size, color)`.

A foreign key is not automatically indexed in PostgreSQL. Add it explicitly.

## Constraints belong in the database

If a value must be unique, the uniqueness lives in a database constraint, not
only in application code. Two concurrent requests will both pass an application
check. The existing registration flow relies on
`SequelizeUniqueConstraintError` being thrown — that only works because the
constraint is real.

## Needs explicit human approval

Stop and report `NEEDS-DECISION` before any of these. Do not run them because
they seem obviously right:

- `removeColumn` / `dropTable` on anything holding real data
- `changeColumn` that narrows a type (`TEXT` → `STRING(50)`, `BIGINT` → `INTEGER`)
- Renaming a column or table that the frontend or an API response references
- Any raw `DELETE` or `UPDATE` without a `WHERE`
- Changing a primary key or an existing foreign key

## Verify

```
cd backend && npx sequelize-cli db:migrate
cd backend && npx sequelize-cli db:migrate:undo
cd backend && npx sequelize-cli db:migrate
```

Up, down, up again — clean each time. That round trip is your `EVIDENCE`; a
migration that only runs forward has not been tested.
