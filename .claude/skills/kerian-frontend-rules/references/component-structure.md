# Component structure — full reference

Read this when you create a component, or when you are unsure where something
belongs in an existing file. The rules are in `SKILL.md`; this is the shape.

## File order — exact, every component

```tsx
"use client";

// 1. External imports
import { Card, CardContent, Typography, Box, styled } from "@mui/material";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

// 2. Internal imports (components, store, api, constants, utils)
import { useCartStore } from "../components/store/cartStore";
import { cancelOrder } from "@/api";
import { PRODUCT_COLORS } from "@/constants/filterConstants";

// 3. Types / interfaces
interface Props {
  title: string;
  onAction: () => void;
}

// 4. Styled components — PREFIX + classes
const PREFIX = "ComponentName";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
};

const Root = styled(Card)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "6px",
  },
  [`& .${classes.content}`]: {
    padding: "20px",
  },
}));

// 5. Component
export default function ComponentName({ title, onAction }: Props) {
  // 5a. hooks
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 5b. derived state
  const visibleItems = useMemo(() => items.filter(Boolean), [items]);

  // 5c. event handlers — `on` prefix
  const onDialogClose = () => setIsOpen(false);

  // 5d. helpers
  const formatPrice = (amountHuf: number) => `${amountHuf} Ft`;

  // 5e. render
  return (
    <Root className={classes.root}>
      <CardContent className={classes.content}>{title}</CardContent>
    </Root>
  );
}
```

## The PREFIX pattern

`PREFIX` equals the component name. Every class is declared in the `classes`
object, never written inline as a string. In the styled definition:

- `&.${classes.root}` — the root element itself
- `& .${classes.x}` — a descendant

MUI internals are targeted the same way, inside the root block:

```tsx
"& .MuiCardContent-root": { padding: "20px" },
"& .MuiButton-root": { textTransform: "none" },
```

`productCard.tsx` is the reference implementation — read it before writing a new
card, dialog or list item.

## State management

| Need | Tool |
|---|---|
| Dialog open, selected chip, input value | `useState` |
| Multi-field form logic | `useReducer` |
| Cart | `useCartStore` (Zustand) |
| Server data | React Query `useQuery` / `useMutation` |
| Language | `useLanguage` context |
| Feedback to the user | `useSnackbar` from `providers/snackbarProvider` |

Server data is never copied into `useState` — read it from the query. After a
mutation, invalidate the query key rather than mutating local state:

```tsx
const queryClient = useQueryClient();
await addToWishlist(productId);
queryClient.invalidateQueries({ queryKey: ["wishlist"] });
```

The cart identity in this project is `productId + gender + size + color`. Two
entries differing in any one of those are different cart lines.

## Forms

Formik + Yup, with the schema in `constants/` when it is reused.
`shippingDataForm.tsx` is the reference. Validation messages are translation
keys, not literals.

## Images

Use `next/image`. If ESLint complains about `<img>`, fix the usage — do not
disable the rule. Product images resolve through `resolveImageUrl` from
`app/utils/image`, which handles both Cloudinary URLs and local paths.

## Auth-dependent rendering

`getUserRole()` from `app/utils/auth` returns `"admin"`, `"user"` or `"guest"`.
Use it to branch rendering; never to decide whether an action is *allowed* —
that is the server's job, and the UI hiding a button is not a security control.
