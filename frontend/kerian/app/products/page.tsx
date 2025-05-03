"use client";
import ProductCard from "../components/productCard";
import { Typography, styled, Box } from "@mui/material";
import { fetchAllProducts } from "@/api";
import { useEffect, useState } from "react";

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

export default function ProductsPage() {
  type Product = {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    category: string;
  };

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <Root className={classes.root}>
      {/* Sidebar hely (később ide jön a szűrő) */}
      <Box className={classes.sidebar}>
        <Typography variant="h6" gutterBottom>
          Filter
        </Typography>
        {/* Itt jönnek majd a szűrő elemek */}
      </Box>

      {/* Fő tartalom */}
      <Box className={classes.content}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Box className={classes.productGrid}>
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </Box>
      </Box>
    </Root>
  );
}
