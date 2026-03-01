"use client";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  styled,
  Divider,
  Tooltip,
} from "@mui/material";
import { boxShadows, colors } from "@/constants/colors";
import { useEffect, useState } from "react";
import ProductPopup from "./productPopup";
import { getUserRole } from "../utils/auth";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { addToWishlist, removeFromWishlistByProductId } from "@/api";
import { PRODUCT_COLORS } from "@/constants/filterConstants";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

type ProductCardProps = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  color: string[];
  size: string[];
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
  color,
  size,
  isWished,
}: ProductCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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
          {userRole === "guest" ? (
            <Tooltip title={t("card.loginToWishlist")} arrow>
              <FavoriteBorderIcon
                fontSize="large"
                onClick={(e) => e.stopPropagation()}
                className={classes.addToWishlistButton}
                aria-label={t("card.loginToWishlist")}
              />
            </Tooltip>
          ) : isInWishlist ? (
            <FavoriteIcon
              fontSize="large"
              onClick={async (e) => {
                e.stopPropagation();
                await removeFromWishlistByProductId(id);
                setIsInWishlist(false);
                queryClient.invalidateQueries({ queryKey: ["wishlist"] });
              }}
              className={classes.addToWishlistButton}
              aria-label={t("card.aria.removeFromWishlist")}
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
                  color: color[0] || PRODUCT_COLORS.BLACK,
                  size: size[0] || "S",
                  gender: "Female",
                  quantity: 1,
                });
                setIsInWishlist(true);
                queryClient.invalidateQueries({ queryKey: ["wishlist"] });
              }}
              className={classes.addToWishlistButton}
              aria-label={t("card.aria.addToWishlist")}
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
              {price} {t("card.currency")}
            </Typography>
            {userRole == "user" && (
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", opacity: 0.6, marginTop: "20px" }}
              >
                {t("card.openToOrder")}
              </Typography>
            )}
            {userRole == "guest" && (
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", opacity: 0.6, marginTop: "20px" }}
              >
                {t("card.loginToBuy")}
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
        color={color}
        size={size}
        mode="add"
        isWished={isInWishlist}
      />
    </>
  );
}
