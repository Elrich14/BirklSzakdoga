"use client";
import {
  Box,
  Button,
  Typography,
  styled,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Slider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  AVAILABLE_COLORS,
  AVAILABLE_SIZES,
  AVAILABLE_GENDERS,
} from "@/constants/filterConstants";

const PREFIX = "ProductFilter";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  filterSection: `${PREFIX}-filterSection`,
  sectionTitle: `${PREFIX}-sectionTitle`,
  checkboxGroup: `${PREFIX}-checkboxGroup`,
  radioGroup: `${PREFIX}-radioGroup`,
  priceInputs: `${PREFIX}-priceInputs`,
  colorBox: `${PREFIX}-colorBox`,
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
  [`& .${classes.filterSection}`]: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  [`& .${classes.sectionTitle}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "20px",
  },
  [`& .${classes.checkboxGroup}`]: {
    display: "block",
  },
  [`& .${classes.radioGroup}`]: {
    display: "block",
  },
  [`& .${classes.priceInputs}`]: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 10,
  },
  [`& .${classes.colorBox}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  [`& .${classes.actionButtons}`]: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
  },
}));

const availableSizes = AVAILABLE_SIZES;
const availableColors = AVAILABLE_COLORS;

interface ProductFilterProps {
  onFiltersChange?: (filters: FilterState) => void;
  maxPrice?: number;
}

export interface FilterState {
  sizes: string[];
  gender: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
}

export default function ProductFilterNew({
  onFiltersChange,
  maxPrice = 0,
}: ProductFilterProps) {
  const { t } = useTranslation();

  // initial selected max is the incoming maxPrice (highest priced item from parent)
  const initialSelectedMax = maxPrice;

  const [filters, setFilters] = useState<FilterState>({
    sizes: availableSizes,
    gender: [],
    colors: [],
    priceMin: 0,
    priceMax: initialSelectedMax,
  });

  // local inputs for price so we can clear on focus and only commit on blur
  const [localMinInput, setLocalMinInput] = useState<string>(
    String(filters.priceMin)
  );
  const [localMaxInput, setLocalMaxInput] = useState<string>(
    String(filters.priceMax)
  );

  // sync local inputs when filters change (e.g., reset)
  useEffect(() => {
    setLocalMinInput(String(filters.priceMin));
    setLocalMaxInput(String(filters.priceMax));
  }, [filters.priceMin, filters.priceMax]);

  // when the parent tells us the maxPrice (highest priced item) changes,
  // ensure our selected max is not above that value and update accordingly
  useEffect(() => {
    // If maxPrice becomes available (non-zero) and we haven't initialized a
    // sensible priceMax yet (it's 0), set it to maxPrice so the UI shows the
    // highest product price. Also clamp down if current selected max is above
    // the new catalog maxPrice.
    if (!maxPrice) return;

    if (filters.priceMax === 0 || filters.priceMax > maxPrice) {
      const next = { ...filters, priceMax: maxPrice };
      setFilters(next);
      if (onFiltersChange) onFiltersChange(next);
    }
  }, [maxPrice, filters.priceMax, filters, onFiltersChange]);

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Size handlers
  const onSizeCheckboxChange = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    updateFilters({ ...filters, sizes: newSizes });
  };

  const toggleAllSizes = (checked: boolean) => {
    const newSizes = checked ? availableSizes : [];
    updateFilters({ ...filters, sizes: newSizes });
  };

  const isAllSizesSelected = filters.sizes.length === availableSizes.length;

  // Gender handler
  const onGenderChange = (gender: string) => {
    const newGenders = filters.gender.includes(gender)
      ? filters.gender.filter((g) => g !== gender)
      : [...filters.gender, gender];
    updateFilters({
      ...filters,
      gender: newGenders,
    });
  };

  // Color handlers
  const onColorCheckboxChange = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    updateFilters({ ...filters, colors: newColors });
  };

  const getColorKey = (color: string) => `card.colors.${color.toLowerCase()}`;

  // Price handlers
  const onSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [newMin, newMax] = newValue;
      updateFilters({ ...filters, priceMin: newMin, priceMax: newMax });
    }
  };

  const commitMinFromInput = () => {
    const numValue = parseInt(localMinInput);
    if (isNaN(numValue)) {
      // restore previous
      setLocalMinInput(String(filters.priceMin));
      return;
    }
    const clamped = Math.max(0, Math.min(numValue, filters.priceMax));
    updateFilters({ ...filters, priceMin: clamped });
  };

  const commitMaxFromInput = () => {
    const numValue = parseInt(localMaxInput);
    if (isNaN(numValue)) {
      setLocalMaxInput(String(filters.priceMax));
      return;
    }
    const clamped = Math.min(Math.max(numValue, filters.priceMin), maxPrice);
    updateFilters({ ...filters, priceMax: clamped });
  };

  // Clear all filters
  const onClearFilters = () => {
    updateFilters({
      sizes: availableSizes,
      gender: [],
      colors: [],
      priceMin: 0,
      priceMax: initialSelectedMax,
    });
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>{t("filter.title")}</Typography>

      {/* PRICE FILTER */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionTitle}>
          {t("filter.price") || "Price"}
        </Typography>
        <Box className={classes.priceInputs}>
          <TextField
            type="text"
            size="small"
            label={t("filter.minPrice") || "Min"}
            value={localMinInput}
            onFocus={() => setLocalMinInput("")}
            onChange={(e) => setLocalMinInput(e.target.value)}
            onBlur={commitMinFromInput}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0 }}
            sx={{ flex: 1 }}
          />
          <TextField
            type="text"
            size="small"
            label={t("filter.maxPrice") || "Max"}
            value={localMaxInput}
            onFocus={() => setLocalMaxInput("")}
            onChange={(e) => setLocalMaxInput(e.target.value)}
            onBlur={commitMaxFromInput}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              max: maxPrice,
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        <Slider
          getAriaLabel={() => "Price range"}
          value={[filters.priceMin, filters.priceMax]}
          onChange={onSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={maxPrice}
          step={100}
        />
      </Box>

      {/* SIZE FILTER */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionTitle}>
          {t("filter.size")}
        </Typography>
        <FormGroup className={classes.checkboxGroup}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSizesSelected}
                onChange={(e) => toggleAllSizes(e.target.checked)}
              />
            }
            label={t("filter.selectAll")}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
              gap: "5px",
            }}
          >
            {availableSizes.map((size) => (
              <FormControlLabel
                key={size}
                control={
                  <Checkbox
                    checked={filters.sizes.includes(size)}
                    onChange={() => onSizeCheckboxChange(size)}
                  />
                }
                label={size}
              />
            ))}
          </Box>
        </FormGroup>
      </Box>

      {/* COLOR FILTER */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionTitle}>
          {t("filter.color") || "Color"}
        </Typography>
        <FormGroup className={classes.checkboxGroup}>
          {availableColors.map((color) => (
            <FormControlLabel
              key={color}
              control={
                <Checkbox
                  checked={filters.colors.includes(color)}
                  onChange={() => onColorCheckboxChange(color)}
                />
              }
              label={t(getColorKey(color)) || color}
            />
          ))}
        </FormGroup>
      </Box>

      {/* GENDER FILTER */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionTitle}>
          {t("filter.gender")}
        </Typography>
        <FormGroup className={classes.checkboxGroup}>
          {AVAILABLE_GENDERS.map((gender) => (
            <FormControlLabel
              key={gender}
              control={
                <Checkbox
                  checked={filters.gender.includes(gender)}
                  onChange={() => onGenderChange(gender)}
                />
              }
              label={t(`filter.genderOptions.${gender}`)}
            />
          ))}
        </FormGroup>
      </Box>

      {/* ACTION BUTTONS */}
      <Box className={classes.actionButtons}>
        <Button variant="outlined" onClick={onClearFilters} fullWidth>
          {t("filter.clear")}
        </Button>
      </Box>
    </Root>
  );
}
