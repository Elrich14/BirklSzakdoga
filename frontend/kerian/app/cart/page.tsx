"use client";

import { Box, Typography, IconButton, Button, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material";
import { useCartStore } from "../components/store/cartStore";
import QuantityInput from "../components/quantity";

const PREFIX = "CartPage";

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  itemBox: `${PREFIX}-itemBox`,
  itemRow: `${PREFIX}-itemRow`,
  itemText: `${PREFIX}-itemText`,
  totalBox: `${PREFIX}-totalBox`,
  actionButtons: `${PREFIX}-actionButtons`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "monospace",
  },
  [`& .${classes.itemBox}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  [`& .${classes.itemRow}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.itemText}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.totalBox}`]: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    fontSize: "20px",
  },
  [`& .${classes.actionButtons}`]: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
}));

export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const total = cartItems.reduce(
    (sum, cartItem) => sum + cartItem.productPrice * cartItem.productQuantity,
    0
  );

  return (
    <Root className={classes.root}>
      <Typography variant="h4">Kosár</Typography>

      {cartItems.length === 0 ? (
        <Typography variant="body1">A kosarad üres.</Typography>
      ) : (
        <>
          <Box className={classes.itemBox}>
            {cartItems.map((item) => (
              <Box
                key={`${item.productId}-${item.size}-${item.color}-${item.gender}`}
                className={classes.itemRow}
              >
                <Box className={classes.itemText}>
                  <Typography variant="body1">{item.productName}</Typography>
                  <Typography variant="body2">
                    {item.size} / {item.color} / {item.gender} –{" "}
                    {item.productQuantity} db
                  </Typography>
                </Box>
                <QuantityInput
                  value={item.productQuantity}
                  onChange={(newQuantity) =>
                    updateQuantity(item.productId, newQuantity)
                  }
                />
                <IconButton onClick={() => removeItem(item.productId)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box className={classes.totalBox}>
            <Typography>Összesen:</Typography>
            <Typography>{total.toLocaleString()} Ft</Typography>
          </Box>

          <Box className={classes.actionButtons}>
            <Button variant="contained" color="primary">
              Rendelés elküldése
            </Button>
            <Button variant="outlined" color="error" onClick={clearCart}>
              Kosár ürítése
            </Button>
          </Box>
        </>
      )}
    </Root>
  );
}
