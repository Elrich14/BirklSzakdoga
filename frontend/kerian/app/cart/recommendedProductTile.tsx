"use client";

import { Box, Typography, styled } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Product } from "../products/page";
import ProductPopup from "../components/productPopup";
import { resolveImageUrl } from "../utils/image";

interface RecommendedProductTileProps {
  product: Product;
}

const PREFIX = "RecommendedProductTile";

const classes = {
  root: `${PREFIX}-root`,
  image: `${PREFIX}-image`,
  textColumn: `${PREFIX}-textColumn`,
  name: `${PREFIX}-name`,
  price: `${PREFIX}-price`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1,
    minWidth: 0,
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.kerian.overlayHoverLight,
      boxShadow: theme.palette.kerian.shadowHover,
    },
  },
  [`& .${classes.image}`]: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
    flexShrink: 0,
  },
  [`& .${classes.textColumn}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
    flex: 1,
  },
  [`& .${classes.name}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  [`& .${classes.price}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "12px",
    backgroundColor: theme.palette.kerian.main,
    color: theme.palette.text.primary,
    padding: "2px 8px",
    borderRadius: "12px",
    width: "fit-content",
  },
}));

export default function RecommendedProductTile({
  product,
}: RecommendedProductTileProps) {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Root className={classes.root} onClick={() => setIsPopupOpen(true)}>
        <Box
          component="img"
          src={
            product.imageUrls?.[0]
              ? resolveImageUrl(product.imageUrls[0])
              : undefined
          }
          alt={product.name}
          className={classes.image}
        />
        <Box className={classes.textColumn}>
          <Typography className={classes.name}>{product.name}</Typography>
          <Typography className={classes.price}>
            {product.price.toLocaleString()} {t("card.currency")}
          </Typography>
        </Box>
      </Root>

      <ProductPopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        id={product.id}
        name={product.name}
        description={product.description}
        imageUrls={product.imageUrls}
        price={product.price}
        color={product.color}
        size={product.size}
        mode="add"
      />
    </>
  );
}
