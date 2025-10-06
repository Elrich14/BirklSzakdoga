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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useEffect, useState } from "react";
import { colors as themeColors } from "../../constants/colors";
import { getUserRole } from "../utils/auth";
import { useTranslation } from "react-i18next";
import { useCartStore } from "./store/cartStore";
import QuantityInput from "./quantity";
import { addToWishlist } from "@/api";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

type ProductPopupProps = {
  open: boolean;
  onClose: () => void;
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  color: string[];
  size: string[];
  defaultSize?: string;
  defaultColor?: string;
  defaultGender?: "Male" | "Female";
  mode?: "edit" | "add";
  originalGender?: "Male" | "Female";
  originalSize?: string;
  originalColor?: string;
  isWished?: boolean;
};

const PREFIX = "ProductPopup";

const classes = {
  root: `${PREFIX}-root`,
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
  colorButtonGroup: `${PREFIX}-colorButtonGroup`,
  cardLeftSideBox: `${PREFIX}-cardLeftSideBox`,
  addToWishlistButton: `${PREFIX}-addToWishlistButton`,
};

const Root = styled(Dialog)(() => ({
  [`&.${classes.root}`]: {
    maxWidth: "1000px",
    margin: "auto",
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
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  [`& .${classes.colorButtonGroup}`]: {
    marginLeft: "auto",
  },

  [`& .${classes.cardLeftSideBox}`]: {
    position: "relative",
  },
  [`& .${classes.addToWishlistButton}`]: {
    position: "absolute",
    top: 8,
    right: 8,
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
}));

export default function ProductPopup({
  open,
  onClose,
  id,
  name,
  description,
  imageUrl,
  price,
  color: colors,
  size: sizes,
  defaultGender = "Female",
  defaultSize = "S",
  defaultColor = "Black",
  mode,
  originalGender,
  originalSize,
  originalColor,
  isWished,
}: ProductPopupProps) {
  const { t } = useTranslation();
  const [gender, setGender] = useState<"Male" | "Female">(defaultGender);
  const [size, setSize] = useState<string>(defaultSize);
  const [color, setColor] = useState<string>(defaultColor);
  const [quantity, setQuantity] = useState<number>(1);
  const [isInWishlist, setIsInWishlist] = useState(isWished);

  const userRole = getUserRole();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);

  const changeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "Female" || value === "Male") {
      setGender(value);
    }
  };

  const changeSize = (event: SelectChangeEvent<string>) => {
    setSize(event.target.value);
  };

  const submitAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: id,
      productName: name,
      productDescription: description,
      productImageUrl: imageUrl,
      productPrice: price,
      productQuantity: quantity,
      gender,
      size,
      color,
    });
  };

  const submitModify = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem(
      originalGender ?? gender,
      originalSize ?? size,
      originalColor ?? color,
      {
        productId: id,
        productName: name,
        productDescription: description,
        productImageUrl: imageUrl,
        productPrice: price,
        productQuantity: quantity,
        gender,
        size,
        color,
      }
    );
  };

  useEffect(() => {
    setIsInWishlist(isWished);
  }, [isWished]);

  return (
    <Root
      className={classes.root}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {name}
        <IconButton onClick={onClose}>
          <CloseIcon aria-label={t("card.aria.close")} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box className={classes.container}>
          <Box className={classes.cardLeftSideBox}>
            <Image
              src={imageUrl}
              alt={name}
              width={450}
              height={500}
              style={{ borderRadius: 4 }}
            />
            {isInWishlist ? (
              <FavoriteIcon
                fontSize="large"
                onClick={(e) => e.stopPropagation()}
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
                    color: color,
                    size: size,
                    gender: gender,
                    quantity: quantity,
                  });
                  setIsInWishlist(true);
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
                    value="Female"
                    control={<Radio />}
                    label={t("card.gender.female")}
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label={t("card.gender.male")}
                    labelPlacement="start"
                  />
                </RadioGroup>
              </FormControl>
              {/*-----------------------------------gender vege-----------------------------------*/}
              <Typography variant="body2" fontWeight="bold">
                {t("card.size")}:
              </Typography>
              <FormControl className={classes.sizeSelect}>
                <InputLabel>{t("card.size")}</InputLabel>
                <Select
                  value={sizes[0]}
                  onChange={changeSize}
                  input={<OutlinedInput label={t("card.size")} />}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/*-----------------------------------size vege-----------------------------------*/}

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
                {colors.map((col: string) => (
                  <ToggleButton
                    key={col}
                    value={col}
                    disableRipple
                    className={classes.colorButton}
                  >
                    <Box
                      className={classes.colorButtonCircle}
                      sx={{
                        backgroundColor: col,
                        outline:
                          color === col
                            ? `3px solid ${themeColors.kerian_main}`
                            : "none ",
                      }}
                    />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {/*-----------------------------------color vege-----------------------------------*/}
              <Typography variant="body2" fontWeight="bold">
                {t("card.quantity")}:
              </Typography>
              <QuantityInput value={quantity} onChange={setQuantity} />
              {/*-----------------------------------quantity vege-----------------------------------*/}
            </Box>
            <Box className={classes.popupFooterBox}>
              <Typography className={classes.price} fontWeight="bold">
                {price} {t("card.currency")}
              </Typography>
              {userRole == "user" && (
                <Button
                  className={classes.addToCardButton}
                  variant="contained"
                  size="small"
                  onClick={mode === "add" ? submitAddToCart : submitModify}
                >
                  {mode === "add" ? t("card.addToCart") : t("card.modify")}
                </Button>
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
          </Box>
        </Box>
      </DialogContent>
    </Root>
  );
}
