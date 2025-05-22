"use client";

import { Box, Typography, IconButton, Button, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material";
import { useCartStore } from "../components/store/cartStore";
import QuantityInput from "../components/quantity";
import ProductPopup from "../components/productPopup";
import { useState } from "react";
import Link from "next/link";

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
    cursor: "pointer",
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
  const [selectedItem, setSelectedItem] = useState<
    null | (typeof cartItems)[0]
  >(null);

  const total = cartItems.reduce(
    (sum, cartItem) => sum + cartItem.productPrice * cartItem.productQuantity,
    0
  );

  return (
    <Root className={classes.root}>
      <Typography variant="h4">Cart</Typography>

      {cartItems.length === 0 ? (
        <Typography variant="body1">Your cart is empty</Typography>
      ) : (
        <>
          <Box className={classes.itemBox}>
            {cartItems.map((item) => (
              <Box
                key={`${item.productId}-${item.size}-${item.color}-${item.gender}`}
                className={classes.itemRow}
              >
                <Box
                  className={classes.itemText}
                  onClick={() => setSelectedItem(item)}
                >
                  <Typography variant="body1">{item.productName}</Typography>
                  <Typography variant="body2">
                    {item.size} / {item.color} / {item.gender} –{" "}
                    {item.productQuantity} db
                  </Typography>
                </Box>

                <QuantityInput
                  value={item.productQuantity}
                  onChange={(newQuantity) =>
                    updateQuantity(
                      item.productId,
                      item.gender,
                      item.size,
                      item.color,
                      newQuantity
                    )
                  }
                />

                <IconButton
                  onClick={() =>
                    removeItem(
                      item.productId,
                      item.gender,
                      item.size,
                      item.color
                    )
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box className={classes.totalBox}>
            <Typography>Total:</Typography>
            <Typography>{total.toLocaleString()} Huf</Typography>
          </Box>

          <Box className={classes.actionButtons}>
            <Link href="/order">
              <Button variant="contained" color="primary">
                Checkout
              </Button>
            </Link>
            <Button variant="outlined" color="error" onClick={clearCart}>
              Clear cart
            </Button>
          </Box>
        </>
      )}

      {selectedItem && (
        <ProductPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          id={selectedItem.productId}
          name={selectedItem.productName}
          description={selectedItem.productDescription}
          imageUrl={selectedItem.productImageUrl}
          price={selectedItem.productPrice}
          defaultGender={selectedItem.gender}
          defaultColor={selectedItem.color}
          defaultSize={selectedItem.size}
          originalGender={selectedItem.gender}
          originalColor={selectedItem.color}
          originalSize={selectedItem.size}
          mode="edit"
        />
      )}
    </Root>
  );
}
