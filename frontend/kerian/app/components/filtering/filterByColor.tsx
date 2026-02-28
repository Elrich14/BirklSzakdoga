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

const PREFIX = "FilterByColor";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  checkboxGroup: `${PREFIX}-checkboxGroup`,
  colorBox: `${PREFIX}-colorBox`,
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
  [`& .${classes.checkboxGroup}`]: {
    display: "block",
  },
  [`& .${classes.colorBox}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
  availableColors = ["Black", "White"],
}: FilterByColorProps) {
  const { t } = useTranslation();

  const onColorCheckboxChange = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const getColorKey = (color: string) => {
    return `card.colors.${color.toLowerCase()}`;
  };

  const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
      Black: "#000000",
      White: "#FFFFFF",
      Red: "#FF0000",
      Blue: "#0000FF",
      Green: "#00AA00",
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
                  sx={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: getColorHex(color),
                    borderRadius: "3px",
                    border: "1px solid #ccc",
                  }}
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
