"use client";

import { styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

interface VariantStockEditorProps {
  genders: string[];
  sizes: string[];
  selectedColors: string[];
  stockMap: Record<string, number>;
  onStockChange: (key: string, value: number) => void;
  onSetAll: (value: number) => void;
}

const PREFIX = "VariantStockEditor";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  grid: `${PREFIX}-grid`,
  row: `${PREFIX}-row`,
  label: `${PREFIX}-label`,
  input: `${PREFIX}-input`,
  setAllRow: `${PREFIX}-setAllRow`,
  setAllInput: `${PREFIX}-setAllInput`,
  setAllButton: `${PREFIX}-setAllButton`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: `1px solid ${theme.vars?.palette.admin.borderLight}`,
    borderRadius: "8px",
    padding: "16px",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.grid}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "12px",
  },
  [`& .${classes.row}`]: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "space-between",
  },
  [`& .${classes.label}`]: {
    fontSize: "13px",
    minWidth: "180px",
  },
  [`& .${classes.input}`]: {
    width: "80px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.vars?.palette.admin.input,
    },
  },
  [`& .${classes.setAllRow}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  [`& .${classes.setAllInput}`]: {
    width: "80px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.vars?.palette.admin.input,
    },
  },
  [`& .${classes.setAllButton}`]: {
    color: theme.vars?.palette.kerian.main,
    borderColor: theme.vars?.palette.kerian.main,
  },
}));

export default function VariantStockEditor({
  genders,
  sizes,
  selectedColors,
  stockMap,
  onStockChange,
  onSetAll,
}: VariantStockEditorProps) {
  const { t } = useTranslation();
  const [setAllValue, setSetAllValue] = useState<string>("");

  const totalStock = genders.reduce(
    (total, gender) =>
      total +
      sizes.reduce(
        (sizeTotal, size) =>
          sizeTotal +
          selectedColors.reduce((colorTotal, color) => {
            const key = `${gender}_${size}_${color}`;
            return colorTotal + (stockMap[key] ?? 0);
          }, 0),
        0
      ),
    0
  );

  const onSetAllClick = () => {
    const parsedValue = parseInt(setAllValue) || 0;
    onSetAll(parsedValue);
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="subtitle2">
          {t("admin.products.stockManagement")}
        </Typography>
        <Typography variant="caption">
          {t("admin.products.totalStock")}: {totalStock}
        </Typography>
      </Box>
      <Box className={classes.setAllRow}>
        <TextField
          type="number"
          size="small"
          value={setAllValue}
          onChange={(event) => setSetAllValue(event.target.value)}
          className={classes.setAllInput}
          inputProps={{ min: 0 }}
          placeholder="0"
        />
        <Button
          variant="outlined"
          size="small"
          className={classes.setAllButton}
          onClick={onSetAllClick}
        >
          {t("admin.products.setAll")}
        </Button>
      </Box>
      <Box className={classes.grid}>
        {genders.map((gender) =>
          sizes.map((size) =>
            selectedColors.map((color) => {
              const key = `${gender}_${size}_${color}`;
              return (
                <Box key={key} className={classes.row}>
                  <Typography className={classes.label}>
                    {gender} / {size} / {color}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={stockMap[key] ?? 0}
                    onChange={(event) => {
                      const parsedValue = parseInt(event.target.value) || 0;
                      onStockChange(key, parsedValue);
                    }}
                    className={classes.input}
                    inputProps={{ min: 0 }}
                  />
                </Box>
              );
            })
          )
        )}
      </Box>
    </Root>
  );
}
