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

const PREFIX = "FilterBySize";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  checkboxGroup: `${PREFIX}-checkboxGroup`,
  selectAllBox: `${PREFIX}-selectAllBox`,
  sizesGrid: `${PREFIX}-sizesGrid`,
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
  [`& .${classes.selectAllBox}`]: {
    borderBottom: "1px solid #e0e0e0",
  },
  [`& .${classes.sizesGrid}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
    gap: "5px",
  },
}));

interface FilterBySizeProps {
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
}

export default function FilterBySize({
  selectedSizes,
  onSizeChange,
}: FilterBySizeProps) {
  const { t } = useTranslation();
  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

  const onSizeCheckboxChange = (size: string) => {
    if (selectedSizes.includes(size)) {
      // Remove size if it's already selected
      onSizeChange(selectedSizes.filter((s) => s !== size));
    } else {
      // Add size if it's not selected
      onSizeChange([...selectedSizes, size]);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      onSizeChange(availableSizes);
    } else {
      onSizeChange([]);
    }
  };

  const isAllSelected = selectedSizes.length === availableSizes.length;

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>{t("filter.size")}</Typography>
      <FormGroup className={classes.checkboxGroup}>
        <Box className={classes.selectAllBox}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            }
            label={t("filter.selectAll")}
          />
        </Box>
        <Box className={classes.sizesGrid}>
          {availableSizes.map((size) => (
            <FormControlLabel
              key={size}
              control={
                <Checkbox
                  checked={selectedSizes.includes(size)}
                  onChange={() => onSizeCheckboxChange(size)}
                />
              }
              label={size}
            />
          ))}
        </Box>
      </FormGroup>
    </Root>
  );
}
