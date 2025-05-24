"use client";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  styled,
  Divider,
} from "@mui/material";
import { boxShadows, colors } from "@/constants/colors";
import { useEffect, useState } from "react";
import ProductPopup from "./productPopup";
import { getUserRole } from "../utils/auth";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { addToWishlist } from "@/api";

type ProductCardProps = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isWished?: boolean;
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
  cardUpperSideBox: `${PREFIX}-cardUpperSideBox`,
  addToWishlistButton: `${PREFIX}-addToWishlistButton`,
};

const Root = styled(Card)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    width: "340px",
    height: "100%",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    overflow: "hidden",
    "&:hover": {
      boxShadow: boxShadows.kerian_main_button_hover_shadow,
      transform: "scale(1.05)",
      zIndex: 0,
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
  [`& .${classes.cardUpperSideBox}`]: {
    position: "relative",
  },
  [`& .${classes.addToWishlistButton}`]: {
    position: "absolute",
    top: 8,
    right: 8,
    color: colors.kerian_main,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      color: colors.kerian_main,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  },
}));

export default function ProductCard({
  id,
  name,
  description,
  imageUrl,
  price,
  isWished,
}: ProductCardProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const userRole = getUserRole();
  const [isInWishlist, setIsInWishlist] = useState(isWished);

  useEffect(() => {
    setIsInWishlist(isWished);
  }, [isWished]);

  return (
    <>
      <Root className={classes.root} onClick={() => setOpenDialog(true)}>
        <Box className={classes.cardUpperSideBox}>
          <CardMedia
            className={classes.productImg}
            component="img"
            image={imageUrl}
            alt={name}
          />
          {isInWishlist ? (
            <FavoriteIcon
              fontSize="large"
              onClick={(e) => e.stopPropagation()}
              className={classes.addToWishlistButton}
            />
          ) : (
            <FavoriteBorderIcon
              fontSize="large"
              onClick={async (e) => {
                e.stopPropagation();
                await addToWishlist({
                  productId: id,
                  productName: name,
                  description,
                  imageUrl,
                  price,
                  color: "Black",
                  size: "S",
                  gender: "Female",
                  quantity: 1,
                });
                setIsInWishlist(true);
              }}
              className={classes.addToWishlistButton}
            />
          )}
        </Box>
        <CardContent>
          <Typography className={classes.productName}>{name}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography className={classes.productDescription} variant="body2">
            {description}
          </Typography>
          <Box className={classes.cardFooterBox}>
            <Typography className={classes.price} fontWeight="bold">
              {price} Huf
            </Typography>
            {userRole == "user" && (
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", opacity: 0.6, marginTop: "20px" }}
              >
                Open to order
              </Typography>
            )}
            {userRole == "guest" && (
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", opacity: 0.6, marginTop: "20px" }}
              >
                Login to buy
              </Typography>
            )}
          </Box>
        </CardContent>
      </Root>

      <ProductPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        id={id}
        name={name}
        description={description}
        imageUrl={imageUrl}
        price={price}
        mode="add"
        isWished={isInWishlist}
      />
    </>
  );
}
