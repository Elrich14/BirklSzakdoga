"use client";
import { Box, Button, Typography, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import FilterBySize from "./filterBySize";

const PREFIX = "ProductFilter";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  actionButtons: `${PREFIX}-actionButtons`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "24px",
    marginBottom: "15px",
  },
  [`& .${classes.actionButtons}`]: {
    marginTop: "15px",
  },
}));

interface ProductFilterProps {
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
}

export default function ProductFilter({
  selectedSizes,
  onSizeChange,
}: ProductFilterProps) {
  const { t } = useTranslation();
  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

  const clearFilters = () => {
    onSizeChange(availableSizes);
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>{t("filter.title")}</Typography>

      <FilterBySize selectedSizes={selectedSizes} onSizeChange={onSizeChange} />

      <Box className={classes.actionButtons}>
        <Button variant="outlined" onClick={clearFilters} fullWidth>
          {t("filter.clear")}
        </Button>
      </Box>
    </Root>
  );
}
