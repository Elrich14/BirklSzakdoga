"use client";

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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWishlist, removeFromWishlistById, WishlistItem } from "@/api";
import { getUserRole } from "../utils/auth";
import { colors } from "@/constants/colors";
import { PRODUCT_GENDERS } from "@/constants/filterConstants";
import { useCartStore } from "../components/store/cartStore";
import { useTranslation } from "react-i18next";

import { resolveImageUrl } from "../utils/image";

const PREFIX = "Wishlist";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  listItem: `${PREFIX}-listItem`,
  avatar: `${PREFIX}-avatar`,
  addToCartButton: `${PREFIX}-addToCartButton`,
  deleteIcon: `${PREFIX}-deleteIcon`,
  emptyText: `${PREFIX}-emptyText`,
  description: `${PREFIX}-description`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    minHeight: "100vh",
  },
  [`& .${classes.title}`]: {
    display: "flex",
    justifyContent: "left",
    marginLeft: "300px",
    marginTop: "30px",
    fontFamily: "monospace",
    fontSize: "30px",
    color: colors.kerian_main,
    opacity: 0.6,
  },
  [`& .MuiList-root`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: "1300px",
    margin: "auto",
    gap: "30px",
  },
  [`& .${classes.listItem}`]: {
    width: "100%",
    maxWidth: "1300px",
    backgroundColor: "#121212",
    color: "#fff",
    borderBottom: "1px solid #333",
    borderRadius: "4px",
    justifyContent: "space-between",
  },
  [`& .${classes.avatar}`]: {
    width: "56px",
    height: "56px",
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
  [`& .${classes.emptyText}`]: {
    color: "#ccc",
    marginTop: "2rem",
  },
  [`& .${classes.description}`]: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "1000px",
  },
}));

export default function Wishlist() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const userRole = getUserRole();
  const isAuthenticated = userRole !== "guest";

  const { data: wishlist = [] } = useQuery<WishlistItem[], Error>({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlistById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const onRemove = (id: number) => {
    removeMutation.mutate(id);
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
      availableSizes: [],
      availableColors: [],
    });
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("wishlist.title")}
      </Typography>
      {isAuthenticated && (
        <List>
          {wishlist.length === 0 ? (
            <p className={classes.emptyText}>
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
                    src={resolveImageUrl(item.imageUrl)}
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
                      {item.gender === PRODUCT_GENDERS.MALE
                        ? t("filter.genderOptions.Male")
                        : t("filter.genderOptions.Female")}
                      {" / "}
                      {t(`card.colors.${item.color}`)}{" "}
                      {item.quantity}x - {item.price.toLocaleString()}{" "}
                      {t("card.currency")}
                    </Typography>
                  }
                  secondary={item.description}
                  secondaryTypographyProps={{
                    className: classes.description,
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      )}
    </Root>
  );
}
