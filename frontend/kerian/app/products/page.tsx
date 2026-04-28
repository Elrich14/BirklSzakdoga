"use client";
import ProductCard from "../components/productCard";
import {
  Button,
  Drawer,
  IconButton,
  Typography,
  styled,
  Box,
} from "@mui/material";
import ProductCardSkeleton from "../components/productCardSkeleton";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchAllProducts, getWishlist, WishlistItem } from "@/api";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, useCallback } from "react";
import ProductFilter, {
  FilterState,
} from "../components/filtering/ProductFilter";
import { AVAILABLE_SIZES } from "@/constants/filterConstants";
import { getUserRole } from "../utils/auth";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

const PREFIX = "ProductsPage";

const classes = {
  root: `${PREFIX}-root`,
  sidebar: `${PREFIX}-sidebar`,
  content: `${PREFIX}-content`,
  productGrid: `${PREFIX}-productGrid`,
  productsAndFilterTitle: `${PREFIX}-productsAndFilterTitle`,
  filtersButton: `${PREFIX}-filtersButton`,
  filterDrawerHeader: `${PREFIX}-filterDrawerHeader`,
  filterDrawerCloseButton: `${PREFIX}-filterDrawerCloseButton`,
  filterDrawerBody: `${PREFIX}-filterDrawerBody`,
};

const Root = styled("div")(({ theme }) => ({
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
    width: "300px",
    padding: "0 16px",
    borderRight: "1px solid #e0e0e0",
    boxSizing: "border-box",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  [`& .${classes.content}`]: {
    flex: 1,
    padding: "0 24px",
    boxSizing: "border-box",
    minWidth: 0,
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
    color: theme.vars?.palette.kerian.main,
    opacity: 0.6,
  },
  [`& .${classes.filtersButton}`]: {
    display: "none",
    marginTop: "16px",
    color: theme.vars?.palette.kerian.main,
    borderColor: theme.vars?.palette.kerian.main,
    fontFamily: "monospace",
    textTransform: "none",
    [theme.breakpoints.down("md")]: {
      display: "inline-flex",
    },
  },
}));

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: "min(320px, 90vw)",
    height: "100vh",
    maxHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  [`& .${classes.filterDrawerHeader}`]: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "4px",
    flexShrink: 0,
  },
  [`& .${classes.filterDrawerCloseButton}`]: {
    color: theme.vars?.palette.text.primary,
    padding: "6px",
    "&:hover": {
      color: theme.vars?.palette.kerian.main,
    },
  },
  [`& .${classes.filterDrawerBody}`]: {
    padding: "0 16px 16px",
    overflowY: "auto",
    flexGrow: 1,
    minHeight: 0,
  },
}));

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  color: string[];
  size: string[];
  gender?: string | string[];
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const userRole = getUserRole();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sizes: AVAILABLE_SIZES,
    gender: [],
    colors: [],
    priceMin: 0,
    priceMax: 0,
    searchQuery: "",
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

  const onFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const highestPrice = products.length
    ? Math.max(...products.map((product) => product.price))
    : 0;

  // if products load or highestPrice changes, ensure default priceMax is set sensibly
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceMax: highestPrice,
    }));
  }, [highestPrice]);

  const filteredProducts = useMemo(() => {
    const trimmedQuery = filters.searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (trimmedQuery) {
        const matchesName = product.name.toLowerCase().includes(trimmedQuery);
        const matchesDescription = product.description
          .toLowerCase()
          .includes(trimmedQuery);
        if (!matchesName && !matchesDescription) return false;
      }

      if (product.price < filters.priceMin || product.price > filters.priceMax)
        return false;

      if (!filters.sizes.some((size) => product.size.includes(size)))
        return false;

      if (filters.colors.length > 0) {
        if (filters.colors.length === 2) {
          const hasAllColors = filters.colors.every((colorOption) =>
            product.color.includes(colorOption)
          );
          if (!hasAllColors) return false;
        } else {
          const hasColor = filters.colors.some((colorOption) =>
            product.color.includes(colorOption)
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
          const hasAllGenders = filters.gender.every((genderOption) =>
            productGenders.includes(genderOption)
          );
          if (!hasAllGenders) return false;
        } else {
          const hasMatchingGender = productGenders.some((genderOption) =>
            filters.gender.includes(genderOption)
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
          onFiltersChange={onFiltersChange}
        />
      </Box>

      <Box className={classes.content}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          className={classes.filtersButton}
          onClick={() => setIsFilterDrawerOpen(true)}
        >
          {t("products.filters")}
        </Button>

        <Typography className={classes.productsAndFilterTitle} gutterBottom>
          {t("products.products")}
        </Typography>

        {error && <Typography>{t("feedback.errorLoadingProducts")}</Typography>}

        <Box className={classes.productGrid}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : filteredProducts.map((product) => {
                const isWished = wishlist.some(
                  (wishlistItem) => wishlistItem.productId === product.id
                );
                return (
                  <ProductCard
                    key={product.id}
                    {...product}
                    isWished={isWished}
                  />
                );
              })}
        </Box>
      </Box>

      <FilterDrawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <Box className={classes.filterDrawerHeader}>
          <IconButton
            className={classes.filterDrawerCloseButton}
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-label={t("products.closeFilters")}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className={classes.filterDrawerBody}>
          <ProductFilter
            maxPrice={highestPrice}
            onFiltersChange={onFiltersChange}
          />
        </Box>
      </FilterDrawer>
    </Root>
  );
}
