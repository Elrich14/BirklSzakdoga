"use client";
import ProductCard from "../components/productCard";
import { Typography, styled, Box, CircularProgress } from "@mui/material";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchAllProducts } from "@/api";

const PREFIX = "ProductsPage";

const classes = {
  root: `${PREFIX}-root`,
  sidebar: `${PREFIX}-sidebar`,
  content: `${PREFIX}-content`,
  productGrid: `${PREFIX}-productGrid`,
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
}));

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductsPage() {
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

  return (
    <Root className={classes.root}>
      <Box className={classes.sidebar}>
        <Typography variant="h6" gutterBottom>
          Filter
        </Typography>
      </Box>

      <Box className={classes.content}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>

        {isLoading && <CircularProgress />}
        {error && <Typography>Error loading products</Typography>}

        <Box className={classes.productGrid}>
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </Box>
      </Box>
    </Root>
  );
}
