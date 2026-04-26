"use client";

import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PRODUCT_GENDERS } from "@/constants/filterConstants";
import QuantityInput from "../quantity";

type Gender = (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS];

interface ProductPurchasePanelProps {
  description: string;
  price: number;
  userRole: string;
  mode?: "edit" | "add";
  availableGenders: Gender[];
  gender: Gender;
  onGenderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sizes: string[];
  size: string;
  onSizeChange: (event: SelectChangeEvent<string>) => void;
  getSizeStock: (sizeOption: string) => number;
  colors: string[];
  color: string;
  onColorChange: (color: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  currentStock: number;
  isStockFetched: boolean;
  isOutOfStock: boolean;
  onAddToCart: (event: React.MouseEvent) => void;
  onModify: (event: React.MouseEvent) => void;
}

const PREFIX = "ProductPurchasePanel";

const classes = {
  root: `${PREFIX}-root`,
  descriptionBox: `${PREFIX}-descriptionBox`,
  productDescription: `${PREFIX}-productDescription`,
  readMoreLink: `${PREFIX}-readMoreLink`,
  descriptionDialog: `${PREFIX}-descriptionDialog`,
  descriptionDialogTitle: `${PREFIX}-descriptionDialogTitle`,
  descriptionDialogBody: `${PREFIX}-descriptionDialogBody`,
  orderDetails: `${PREFIX}-orderDetails`,
  genderRadioGroup: `${PREFIX}-genderRadioGroup`,
  sizeSelect: `${PREFIX}-sizeSelect`,
  colorButton: `${PREFIX}-colorButton`,
  colorButtonCircle: `${PREFIX}-colorButtonCircle`,
  colorButtonCircleSelected: `${PREFIX}-colorButtonCircleSelected`,
  colorButtonGroup: `${PREFIX}-colorButtonGroup`,
  sizeOutOfStock: `${PREFIX}-sizeOutOfStock`,
  stockInfo: `${PREFIX}-stockInfo`,
  outOfStockText: `${PREFIX}-outOfStockText`,
  footer: `${PREFIX}-footer`,
  price: `${PREFIX}-price`,
  addToCartButton: `${PREFIX}-addToCartButton`,
  guestText: `${PREFIX}-guestText`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    margin: "0px 0px 10px 20px",
  },
  [`& .${classes.descriptionBox}`]: {
    marginBottom: "15px",
  },
  [`& .${classes.productDescription}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "15px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    height: "70px",
    cursor: "pointer",
    "&:hover": {
      opacity: 0.85,
    },
  },
  [`& .${classes.readMoreLink}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: theme.palette.kerian.main,
    textDecoration: "underline",
    cursor: "pointer",
    marginTop: "4px",
    width: "fit-content",
    "&:hover": {
      opacity: 0.85,
    },
  },
  [`& .${classes.orderDetails}`]: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
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
    outline: `3px solid ${theme.palette.kerian.main}`,
  },
  [`& .${classes.colorButtonGroup}`]: {
    marginLeft: "auto",
  },
  [`& .${classes.sizeOutOfStock}`]: {
    opacity: 0.4,
  },
  [`& .${classes.stockInfo}`]: {
    fontSize: "13px",
    color: theme.palette.kerian.main,
    fontWeight: "bold",
  },
  [`& .${classes.outOfStockText}`]: {
    fontSize: "13px",
    color: theme.palette.error.main,
    fontWeight: "bold",
  },
  [`& .${classes.footer}`]: {
    display: "flex",
    justifyContent: "space-between",
  },
  [`& .${classes.price}`]: {
    fontFamily: "monospace",
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: "25px",
    marginTop: "10px",
  },
  [`& .${classes.addToCartButton}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "16px",
    width: "150px",
    whiteSpace: "nowrap",
  },
  [`& .${classes.guestText}`]: {
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: "20px",
  },
}));

const DescriptionDialog = styled(Dialog)(() => ({
  [`& .${classes.descriptionDialogTitle}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  [`& .${classes.descriptionDialogBody}`]: {
    fontFamily: "monospace",
    fontSize: "15px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
  },
}));

const ProductPurchasePanel = ({
  description,
  price,
  userRole,
  mode,
  availableGenders,
  gender,
  onGenderChange,
  sizes,
  size,
  onSizeChange,
  getSizeStock,
  colors,
  color,
  onColorChange,
  quantity,
  onQuantityChange,
  currentStock,
  isStockFetched,
  isOutOfStock,
  onAddToCart,
  onModify,
}: ProductPurchasePanelProps) => {
  const { t } = useTranslation();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const hasLongDescription = description.length > 120;

  const openDescription = () => setIsDescriptionOpen(true);
  const closeDescription = () => setIsDescriptionOpen(false);

  return (
    <Root className={classes.root}>
      <Box className={classes.descriptionBox}>
        <Typography
          className={classes.productDescription}
          variant="body1"
          onClick={openDescription}
        >
          {description}
        </Typography>
        {hasLongDescription && (
          <Typography
            className={classes.readMoreLink}
            onClick={openDescription}
          >
            {t("card.readMore")}
          </Typography>
        )}
      </Box>

      <Box className={classes.orderDetails}>
        <Typography variant="body2" fontWeight="bold">
          {t("card.fit")}:
        </Typography>
        <FormControl className={classes.genderRadioGroup}>
          <RadioGroup row value={gender} onChange={onGenderChange}>
            <FormControlLabel
              value={PRODUCT_GENDERS.MALE}
              disabled={!availableGenders.includes(PRODUCT_GENDERS.MALE)}
              control={<Radio />}
              label={t("filter.genderOptions.Male")}
              labelPlacement="start"
            />
            <FormControlLabel
              value={PRODUCT_GENDERS.FEMALE}
              disabled={!availableGenders.includes(PRODUCT_GENDERS.FEMALE)}
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
            onChange={onSizeChange}
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
            if (newColor !== null) onColorChange(newColor);
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
                style={
                  { "--circle-color": colorOption } as React.CSSProperties
                }
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Typography variant="body2" fontWeight="bold">
          {t("card.quantity")}:
        </Typography>
        <QuantityInput
          value={quantity}
          onChange={onQuantityChange}
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

      <Box className={classes.footer}>
        <Typography className={classes.price} fontWeight="bold">
          {price} {t("card.currency")}
        </Typography>
        {userRole === "user" && (
          <Button
            className={classes.addToCartButton}
            variant="contained"
            size="small"
            onClick={mode === "add" ? onAddToCart : onModify}
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

      <DescriptionDialog
        className={classes.descriptionDialog}
        open={isDescriptionOpen}
        onClose={closeDescription}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className={classes.descriptionDialogTitle}>
          {t("card.description")}
          <IconButton
            onClick={closeDescription}
            aria-label={t("card.aria.close")}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography className={classes.descriptionDialogBody}>
            {description}
          </Typography>
        </DialogContent>
      </DescriptionDialog>
    </Root>
  );
};

export default ProductPurchasePanel;
