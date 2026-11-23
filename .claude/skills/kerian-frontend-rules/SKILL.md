---
name: kerian-frontend-rules
description: Next.js/MUI/TypeScript rules for the Kerian frontend — the ban on inline sx and style, string CSS units, no any, the api.ts contract, i18n key pairs, and the display-not-decide boundary. Load before editing anything under frontend/kerian/.
---

# Kerian frontend rules

Load `kerian-conventions` as well. For colours, theme tokens, motion and
responsive behaviour, load `kerian-ui-design` — it owns all of that.

**`references/component-structure.md`** in this skill has the full component
skeleton, the `PREFIX` + `classes` pattern and the state-management table. Read
it when you create a new component or are unsure where something goes in a file.

## The frontend displays; it does not decide

Yours: which dialog is open, which filter chip is selected, form state before
submit, optimistic UI, loading and error presentation.

Not yours: prices, totals, stock, discounts, authorization, order state
transitions, business validation.

When a task asks you to compute a business rule, stop and report:

```
STATUS   NEEDS-BACKEND
WHAT     <the rule> belongs on the server — in the client anyone can bypass it
         with devtools.
NEXT     Endpoint needed: <method> <path> → <response shape>.
```

Do not implement it client-side "for now". That "for now" is how a rule ends up
permanently in two places, disagreeing.

## The four rules that get broken most

1. **No `sx={{ }}`, no `style={{ }}`**, no `secondaryTypographyProps={{ style }}`.
   Every style goes through the styled component and is applied by `className`:

   ```tsx
   // Wrong
   <ListItemText secondaryTypographyProps={{ style: { overflow: "hidden" } }} />
   // Right
   <ListItemText secondaryTypographyProps={{ className: classes.description }} />
   ```

2. **CSS values are strings with units** — `"10px"`, not `10`. Exceptions: `0`,
   and the genuinely unitless `opacity`, `zIndex`, `flexGrow`, `fontWeight`,
   `lineHeight`.

3. **No `any`, no `@ts-ignore`, no `@ts-expect-error`, no `eslint-disable`.**
   Fix the cause. `interface` for object shapes, `type` for unions. Props are
   `interface Props`. Type guards over `as`.

4. **Event handlers use `on`, never `handle`.** `onSubmit`, `onColorChange`.

## Every request goes through api.ts

No `fetch()` in a component, page, provider or hook. Adding an endpoint means
adding a typed function to `frontend/kerian/api.ts`:

```ts
export interface CancelOrderResponse {
  id: number;
  status: OrderStatus;
}

export async function cancelOrder(orderId: number): Promise<CancelOrderResponse> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to cancel order");
  }

  return response.json();
}
```

`API_BASE` comes from `@/constants/constants` — never re-derive the base URL.
Request and response both get an exported interface. Keep the file's
`// ==================== SECTION ====================` banners and put the new
function in the matching section.

## Every string is a translation key

No hardcoded user-visible text — including button labels, `aria-label`s,
placeholders, snackbar messages and error text.

```tsx
const { t } = useTranslation();
<Button>{t("cart.checkout")}</Button>
```

A new key goes into **both** `locales/en/translation.json` and
`locales/hu/translation.json`, at the same nested position. Existing sections:
`common`, `navbar`, `themeToggle`, `profile`, `login`, `register`, `filter`,
`card`, `reviews`, `myOrders`, `orderStatus`, `products`, `wishlist`, `cart`,
`orderingForm`, `payment`, `feedback`, `snackbar`, `admin`.

Adding a key to one language file only is a bug, and `finalize-change` flags it.

## Verify before reporting

```
cd frontend/kerian && npx tsc --noEmit
cd frontend/kerian && npx next lint
```

Both must be clean, and their raw output is your evidence. A type error you
could not solve is a `BLOCKED`, not something to silence with a cast.
