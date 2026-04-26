"use client";

import { Box, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { resolveImageUrl } from "../../utils/image";

interface ProductImageSliderProps {
  productId: number;
  name: string;
  imageUrls: string[];
  userRole: string;
  isOpen: boolean;
  isInWishlist: boolean | undefined;
  onAddToWishlist: () => Promise<void>;
  onRemoveFromWishlist: () => Promise<void>;
}

const PREFIX = "ProductImageSlider";

const classes = {
  root: `${PREFIX}-root`,
  mainImage: `${PREFIX}-mainImage`,
  thumbnailRow: `${PREFIX}-thumbnailRow`,
  thumbnail: `${PREFIX}-thumbnail`,
  thumbnailActive: `${PREFIX}-thumbnailActive`,
  wishlistButton: `${PREFIX}-wishlistButton`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: "relative",
    flexShrink: 0,
    paddingTop: "4px",
  },
  [`& .${classes.mainImage}`]: {
    borderRadius: "4px",
    objectFit: "cover",
  },
  [`& .${classes.thumbnailRow}`]: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "8px",
  },
  [`& .${classes.thumbnail}`]: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
    cursor: "pointer",
    opacity: 0.6,
    transition: "opacity 0.2s, border-color 0.2s",
    border: "2px solid transparent",
    "&:hover": {
      opacity: 1,
    },
  },
  [`& .${classes.thumbnailActive}`]: {
    opacity: 1,
    borderColor: theme.palette.kerian.main,
  },
  [`& .${classes.wishlistButton}`]: {
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
}));

const ProductImageSlider = ({
  productId,
  name,
  imageUrls,
  userRole,
  isOpen,
  isInWishlist,
  onAddToWishlist,
  onRemoveFromWishlist,
}: ProductImageSliderProps) => {
  const { t } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveImageIndex(0);
  }, [productId, isOpen]);

  return (
    <Root className={classes.root}>
      <img
        src={resolveImageUrl(
          imageUrls?.[activeImageIndex] || imageUrls?.[0] || ""
        )}
        alt={name}
        width={450}
        height={500}
        className={classes.mainImage}
      />
      {imageUrls?.length > 1 && (
        <Box className={classes.thumbnailRow}>
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={resolveImageUrl(url)}
              alt={`${name} ${index + 1}`}
              className={`${classes.thumbnail} ${index === activeImageIndex ? classes.thumbnailActive : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setActiveImageIndex(index);
              }}
            />
          ))}
        </Box>
      )}
      {userRole === "guest" ? (
        <Tooltip title={t("card.loginToWishlist")} arrow>
          <FavoriteBorderIcon
            fontSize="large"
            onClick={(event) => event.stopPropagation()}
            className={classes.wishlistButton}
            aria-label={t("card.loginToWishlist")}
          />
        </Tooltip>
      ) : isInWishlist ? (
        <FavoriteIcon
          fontSize="large"
          onClick={async (event) => {
            event.stopPropagation();
            await onRemoveFromWishlist();
          }}
          className={classes.wishlistButton}
          aria-label={t("card.aria.removeFromWishlist")}
        />
      ) : (
        <FavoriteBorderIcon
          fontSize="large"
          onClick={async (event) => {
            event.stopPropagation();
            await onAddToWishlist();
          }}
          className={classes.wishlistButton}
          aria-label={t("card.aria.addToWishlist")}
        />
      )}
    </Root>
  );
};

export default ProductImageSlider;
