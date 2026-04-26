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
import { useEffect, useState } from "react";
import ProductPopup from "./productPopup";
import ReviewsPopup from "./reviews/reviewsPopup";
import { getUserRole } from "../utils/auth";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { addToWishlist, removeFromWishlistByProductId } from "@/api";
import { PRODUCT_COLORS } from "@/constants/filterConstants";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "../utils/image";
import { useSnackbar } from "../providers/snackbarProvider";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  imageUrls: string[];
  price: number;
  color: string[];
  size: string[];
  isWished?: boolean;
}

const PREFIX = "ProductCard";

const classes = {
  root: `${PREFIX}-root`,
  productImg: `${PREFIX}-productImg`,
  productDescription: `${PREFIX}-productDescription`,
  productName: `${PREFIX}-productName`,
  addToCardButton: `${PREFIX}-addToCardButton`,
  pricePill: `${PREFIX}-pricePill`,
  cardFooterBox: `${PREFIX}-cardFooterBox`,
  cardUpperSideBox: `${PREFIX}-cardUpperSideBox`,
  addToWishlistButton: `${PREFIX}-addToWishlistButton`,
  reviewsButton: `${PREFIX}-reviewsButton`,
  loginToBuyText: `${PREFIX}-loginToBuyText`,
  divider: `${PREFIX}-divider`,
};

const Root = styled(Card)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    width: "340px",
    height: "100%",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    overflow: "hidden",
    "&:hover": {
      boxShadow: theme.palette.kerian.shadowHover,
      transform: "scale(1.03)",
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
    aspectRatio: "1 / 1",
    width: "100%",
    objectFit: "cover",
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
    display: "-webkit-box",
    WebkitLineClamp: 5,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    height: "115px",
  },
  [`& .${classes.pricePill}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "14px",
    backgroundColor: theme.palette.kerian.main,
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
    width: "fit-content",
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
    top: "8px",
    right: "8px",
    color: theme.palette.kerian.main,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      color: theme.palette.kerian.main,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  },
  [`& .${classes.reviewsButton}`]: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    color: theme.palette.kerian.main,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      color: theme.palette.kerian.main,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  },
  [`& .${classes.loginToBuyText}`]: {
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: "20px",
    fontSize: "0.7rem",
    textAlign: "right",
  },
  [`& .${classes.divider}`]: {
    marginTop: "8px",
    marginBottom: "8px",
  },
}));

export default function ProductCard({
  id,
  name,
  description,
  imageUrls,
  price,
  color,
  size,
  isWished,
}: ProductCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [openReviewsDialog, setOpenReviewsDialog] = useState(false);

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
            image={imageUrls?.[0] ? resolveImageUrl(imageUrls[0]) : undefined}
            alt={name}
          />
          {userRole === "guest" ? (
            <Tooltip title={t("card.loginToWishlist")} arrow>
              <FavoriteBorderIcon
                fontSize="large"
                onClick={(event) => event.stopPropagation()}
                className={classes.addToWishlistButton}
                aria-label={t("card.loginToWishlist")}
              />
            </Tooltip>
          ) : isInWishlist ? (
            <FavoriteIcon
              fontSize="large"
              onClick={async (event) => {
                event.stopPropagation();
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
              onClick={async (event) => {
                event.stopPropagation();
                await addToWishlist({
                  productId: id,
                  productName: name,
                  description,
                  imageUrl: imageUrls?.[0] || "",
                  price,
                  color: color[0] || PRODUCT_COLORS.BLACK,
                  size: size[0] || "S",
                  gender: "Female",
                  quantity: 1,
                });
                setIsInWishlist(true);
                queryClient.invalidateQueries({ queryKey: ["wishlist"] });
                showSnackbar(t("snackbar.addedToWishlist"), "success");
              }}
              className={classes.addToWishlistButton}
              aria-label={t("card.aria.addToWishlist")}
            />
          )}
          <Tooltip title={t("reviews.viewReviews")} arrow>
            <RateReviewOutlinedIcon
              fontSize="large"
              onClick={(event) => {
                event.stopPropagation();
                setOpenReviewsDialog(true);
              }}
              className={classes.reviewsButton}
              aria-label={t("reviews.viewReviews")}
            />
          </Tooltip>
        </Box>
        <CardContent>
          <Typography className={classes.productName}>{name}</Typography>
          <Divider className={classes.divider} />
          <Box className={classes.cardFooterBox}>
            <Typography className={classes.pricePill}>
              {price.toLocaleString()} {t("card.currency")}
            </Typography>
            {userRole === "user" && (
              <Typography className={classes.loginToBuyText} variant="body2">
                {t("card.openToOrder")}
              </Typography>
            )}
            {userRole === "guest" && (
              <Typography className={classes.loginToBuyText} variant="body2">
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
        imageUrls={imageUrls}
        price={price}
        color={color}
        size={size}
        mode="add"
        isWished={isInWishlist}
      />

      <ReviewsPopup
        open={openReviewsDialog}
        onClose={() => setOpenReviewsDialog(false)}
        productId={id}
        productName={name}
      />
    </>
  );
}
