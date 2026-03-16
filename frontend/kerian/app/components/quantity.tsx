"use client";

import { Box, IconButton, TextField } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/system";

interface QuantityProps {
  value: number;
  onChange: (newValue: number) => void;
  className?: string;
  min?: number;
  max?: number;
}

const PREFIX = "Quantity";

const classes = {
  root: `${PREFIX}-root`,
  quantityInput: `${PREFIX}-quantityInput`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginLeft: "auto",
  },
  [`& .${classes.quantityInput}`]: {
    "& .MuiInputBase-input": {
      textAlign: "center",
      width: "20px",
    },
  },
}));

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 30,
}: QuantityProps) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  const manualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    if (!isNaN(newVal) && newVal >= min && newVal <= max) {
      onChange(newVal);
    }
  };

  return (
    <Root className={classes.root}>
      <IconButton size="small" onClick={decrease}>
        <RemoveIcon />
      </IconButton>
      <TextField
        type="number"
        value={value}
        onChange={manualChange}
        size="small"
        className={classes.quantityInput}
        inputProps={{
          min,
          max,
        }}
      />
      <IconButton size="small" onClick={increase}>
        <AddIcon />
      </IconButton>
    </Root>
  );
}
