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
import { useState } from "react";
import { colors } from "../../constants/colors";

type ProductPopupProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
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
}));

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const colorsList = ["black", "white"];

export default function ProductPopup({
  open,
  onClose,
  name,
  description,
  imageUrl,
  price,
}: ProductPopupProps) {
  const [gender, setGender] = useState<"Male" | "Female">("Female");
  const [size, setSize] = useState<string>("");

  const [color, setColor] = useState("Black");

  const changeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "Female" || value === "Male") {
      setGender(value);
    }
  };

  const changeSize = (event: SelectChangeEvent<string>) => {
    setSize(event.target.value);
  };

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
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box className={classes.container}>
          <Image
            src={imageUrl}
            alt={name}
            width={450}
            height={500}
            style={{ borderRadius: 4 }}
          />
          <Box className={classes.dataContainer}>
            <Typography className={classes.productDescription} variant="body1">
              {description}
            </Typography>

            <Box className={classes.popupOrderDetailsBox}>
              <Typography variant="body2" fontWeight="bold">
                Fit:
              </Typography>
              <FormControl className={classes.genderRadioGroup}>
                <RadioGroup row value={gender} onChange={changeGender}>
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                    labelPlacement="start"
                  />
                </RadioGroup>
              </FormControl>
              {/*-----------------------------------gender vege-----------------------------------*/}
              <Typography variant="body2" fontWeight="bold">
                Size:
              </Typography>
              <FormControl className={classes.sizeSelect}>
                <InputLabel>Size</InputLabel>
                <Select
                  // multiple
                  value={size}
                  onChange={changeSize}
                  input={<OutlinedInput label="Size" />}
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
                Color:
              </Typography>

              <ToggleButtonGroup
                value={color}
                exclusive
                onChange={(_, newColor) => {
                  if (newColor !== null) setColor(newColor);
                }}
                className={classes.colorButtonGroup}
              >
                {colorsList.map((col) => (
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
                            ? `3px solid ${colors.kerian_main}`
                            : "none ",
                      }}
                    />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box className={classes.popupFooterBox}>
              <Typography className={classes.price} fontWeight="bold">
                {price} Ft
              </Typography>
              <Button
                className={classes.addToCardButton}
                variant="contained"
                size="small"
              >
                Add To Cart
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Root>
  );
}
