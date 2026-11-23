---
name: kerian-ui-design
description: The Kerian visual language — theme tokens for both colour schemes, the house animation timing, responsive breakpoints, and the rule for introducing a new visual pattern. Load before building or reviewing any UI.
---

# Kerian visual language

The goal is a surface that looks deliberate and consistent, not a set of screens
that each solved their own problem. A new component that is individually pretty
but unlike its neighbours is a regression.

## Theme tokens, never raw values

The theme is `extendTheme` with CSS variables (`cssVarPrefix: "mui"`,
`colorSchemeSelector: "class"`), and it defines **both** a dark and a light
colour scheme.

Inside a styled component:

```tsx
const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars?.palette.background.paper,
  color: theme.vars?.palette.text.primary,
  boxShadow: theme.vars?.palette.kerian.shadow,
}));
```

Custom namespaces:

- `palette.kerian.*` — `main`, `hover`, `bg`, `navbar`, `shadow`, `shadowHover`,
  `dangerBg`, `dangerBorder`, `warningBg`, `warningBorder`, `overlayMuted`,
  `overlayHoverLight`
- `palette.admin.*` — `surface`, `input`, `border`, `borderLight`, `textMuted`,
  `textSecondary`, `textLight`, `accentPurple`, `checkboxInactive`, `overlay`,
  `overlayHover`

Brand colour is `#039c82` (`palette.primary.main` / `kerian.main`). Dark scheme
background is `#000000`, paper `#111111`.

**A new colour is added to `theme.ts` in both schemes, then referenced by token.**
A hex literal in a component is a bug — it will be wrong in one of the two
themes, and nobody will notice until a user switches.

## Check both themes, every time

Every visual change is verified in dark **and** light. The most common failure
is text that is legible in the theme you were looking at and invisible in the
other, because a colour was hard-coded or taken from the wrong token.

## Motion

The house timing already exists in the codebase and is the default:

```tsx
transition: "transform 0.2s ease",
"&:hover": { transform: "scale(1.03)" },
```

Principles:

- **Short.** 150–250ms for hover and state changes, up to 300ms for an entering
  dialog or drawer. Anything longer feels broken.
- **Few properties.** `transform` and `opacity` animate cheaply. Animating
  `width`, `height`, `top` or `box-shadow` causes layout jank.
- **One idea per interaction.** A card that lifts on hover does not also rotate,
  glow and change colour.
- **Purposeful.** Motion shows a relationship — where a dialog came from, that a
  row was added, that a value changed. Decoration without meaning reads as noise.
- **Respect `prefers-reduced-motion`.** Wrap non-essential motion:

```tsx
"@media (prefers-reduced-motion: reduce)": {
  transition: "none",
},
```

## Responsive

Mobile is a first-class target, not a fallback. Use MUI breakpoints through the
theme rather than raw media queries where possible:

```tsx
[theme.breakpoints.down("sm")]: { flexDirection: "column" },
```

Requirements for every screen:

- No horizontal page scroll at 360px width
- Touch targets at least 44×44px
- Tables and wide content scroll inside their own container, not the page
- Text wraps or truncates with an ellipsis — clipped text is a bug
- Images carry `maxWidth: "100%"`

## Consistency rules

Before inventing a visual pattern, look for an existing one. The codebase
already has established answers for:

- **Cards** — `productCard.tsx`: 6px radius, 20px content padding, hover lift
- **Dialogs/popups** — `productPopup/`, `reviewsPopup.tsx`
- **Forms** — `shippingDataForm.tsx` (Formik + Yup + MUI `TextField`)
- **Feedback** — `useSnackbar` from `providers/snackbarProvider`, never `alert()`
- **Admin surfaces** — `palette.admin.*`, distinct from the storefront
- **Status display** — `orderStatusTracker.tsx`

If you genuinely need a new pattern, say so in your report with a one-line
reason. Do not introduce a second card style, a second dialog shape or a second
way of showing an error.

## Spacing and type

- Layout with flex/grid and `gap`, not per-element margins
- Spacing from `theme.spacing()` or consistent string values — not arbitrary
  one-off numbers
- Type scale comes from MUI `Typography` variants; the product-name monospace
  treatment in `productCard.tsx` is a deliberate brand choice, not a default to
  copy everywhere

## Accessibility floor

- Every interactive element is reachable and operable by keyboard, with a
  visible focus state
- Every icon-only button has an `aria-label` — from a translation key
- Form fields have associated labels
- Contrast is checked in both themes, not assumed
