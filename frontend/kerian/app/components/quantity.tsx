import { Box, IconButton, TextField } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/system";

type quantityProps = {
  value: number;
  onChange: (newValue: number) => void;
  className?: string;
  min?: number;
  max?: number;
};

const PREFIX = "Quantity";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    marginLeft: "auto",
  },
}));

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 30,
}: quantityProps) {
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
        inputProps={{
          min,
          max,
          style: {
            textAlign: "center",
            width: "20px",
          },
        }}
      />
      <IconButton size="small" onClick={increase}>
        <AddIcon />
      </IconButton>
    </Root>
  );
}
