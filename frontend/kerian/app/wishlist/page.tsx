"use client";

import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  styled,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getWishlist, removeFromWishlist, WishlistItem } from "@/api";
import { colors } from "@/constants/colors";
import { useCartStore } from "../components/store/cartStore";
import { useTranslation } from "react-i18next";

const PREFIX = "Wishlist";

const classes = {
  root: `${PREFIX}-root`,
  listItem: `${PREFIX}-listItem`,
  avatar: `${PREFIX}-avatar`,
  addToCartButton: `${PREFIX}-addToCartButton`,
  deleteIcon: `${PREFIX}-deleteIcon`,
};

const Root = styled(List)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 1300,
    margin: "auto",
    gap: "30px",
    minHeight: "100vh",
  },
  [`& .${classes.listItem}`]: {
    width: "100%",
    maxWidth: 1300,
    bgcolor: "#121212",
    color: "#fff",
    borderBottom: "1px solid #333",
    borderRadius: "4px",
    justifyContent: "space-between",
  },
  [`& .${classes.avatar}`]: {
    width: 56,
    height: 56,
    marginRight: "10px",
  },
  [`& .${classes.addToCartButton}`]: {
    color: colors.kerian_main,
    border: `1px solid ${colors.kerian_main}`,
    marginLeft: "10px",
  },
  [`& .${classes.deleteIcon}`]: {
    color: colors.kerian_main,
  },
}));

export default function Wishlist() {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchWishlist = async () => {
      const data = await getWishlist();
      setWishlist(data);
    };

    fetchWishlist();
  }, []);

  const onRemove = async (id: number) => {
    await removeFromWishlist(id);
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const submitAddToCart = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    addItem({
      productId: item.productId ?? item.id,
      productName: item.productName,
      productDescription: item.description,
      productImageUrl: item.imageUrl,
      productPrice: item.price,
      productQuantity: item.quantity,
      gender: item.gender,
      size: item.size,
      color: item.color,
    });
  };

  return (
    <>
      <Typography
        sx={{
          display: "flex",
          justifyContent: "left",
          marginLeft: "300px",
          marginTop: "30px",
          fontFamily: "monospace",
          fontSize: "30px",
          color: colors.kerian_main,
          opacity: 0.6,
        }}
      >
        {t("wishlist.title")}
      </Typography>
      <Root className={classes.root}>
        {wishlist.length === 0 ? (
          <p style={{ color: "#ccc", marginTop: "2rem" }}>
            {t("wishlist.empty")}
          </p>
        ) : (
          wishlist.map((item) => (
            <ListItem
              key={item.id}
              className={classes.listItem}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onRemove(item.id)}
                  >
                    <DeleteIcon className={classes.deleteIcon} />
                  </IconButton>
                  <Button
                    variant="text"
                    startIcon={<ShoppingCartIcon />}
                    className={classes.addToCartButton}
                    onClick={(e) => submitAddToCart(e, item)}
                  >
                    {t("card.addToCart")}
                  </Button>
                </>
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={item.imageUrl}
                  alt={item.description || item.color}
                  className={classes.avatar}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography component="div">
                    {item.productName}
                    {" / "}
                    {item.size}
                    {" / "}
                    {item.gender === "Male"
                      ? t("card.gender.male")
                      : t("card.gender.female")}
                    {" / "}
                    {item.color === "Black"
                      ? t("card.colors.black")
                      : t("card.colors.white")}{" "}
                    {item.quantity}x - {item.price.toLocaleString()}{" "}
                    {t("card.currency")}
                  </Typography>
                }
                secondary={item.description}
              />
            </ListItem>
          ))
        )}
      </Root>
    </>
  );
}
