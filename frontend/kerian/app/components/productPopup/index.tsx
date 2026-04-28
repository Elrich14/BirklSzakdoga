"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  styled,
  Box,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  fetchProductById,
  fetchProductStock,
  addToWishlist,
  removeFromWishlistByProductId,
} from "@/api";
import { PRODUCT_COLORS, PRODUCT_GENDERS } from "@/constants/filterConstants";
import { getUserRole } from "../../utils/auth";
import { useCartStore } from "../store/cartStore";
import { useSnackbar } from "../../providers/snackbarProvider";

import RatingSummary from "./ratingSummary";
import ProductImageSlider from "./productImageSlider";
import ProductPurchasePanel from "./productPurchasePanel";

type Gender = (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS];

interface ProductPopupProps {
  open: boolean;
  onClose: () => void;
  id: number;
  name: string;
  description: string;
  imageUrls: string[];
  price: number;
  color: string[];
  size: string[];
  defaultSize?: string;
  defaultColor?: string;
  defaultGender?: Gender;
  mode?: "edit" | "add";
  originalGender?: Gender;
  originalSize?: string;
  originalColor?: string;
  isWished?: boolean;
}

const PREFIX = "ProductPopup";

const classes = {
  root: `${PREFIX}-root`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  container: `${PREFIX}-container`,
};

const Root = styled(Dialog)(({ theme }) => ({
  [`&.${classes.root}`]: {
    maxWidth: "1000px",
    margin: "auto",
  },
  [`& .MuiDialog-paper`]: {
    height: "720px",
    maxHeight: "calc(100vh - 60px)",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      maxWidth: "100%",
      height: "100vh",
      maxHeight: "100dvh",
      margin: 0,
      borderRadius: 0,
    },
  },
  [`& .MuiDialogContent-root`]: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      overflowY: "auto",
    },
  },
  [`& .${classes.dialogTitle}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
    minHeight: 0,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      flex: "0 0 auto",
    },
  },
}));

const ProductPopup = ({
  open,
  onClose,
  id,
  name,
  description,
  imageUrls,
  price,
  color: initialColors,
  size: initialSizes,
  defaultGender = "Female",
  defaultSize = initialSizes[0],
  defaultColor = PRODUCT_COLORS.BLACK,
  mode,
  originalGender,
  originalSize,
  originalColor,
  isWished,
}: ProductPopupProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [gender, setGender] = useState<Gender>(defaultGender as Gender);
  const [size, setSize] = useState<string>(defaultSize);
  const [color, setColor] = useState<string>(defaultColor);
  const [quantity, setQuantity] = useState<number>(1);
  const [isInWishlist, setIsInWishlist] = useState(isWished);

  const { data: dbProduct = null } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: open,
  });

  const { data: stockData = [], isFetched: isStockFetched } = useQuery({
    queryKey: ["productStock", id],
    queryFn: () => fetchProductStock(id),
    enabled: open,
  });

  const colors = dbProduct?.color || initialColors;
  const sizes = dbProduct?.size || initialSizes;

  const availableGenders: Gender[] = dbProduct?.gender
    ? Array.isArray(dbProduct.gender)
      ? (dbProduct.gender as Gender[])
      : [dbProduct.gender as Gender]
    : [PRODUCT_GENDERS.FEMALE, PRODUCT_GENDERS.MALE];

  useEffect(() => {
    if (!dbProduct || !dbProduct.gender) return;
    const genderArray = Array.isArray(dbProduct.gender)
      ? dbProduct.gender
      : [dbProduct.gender];
    if (!genderArray.includes(gender)) {
      setGender(genderArray[0] as Gender);
    }
  }, [dbProduct, gender]);

  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const variant of stockData) {
      map[`${variant.gender}_${variant.size}_${variant.color}`] = variant.stock;
    }
    return map;
  }, [stockData]);

  const currentStock = stockMap[`${gender}_${size}_${color}`] ?? 0;
  const isOutOfStock = isStockFetched && currentStock === 0;

  const getSizeStock = (sizeOption: string) => {
    if (!isStockFetched) return 1;
    return colors.reduce((total, colorOption) => {
      return total + (stockMap[`${gender}_${sizeOption}_${colorOption}`] ?? 0);
    }, 0);
  };

  const userRole = getUserRole();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);

  const changeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === PRODUCT_GENDERS.FEMALE || value === PRODUCT_GENDERS.MALE) {
      setGender(value as Gender);
    }
  };

  const changeSize = (event: SelectChangeEvent<string>) => {
    setSize(event.target.value);
  };

  const submitAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    addItem({
      productId: id,
      productName: name,
      productDescription: description,
      productImageUrl: imageUrls?.[0] || "",
      productPrice: price,
      productQuantity: quantity,
      gender,
      size,
      color,
      availableSizes: sizes,
      availableColors: colors,
    });
    showSnackbar(t("snackbar.addedToCart"), "success");
  };

  const submitModify = (event: React.MouseEvent) => {
    event.stopPropagation();
    updateItem(
      originalGender ?? gender,
      originalSize ?? size,
      originalColor ?? color,
      {
        productId: id,
        productName: name,
        productDescription: description,
        productImageUrl: imageUrls?.[0] || "",
        productPrice: price,
        productQuantity: quantity,
        gender,
        size,
        color,
        availableSizes: sizes,
        availableColors: colors,
      }
    );
    showSnackbar(t("snackbar.cartUpdated"), "success");
  };

  const onAddToWishlist = async () => {
    await addToWishlist({
      productId: id,
      productName: name,
      description,
      imageUrl: imageUrls?.[0] || "",
      price,
      color,
      size,
      gender,
      quantity,
    });
    setIsInWishlist(true);
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    showSnackbar(t("snackbar.addedToWishlist"), "success");
  };

  const onRemoveFromWishlist = async () => {
    await removeFromWishlistByProductId(id);
    setIsInWishlist(false);
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
  };

  useEffect(() => {
    setIsInWishlist(isWished);
  }, [isWished]);

  useEffect(() => {
    if (!dbProduct) return;
    if (!sizes.includes(size)) {
      setSize(
        originalSize && sizes.includes(originalSize as string)
          ? (originalSize as string)
          : sizes[0]
      );
    }
    if (!colors.includes(color)) {
      setColor(
        originalColor && colors.includes(originalColor as string)
          ? (originalColor as string)
          : colors[0]
      );
    }
  }, [dbProduct, sizes, colors, size, color, originalSize, originalColor]);

  useEffect(() => {
    if (!isStockFetched) return;
    const variantStock = stockMap[`${gender}_${size}_${color}`] ?? 0;
    if (quantity > variantStock && variantStock > 0) {
      setQuantity(variantStock);
    } else if (variantStock === 0) {
      setQuantity(1);
    }
  }, [gender, size, color, stockMap, isStockFetched]);

  return (
    <Root
      className={classes.root}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle className={classes.dialogTitle}>
        {name}
        <IconButton onClick={onClose}>
          <CloseIcon aria-label={t("card.aria.close")} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <RatingSummary productId={id} productName={name} isEnabled={open} />
        <Box className={classes.container}>
          <ProductImageSlider
            productId={id}
            name={name}
            imageUrls={imageUrls}
            userRole={userRole}
            isOpen={open}
            isInWishlist={isInWishlist}
            onAddToWishlist={onAddToWishlist}
            onRemoveFromWishlist={onRemoveFromWishlist}
          />
          <ProductPurchasePanel
            description={description}
            price={price}
            userRole={userRole}
            mode={mode}
            availableGenders={availableGenders}
            gender={gender}
            onGenderChange={changeGender}
            sizes={sizes}
            size={size}
            onSizeChange={changeSize}
            getSizeStock={getSizeStock}
            colors={colors}
            color={color}
            onColorChange={setColor}
            quantity={quantity}
            onQuantityChange={setQuantity}
            currentStock={currentStock}
            isStockFetched={isStockFetched}
            isOutOfStock={isOutOfStock}
            onAddToCart={submitAddToCart}
            onModify={submitModify}
          />
        </Box>
      </DialogContent>
    </Root>
  );
};

export default ProductPopup;
