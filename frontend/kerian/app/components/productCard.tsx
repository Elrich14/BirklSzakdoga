"use client";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  styled,
  Divider,
} from "@mui/material";
import { boxShadows } from "@/constants/colors";
import { useState } from "react";
import ProductPopup from "./productPopup";

type ProductCardProps = {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
};

const PREFIX = "ProductCard";

const classes = {
  root: `${PREFIX}-root`,
  productImg: `${PREFIX}-productImg`,
  productDescription: `${PREFIX}-productDescription`,
  productName: `${PREFIX}-productName`,
  addToCardButton: `${PREFIX}-addToCardButton`,
  price: `${PREFIX}-price`,
  cardFooterBox: `${PREFIX}-cardFooterBox`,
};

const Root = styled(Card)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    width: "340px",
    height: "100%",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    "&:hover": {
      boxShadow: boxShadows.kerian_main_button_hover_shadow,
      transform: "scale(1.05)",
    },
    "& img": {
      objectFit: "cover",
    },
    "& .MuiCardContent-root": {
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
    },
    "& .MuiButton-root": {
      textTransform: "none",
    },
  },
  [`& .${classes.productImg}`]: {
    height: "240px",
  },
  [`& .${classes.productName}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "25px",
  },
  [`& .${classes.productDescription}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "15px",
    marginBottom: "15px",
  },
  [`& .${classes.price}`]: {
    fontFamily: "monospace",
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: "25px",
    marginTop: "10px",
  },
  [`& .${classes.addToCardButton}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "20px",
  },
  [`& .${classes.cardFooterBox}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
  },
}));

export default function ProductCard({
  name,
  description,
  imageUrl,
  price,
}: ProductCardProps) {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <>
      <Root className={classes.root} onClick={() => setOpenDialog(true)}>
        <CardMedia
          className={classes.productImg}
          component="img"
          image={imageUrl}
          alt={name}
        />
        <CardContent>
          <Typography className={classes.productName}>{name}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography className={classes.productDescription} variant="body2">
            {description}
          </Typography>
          <Box className={classes.cardFooterBox}>
            <Typography className={classes.price} fontWeight="bold">
              {price} Ft
            </Typography>
            <Button
              className={classes.addToCardButton}
              variant="contained"
              size="small"
            >
              Add To Cart
            </Button>
          </Box>
        </CardContent>
      </Root>

      <ProductPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        name={name}
        description={description}
        imageUrl={imageUrl}
        price={price}
      />
    </>
  );
}
