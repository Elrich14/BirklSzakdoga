"use client";
import ProductCard from "../components/productCard";
import { Typography, styled, Box, CircularProgress } from "@mui/material";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchAllProducts, getWishlist, WishlistItem } from "@/api";
import { colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import ProductFilter, {
  FilterState,
} from "../components/filtering/ProductFilter";
import { AVAILABLE_SIZES } from "@/constants/filterConstants";
import { getUserRole } from "../utils/auth";

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
  gender?: string | string[];
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const userRole = getUserRole();
  const [filters, setFilters] = useState<FilterState>({
    sizes: AVAILABLE_SIZES,
    gender: [],
    colors: [],
    priceMin: 0,
    priceMax: 0,
  });

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
    enabled: userRole !== "guest",
  });

  const highestPrice = products.length
    ? Math.max(...products.map((p) => p.price))
    : 0;

  // if products load or highestPrice changes, ensure default priceMax is set sensibly
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceMax: highestPrice,
    }));
  }, [highestPrice]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.price < filters.priceMin || product.price > filters.priceMax)
        return false;

      if (!filters.sizes.some((size) => product.size.includes(size)))
        return false;

      if (filters.colors.length > 0) {
        if (filters.colors.length === 2) {
          const hasAllColors = filters.colors.every((c) =>
            product.color.includes(c)
          );
          if (!hasAllColors) return false;
        } else {
          const hasColor = filters.colors.some((c) =>
            product.color.includes(c)
          );
          if (!hasColor) return false;
        }
      }

      if (filters.gender.length > 0) {
        // Product gender is already capitalized (Male, Female) or array of them
        const productGenders = Array.isArray(product.gender)
          ? product.gender
          : product.gender
            ? [product.gender]
            : [];

        if (filters.gender.length === 2) {
          const hasAllGenders = filters.gender.every((g) =>
            productGenders.includes(g)
          );
          if (!hasAllGenders) return false;
        } else {
          const hasMatchingGender = productGenders.some((g) =>
            filters.gender.includes(g)
          );
          if (!hasMatchingGender) return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  return (
    <Root className={classes.root}>
      <Box className={classes.sidebar}>
        <ProductFilter
          maxPrice={highestPrice}
          onFiltersChange={(f) => setFilters(f)}
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
