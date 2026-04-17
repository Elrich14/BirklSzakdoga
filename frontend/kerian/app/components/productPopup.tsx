"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  styled,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductById,
  fetchProductStock,
  addToWishlist,
  removeFromWishlistByProductId,
} from "@/api";
import { colors as themeColors } from "../../constants/colors";
import { getUserRole } from "../utils/auth";
import { useTranslation } from "react-i18next";
import { useCartStore } from "./store/cartStore";
import QuantityInput from "./quantity";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { PRODUCT_COLORS, PRODUCT_GENDERS } from "@/constants/filterConstants";

import { resolveImageUrl } from "../utils/image";
import { useSnackbar } from "../providers/snackbarProvider";

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
  defaultGender?: (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS];
  mode?: "edit" | "add";
  originalGender?: (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS];
  originalSize?: string;
  originalColor?: string;
  isWished?: boolean;
}

const PREFIX = "ProductPopup";

const classes = {
  root: `${PREFIX}-root`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  container: `${PREFIX}-container`,
  dataContainer: `${PREFIX}-dataContainer`,
  addToCardButton: `${PREFIX}-addToCardButton`,
  productDescription: `${PREFIX}-productDescription`,
  price: `${PREFIX}-price`,
  popupFooterBox: `${PREFIX}-popupFooterBox`,
  popupOrderDetailsBox: `${PREFIX}-popupOrderDetailsBox`,
  genderRadioGroup: `${PREFIX}-genderRadioGroup`,
  sizeSelect: `${PREFIX}-sizeSelect`,
  colorButton: `${PREFIX}-colorButton`,
  colorButtonCircle: `${PREFIX}-colorButtonCircle`,
  colorButtonCircleSelected: `${PREFIX}-colorButtonCircleSelected`,
  colorButtonGroup: `${PREFIX}-colorButtonGroup`,
  cardLeftSideBox: `${PREFIX}-cardLeftSideBox`,
  addToWishlistButton: `${PREFIX}-addToWishlistButton`,
  thumbnailRow: `${PREFIX}-thumbnailRow`,
  thumbnail: `${PREFIX}-thumbnail`,
  thumbnailActive: `${PREFIX}-thumbnailActive`,
  mainImage: `${PREFIX}-mainImage`,
  guestText: `${PREFIX}-guestText`,
  stockInfo: `${PREFIX}-stockInfo`,
  outOfStockText: `${PREFIX}-outOfStockText`,
  sizeOutOfStock: `${PREFIX}-sizeOutOfStock`,
};

const Root = styled(Dialog)(() => ({
  [`&.${classes.root}`]: {
    maxWidth: "1000px",
    margin: "auto",
  },
  [`& .${classes.dialogTitle}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  [`& .${classes.dataContainer}`]: {
    display: "flex",
    flexDirection: "column",
    margin: "10px 0px 10px 20px",
  },
  [`& .${classes.addToCardButton}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "20px",
    width: "150px",
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
  [`& .${classes.popupFooterBox}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  [`& .${classes.popupOrderDetailsBox}`]: {
    display: "flex",
    flexDirection: "column",
    marginTop: "20px",
    marginBottom: "20px",
    gap: "10px",
  },
  [`& .${classes.genderRadioGroup}`]: {
    width: "fit-content",
    marginLeft: "auto",
  },
  [`& .${classes.sizeSelect}`]: {
    width: "200px",
    marginLeft: "auto",
  },
  [`& .${classes.colorButton}`]: {
    border: "none",
    background: "transparent",
    "&.Mui-selected": {
      background: "transparent",
      "&:hover": {
        background: "transparent",
      },
    },
    "&:hover": {
      background: "transparent",
    },
  },
  [`& .${classes.colorButtonCircle}`]: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    outline: "none",
    backgroundColor: "var(--circle-color)",
  },
  [`& .${classes.colorButtonCircleSelected}`]: {
    outline: `3px solid ${themeColors.kerian_main}`,
  },
  [`& .${classes.colorButtonGroup}`]: {
    marginLeft: "auto",
  },
  [`& .${classes.cardLeftSideBox}`]: {
    position: "relative",
  },
  [`& .${classes.addToWishlistButton}`]: {
    position: "absolute",
    top: "8px",
    right: "8px",
    color: themeColors.kerian_main,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      color: themeColors.kerian_main,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
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
    borderColor: themeColors.kerian_main,
  },
  [`& .${classes.mainImage}`]: {
    borderRadius: "4px",
    objectFit: "cover",
  },
  [`& .${classes.guestText}`]: {
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: "20px",
  },
  [`& .${classes.stockInfo}`]: {
    fontSize: "13px",
    color: themeColors.kerian_main,
    fontWeight: "bold",
  },
  [`& .${classes.outOfStockText}`]: {
    fontSize: "13px",
    color: themeColors.danger,
    fontWeight: "bold",
  },
  [`& .${classes.sizeOutOfStock}`]: {
    opacity: 0.4,
  },
}));

export default function ProductPopup({
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
}: ProductPopupProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [gender, setGender] = useState<
    (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS]
  >(defaultGender as (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS]);
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

  useEffect(() => {
    if (open) setActiveImageIndex(0);
  }, [id, open]);

  const colors = dbProduct?.color || initialColors;
  const sizes = dbProduct?.size || initialSizes;

  // Get available genders from the product
  const availableGenders = dbProduct?.gender
    ? Array.isArray(dbProduct.gender)
      ? dbProduct.gender
      : [dbProduct.gender]
    : [PRODUCT_GENDERS.FEMALE, PRODUCT_GENDERS.MALE];

  // when product data arrives, if it has gender options, auto-select the first one if needed
  useEffect(() => {
    if (!dbProduct || !dbProduct.gender) return;
    const genderArray = Array.isArray(dbProduct.gender)
      ? dbProduct.gender
      : [dbProduct.gender];
    // If current gender is not in available genders, select the first available
    if (!genderArray.includes(gender)) {
      setGender(
        genderArray[0] as (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS]
      );
    }
  }, [dbProduct, gender]);

  // Build a lookup map for stock: "gender_size_color" → stock count
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const variant of stockData) {
      map[`${variant.gender}_${variant.size}_${variant.color}`] = variant.stock;
    }
    return map;
  }, [stockData]);

  const currentStock = stockMap[`${gender}_${size}_${color}`] ?? 0;
  const isOutOfStock = isStockFetched && currentStock === 0;

  // Helper: check if a specific size has any stock for current gender
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
      setGender(
        value as (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS]
      );
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

  useEffect(() => {
    setIsInWishlist(isWished);
  }, [isWished]);

  useEffect(() => {
    if (!dbProduct) return;
    // If current size is not in the new sizes array, use first available size
    if (!sizes.includes(size)) {
      setSize(
        originalSize && sizes.includes(originalSize as string)
          ? (originalSize as string)
          : sizes[0]
      );
    }
    // If current color is not in the new colors array, use first available color
    if (!colors.includes(color)) {
      setColor(
        originalColor && colors.includes(originalColor as string)
          ? (originalColor as string)
          : colors[0]
      );
    }
  }, [dbProduct, sizes, colors, size, color, originalSize, originalColor]);

  // Reset quantity when variant changes to respect stock limits
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
        <Box className={classes.container}>
          <Box className={classes.cardLeftSideBox}>
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
                    color: color,
                    size: size,
                    gender: gender,
                    quantity: quantity,
                  });
                  setIsInWishlist(true);
                  queryClient.invalidateQueries({ queryKey: ["wishlist"] });
                  showSnackbar(t("snackbar.addedToWishlist"), "success");
                }}
                className={classes.addToWishlistButton}
                aria-label={t("card.aria.addToWishlist")}
              />
            )}
          </Box>
          <Box className={classes.dataContainer}>
            <Typography className={classes.productDescription} variant="body1">
              {description}
            </Typography>

            <Box className={classes.popupOrderDetailsBox}>
              <Typography variant="body2" fontWeight="bold">
                {t("card.fit")}:
              </Typography>
              <FormControl className={classes.genderRadioGroup}>
                <RadioGroup row value={gender} onChange={changeGender}>
                  <FormControlLabel
                    value={PRODUCT_GENDERS.MALE}
                    disabled={!availableGenders.includes(PRODUCT_GENDERS.MALE)}
                    control={<Radio />}
                    label={t("filter.genderOptions.Male")}
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value={PRODUCT_GENDERS.FEMALE}
                    disabled={
                      !availableGenders.includes(PRODUCT_GENDERS.FEMALE)
                    }
                    control={<Radio />}
                    label={t("filter.genderOptions.Female")}
                    labelPlacement="start"
                  />
                </RadioGroup>
              </FormControl>

              <Typography variant="body2" fontWeight="bold">
                {t("card.size")}:
              </Typography>
              <FormControl className={classes.sizeSelect}>
                <InputLabel>{t("card.size")}</InputLabel>
                <Select
                  value={size}
                  onChange={changeSize}
                  input={<OutlinedInput label={t("card.size")} />}
                >
                  {sizes?.map((sizeOption: string) => {
                    const sizeStock = getSizeStock(sizeOption);
                    const isSizeOut = isStockFetched && sizeStock === 0;
                    return (
                      <MenuItem
                        key={sizeOption}
                        value={sizeOption}
                        className={isSizeOut ? classes.sizeOutOfStock : ""}
                      >
                        {sizeOption}
                        {isSizeOut ? ` (${t("card.outOfStock")})` : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <Typography variant="body2" fontWeight="bold">
                {t("card.color")}:
              </Typography>

              <ToggleButtonGroup
                value={color}
                exclusive
                onChange={(_, newColor) => {
                  if (newColor !== null) setColor(newColor);
                }}
                className={classes.colorButtonGroup}
              >
                {colors?.map((colorOption: string) => (
                  <ToggleButton
                    key={colorOption}
                    value={colorOption}
                    disableRipple
                    className={classes.colorButton}
                  >
                    <Box
                      className={`${classes.colorButtonCircle} ${color === colorOption ? classes.colorButtonCircleSelected : ""}`}
                      style={{ "--circle-color": colorOption } as React.CSSProperties}
                    />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Typography variant="body2" fontWeight="bold">
                {t("card.quantity")}:
              </Typography>
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                max={isStockFetched ? Math.max(currentStock, 1) : 30}
              />
              {isStockFetched &&
                (isOutOfStock ? (
                  <Typography className={classes.outOfStockText}>
                    {t("card.variantOutOfStock")}
                  </Typography>
                ) : (
                  <Typography className={classes.stockInfo}>
                    {t("card.stockLeft", { count: currentStock })}
                  </Typography>
                ))}
            </Box>
            <Box className={classes.popupFooterBox}>
              <Typography className={classes.price} fontWeight="bold">
                {price} {t("card.currency")}
              </Typography>
              {userRole === "user" && (
                <Button
                  className={classes.addToCardButton}
                  variant="contained"
                  size="small"
                  onClick={mode === "add" ? submitAddToCart : submitModify}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock
                    ? t("card.outOfStock")
                    : mode === "add"
                      ? t("card.addToCart")
                      : t("card.modify")}
                </Button>
              )}
              {userRole === "guest" && (
                <Typography variant="body2" className={classes.guestText}>
                  {t("card.loginToBuy")}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Root>
  );
}
