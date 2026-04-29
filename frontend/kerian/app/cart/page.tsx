"use client";

import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material";
import { useCartStore } from "../components/store/cartStore";
import QuantityInput from "../components/quantity";
import ProductPopup from "../components/productPopup";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "../utils/image";
import { useQueries } from "@tanstack/react-query";
import { fetchProductStock } from "@/api";
import RecommendedProducts from "./recommendedProducts";

const PREFIX = "CartPage";

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  itemBox: `${PREFIX}-itemBox`,
  itemRow: `${PREFIX}-itemRow`,
  itemInfo: `${PREFIX}-itemInfo`,
  avatar: `${PREFIX}-avatar`,
  itemText: `${PREFIX}-itemText`,
  itemActions: `${PREFIX}-itemActions`,
  stockInfo: `${PREFIX}-stockInfo`,
  divider: `${PREFIX}-divider`,
  totalBox: `${PREFIX}-totalBox`,
  actionButtons: `${PREFIX}-actionButtons`,
  cartTitle: `${PREFIX}-cartTitle`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "monospace",
    [theme.breakpoints.down("sm")]: {
      padding: "16px",
    },
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
    gap: "12px",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "8px",
    },
  },
  [`& .${classes.itemActions}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-end",
    },
  },
  [`& .${classes.itemInfo}`]: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    flex: 1,
    minWidth: 0,
  },
  [`& .${classes.avatar}`]: {
    width: "56px",
    height: "56px",
  },
  [`& .${classes.itemText}`]: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  [`& .${classes.stockInfo}`]: {
    color: theme.vars?.palette.kerian.main,
    opacity: 0.75,
    fontSize: "12px",
  },
  [`& .${classes.divider}`]: {
    marginTop: "16px",
    marginBottom: "16px",
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
  [`& .${classes.cartTitle}`]: {
    display: "flex",
    justifyContent: "left",
    marginTop: "30px",
    fontFamily: "monospace",
    fontSize: "clamp(22px, 5vw, 30px)",
    color: theme.vars?.palette.kerian.main,
    opacity: 0.6,
  },
}));

export default function CartPage() {
  const { t } = useTranslation();
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

  const uniqueProductIds = useMemo(
    () => Array.from(new Set(cartItems.map((item) => item.productId))),
    [cartItems]
  );

  const stockQueries = useQueries({
    queries: uniqueProductIds.map((productId) => ({
      queryKey: ["productStock", productId],
      queryFn: () => fetchProductStock(productId),
    })),
  });

  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (let index = 0; index < uniqueProductIds.length; index++) {
      const productId = uniqueProductIds[index];
      const data = stockQueries[index]?.data;
      if (!data) continue;
      for (const variant of data) {
        const key = `${productId}_${variant.gender}_${variant.size}_${variant.color}`;
        map[key] = variant.stock;
      }
    }
    return map;
  }, [stockQueries, uniqueProductIds]);

  return (
    <Root className={classes.root}>
      <Typography className={classes.cartTitle}>{t("cart.title")}</Typography>

      {cartItems.length === 0 ? (
        <Typography variant="body1">{t("cart.empty")}</Typography>
      ) : (
        <>
          <Box className={classes.itemBox}>
            {cartItems.map((item) => {
              const stockKey = `${item.productId}_${item.gender}_${item.size}_${item.color}`;
              const currentStock = stockMap[stockKey];
              const isStockKnown = currentStock !== undefined;
              const isOutOfStock = isStockKnown && currentStock === 0;
              const maxQty = isStockKnown ? Math.max(currentStock, 1) : 30;

              return (
                <Box
                  key={`${item.productId}-${item.size}-${item.color}-${item.gender}`}
                  className={classes.itemRow}
                >
                  <Box
                    className={classes.itemInfo}
                    onClick={() => setSelectedItem(item)}
                  >
                    <Avatar
                      src={resolveImageUrl(item.productImageUrl)}
                      alt={item.productName}
                      className={classes.avatar}
                      variant="rounded"
                    />
                    <Box className={classes.itemText}>
                      <Typography variant="body1">
                        {item.productName}
                      </Typography>
                      <Typography variant="body2">
                        {item.size} / {t(`card.colors.${item.color}`)} /{" "}
                        {t(`filter.genderOptions.${item.gender}`)} –{" "}
                        {item.productQuantity} x
                      </Typography>
                      {isStockKnown && (
                        <Typography
                          variant="caption"
                          className={classes.stockInfo}
                        >
                          {isOutOfStock
                            ? t("card.outOfStock")
                            : t("card.stockLeft", { count: currentStock })}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className={classes.itemActions}>
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
                      max={maxQty}
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
                </Box>
              );
            })}
          </Box>

          <Divider className={classes.divider} />

          <Box className={classes.totalBox}>
            <Typography>{t("cart.total")}:</Typography>
            <Typography>{total.toLocaleString()} Huf</Typography>
          </Box>

          <Box className={classes.actionButtons}>
            <Link href="/order">
              <Button variant="contained" color="primary">
                {t("cart.checkout")}
              </Button>
            </Link>
            <Button variant="outlined" color="error" onClick={clearCart}>
              {t("cart.clear")}
            </Button>
          </Box>

          <RecommendedProducts cartProductIds={uniqueProductIds} />
        </>
      )}

      {selectedItem && (
        <ProductPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          id={selectedItem.productId}
          name={selectedItem.productName}
          description={selectedItem.productDescription}
          imageUrls={[selectedItem.productImageUrl]}
          price={selectedItem.productPrice}
          defaultGender={selectedItem.gender}
          defaultColor={selectedItem.color}
          defaultSize={selectedItem.size}
          originalGender={selectedItem.gender}
          originalColor={selectedItem.color}
          originalSize={selectedItem.size}
          color={selectedItem.availableColors}
          size={selectedItem.availableSizes}
          mode="edit"
        />
      )}
    </Root>
  );
}
