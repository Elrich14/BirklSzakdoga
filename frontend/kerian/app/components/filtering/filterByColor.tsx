"use client";
import {
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import {
  AVAILABLE_COLORS,
  PRODUCT_COLORS,
} from "@/constants/filterConstants";

const PREFIX = "FilterByColor";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  checkboxGroup: `${PREFIX}-checkboxGroup`,
  colorBox: `${PREFIX}-colorBox`,
  colorSwatch: `${PREFIX}-colorSwatch`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "20px",
  },
  [`& .${classes.checkboxGroup}`]: {
    display: "block",
  },
  [`& .${classes.colorBox}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  [`& .${classes.colorSwatch}`]: {
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    border: `1px solid ${theme.palette.text.secondary}`,
    backgroundColor: "var(--swatch-color)",
  },
}));

interface FilterByColorProps {
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  availableColors?: string[];
}

export default function FilterByColor({
  selectedColors,
  onColorChange,
  availableColors = AVAILABLE_COLORS as string[],
}: FilterByColorProps) {
  const { t } = useTranslation();

  const onColorCheckboxChange = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((existingColor) => existingColor !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const getColorKey = (color: string) => {
    return `card.colors.${color.toLowerCase()}`;
  };

  const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
      [PRODUCT_COLORS.BLACK]: "#000000",
      [PRODUCT_COLORS.WHITE]: "#FFFFFF",
    };
    return colorMap[color] || "#CCCCCC";
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("filter.color") || "Color"}
      </Typography>
      <FormGroup className={classes.checkboxGroup}>
        {availableColors.map((color) => (
          <FormControlLabel
            key={color}
            control={
              <Checkbox
                checked={selectedColors.includes(color)}
                onChange={() => onColorCheckboxChange(color)}
              />
            }
            label={
              <Box className={classes.colorBox}>
                <Box
                  className={classes.colorSwatch}
                  style={{ "--swatch-color": getColorHex(color) } as React.CSSProperties}
                />
                {t(getColorKey(color)) || color}
              </Box>
            }
          />
        ))}
      </FormGroup>
    </Root>
  );
}
