"use client";
import { Box, TextField, Typography, Slider } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const PREFIX = "FilterByPrice";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  priceInputs: `${PREFIX}-priceInputs`,
  slider: `${PREFIX}-slider`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "20px",
  },
  [`& .${classes.priceInputs}`]: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    marginBottom: "16px",
  },
  [`& .${classes.slider}`]: {
    marginTop: "12px",
    marginBottom: "8px",
  },
}));

interface FilterByPriceProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  availableMinPrice?: number;
  availableMaxPrice?: number;
}

export default function FilterByPrice({
  minPrice,
  maxPrice,
  onPriceChange,
  availableMinPrice = 0,
  availableMaxPrice = 100000,
}: FilterByPriceProps) {
  const { t } = useTranslation();
  const [localMin, setLocalMin] = useState<number>(minPrice);
  const [localMax, setLocalMax] = useState<number>(maxPrice);

  const onSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [newMin, newMax] = newValue;
      setLocalMin(newMin);
      setLocalMax(newMax);
      onPriceChange(newMin, newMax);
    }
  };

  const onMinInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= localMax) {
      setLocalMin(numValue);
      onPriceChange(numValue, localMax);
    }
  };

  const onMaxInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= localMin) {
      setLocalMax(numValue);
      onPriceChange(localMin, numValue);
    }
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("filter.price") || "Price"}
      </Typography>

      <Box className={classes.priceInputs}>
        <TextField
          type="number"
          size="small"
          label={t("filter.minPrice") || "Min"}
          value={localMin}
          onChange={(e) => onMinInputChange(e.target.value)}
          inputProps={{ min: availableMinPrice }}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          size="small"
          label={t("filter.maxPrice") || "Max"}
          value={localMax}
          onChange={(e) => onMaxInputChange(e.target.value)}
          inputProps={{ max: availableMaxPrice }}
          sx={{ flex: 1 }}
        />
      </Box>

      <Slider
        className={classes.slider}
        getAriaLabel={() => "Price range"}
        value={[localMin, localMax]}
        onChange={onSliderChange}
        valueLabelDisplay="auto"
        min={availableMinPrice}
        max={availableMaxPrice}
        step={100}
      />
    </Root>
  );
}
