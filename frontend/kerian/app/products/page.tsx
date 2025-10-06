"use client";
import ProductCard from "../components/productCard";
import { Typography, styled, Box, CircularProgress } from "@mui/material";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchAllProducts, getWishlist, WishlistItem } from "@/api";
import { colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import ProductFilter from "../components/Filtering/productFilter";

const PREFIX = "ProductsPage";

const classes = {
  root: `${PREFIX}-root`,
  sidebar: `${PREFIX}-sidebar`,
  content: `${PREFIX}-content`,
  productGrid: `${PREFIX}-productGrid`,
  productsAndFilterTitle: `${PREFIX}-productsAndFilterTitle`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    paddingTop: "32px",
    paddingBottom: "32px",
    boxSizing: "border-box",
    margin: "auto",
  },
  [`& .${classes.sidebar}`]: {
    width: 300,
    padding: "0 16px",
    borderRight: "1px solid #e0e0e0",
    boxSizing: "border-box",
  },
  [`& .${classes.content}`]: {
    flex: 1,
    padding: "0 24px",
    boxSizing: "border-box",
  },
  [`& .${classes.productGrid}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "30px",
  },
  [`& .${classes.productsAndFilterTitle}`]: {
    display: "flex",
    justifyContent: "left",
    marginTop: "30px",
    fontFamily: "monospace",
    fontSize: "30px",
    color: colors.kerian_main,
    opacity: 0.6,
  },
}));

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  color: string[];
  size: string[];
  gender?: "Male" | "Female" | "Unisex";
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
  ]);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  } as UseQueryOptions<Product[], Error>);

  const { data: wishlist = [] } = useQuery<WishlistItem[], Error>({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      selectedSizes.some((size) => product.size.includes(size))
    );
  }, [products, selectedSizes]);

  return (
    <Root className={classes.root}>
      <Box className={classes.sidebar}>
        <ProductFilter
          selectedSizes={selectedSizes}
          onSizeChange={setSelectedSizes}
        />
      </Box>

      <Box className={classes.content}>
        <Typography className={classes.productsAndFilterTitle} gutterBottom>
          {t("products.products")}
        </Typography>

        {isLoading && <CircularProgress />}
        {error && <Typography>{t("feedback.errorLoadingProducts")}</Typography>}

        <Box className={classes.productGrid}>
          {filteredProducts.map((product, index) => {
            const isWished = wishlist.some((w) => w.productId === product.id);
            return <ProductCard key={index} {...product} isWished={isWished} />;
          })}
        </Box>
      </Box>
    </Root>
  );
}
