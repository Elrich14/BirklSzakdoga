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
import { PRODUCT_GENDERS } from "@/constants/filterConstants";
import { useCartStore } from "../components/store/cartStore";
import { useTranslation } from "react-i18next";

import { resolveImageUrl } from "../utils/image";
import { useSnackbar } from "../providers/snackbarProvider";

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

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    minHeight: "100vh",
  },
  [`& .${classes.title}`]: {
    display: "flex",
    justifyContent: "left",
    marginLeft: "300px",
    marginTop: "30px",
    fontFamily: "monospace",
    fontSize: "clamp(22px, 5vw, 30px)",
    color: theme.vars?.palette.kerian.main,
    opacity: 0.6,
    [theme.breakpoints.down("md")]: {
      marginLeft: "16px",
    },
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
    padding: "0 16px",
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
      gap: "16px",
      padding: "0 8px",
    },
  },
  [`& .${classes.listItem}`]: {
    width: "100%",
    maxWidth: "1300px",
    backgroundColor: theme.vars?.palette.background.paper,
    color: theme.vars?.palette.text.primary,
    borderBottom: `1px solid ${theme.vars?.palette.admin.border}`,
    borderRadius: "4px",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      paddingRight: "16px",
      "& .MuiListItemText-root": {
        minWidth: 0,
        width: "100%",
      },
      "& .MuiListItemSecondaryAction-root": {
        position: "static",
        transform: "none",
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      },
    },
  },
  [`& .${classes.avatar}`]: {
    width: "56px",
    height: "56px",
    marginRight: "10px",
  },
  [`& .${classes.addToCartButton}`]: {
    color: theme.vars?.palette.kerian.main,
    border: `1px solid ${theme.vars?.palette.kerian.main}`,
    marginLeft: "10px",
  },
  [`& .${classes.deleteIcon}`]: {
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.emptyText}`]: {
    color: theme.vars?.palette.text.secondary,
    marginTop: "2rem",
  },
  [`& .${classes.description}`]: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "1000px",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },
}));

export default function Wishlist() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
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

  const submitAddToCart = (event: React.MouseEvent, item: WishlistItem) => {
    event.stopPropagation();
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
    showSnackbar(t("snackbar.addedToCart"), "success");
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>{t("wishlist.title")}</Typography>
      {isAuthenticated && (
        <List>
          {wishlist.length === 0 ? (
            <p className={classes.emptyText}>{t("wishlist.empty")}</p>
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
                      onClick={(event) => submitAddToCart(event, item)}
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
                      {t(`card.colors.${item.color}`)} {item.quantity}x -{" "}
                      {item.price.toLocaleString()} {t("card.currency")}
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
