"use client";

import { Box, Typography, styled } from "@mui/material";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchAllProducts, fetchRecommendations } from "@/api";
import RecommendedProductTile from "./recommendedProductTile";

interface RecommendedProductsProps {
  cartProductIds: number[];
}

const PREFIX = "RecommendedProducts";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  tilesRow: `${PREFIX}-tilesRow`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontSize: "18px",
    color: theme.palette.kerian.main,
    opacity: 0.7,
  },
  [`& .${classes.tilesRow}`]: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    flexWrap: "wrap",
  },
}));

const STALE_TIME_MS = 5 * 60 * 1000;

export default function RecommendedProducts({
  cartProductIds,
}: RecommendedProductsProps) {
  const { t, i18n } = useTranslation();

  const sortedKey = useMemo(
    () => [...cartProductIds].sort((a, b) => a - b).join(","),
    [cartProductIds]
  );

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", sortedKey, i18n.language],
    queryFn: () => fetchRecommendations(cartProductIds, i18n.language),
    enabled: cartProductIds.length > 0,
    staleTime: STALE_TIME_MS,
  });

  const productsQuery = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchAllProducts,
    enabled: cartProductIds.length > 0,
    staleTime: STALE_TIME_MS,
  });

  const recommendedProducts = useMemo(() => {
    const ids = recommendationsQuery.data?.recommendedProductIds;
    const products = productsQuery.data;
    if (!ids || ids.length === 0 || !products) return [];
    const productMap = new Map(products.map((product) => [product.id, product]));
    return ids
      .map((id) => productMap.get(id))
      .filter((product): product is NonNullable<typeof product> =>
        Boolean(product)
      );
  }, [recommendationsQuery.data, productsQuery.data]);

  if (recommendedProducts.length === 0) return null;

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("cart.aiRecommendations")}
      </Typography>
      <Box className={classes.tilesRow}>
        {recommendedProducts.map((product) => (
          <RecommendedProductTile key={product.id} product={product} />
        ))}
      </Box>
    </Root>
  );
}
