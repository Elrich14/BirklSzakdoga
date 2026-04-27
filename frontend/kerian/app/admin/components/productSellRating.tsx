"use client";

import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchAdminProducts, fetchProductStats } from "@/api";
import { STATS_RANGES, StatsRange } from "@/constants/constants";

const PREFIX = "ProductSellRating";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  controls: `${PREFIX}-controls`,
  productSelect: `${PREFIX}-productSelect`,
  chartWrapper: `${PREFIX}-chartWrapper`,
  noData: `${PREFIX}-noData`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  [`& .${classes.controls}`]: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  [`& .${classes.productSelect}`]: {
    minWidth: "220px",
  },
  [`& .${classes.chartWrapper}`]: {
    display: "flex",
    justifyContent: "center",
  },
  [`& .${classes.noData}`]: {
    textAlign: "center",
    color: theme.vars?.palette.admin.textMuted,
    padding: "40px 0",
  },
}));

export default function ProductSellRating() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [range, setRange] = useState<StatsRange>("month");

  const { data: products = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: fetchAdminProducts,
  });

  const { data: stats = [] } = useQuery({
    queryKey: ["productStats", selectedProductId, range],
    queryFn: () => fetchProductStats(selectedProductId as number, range),
    enabled: selectedProductId !== "",
  });

  const onProductChange = (event: SelectChangeEvent<number | "">) => {
    setSelectedProductId(event.target.value as number | "");
  };

  const onRangeChange = (
    _: React.MouseEvent<HTMLElement>,
    newRange: StatsRange | null
  ) => {
    if (newRange) setRange(newRange);
  };

  const chartData = useMemo(() => [...stats].reverse(), [stats]);

  return (
    <Root className={classes.root}>
      <Typography variant="h6">{t("admin.productStats.title")}</Typography>

      <Box className={classes.controls}>
        <FormControl size="small" className={classes.productSelect}>
          <InputLabel>{t("admin.productStats.selectProduct")}</InputLabel>
          <Select
            value={selectedProductId}
            onChange={onProductChange}
            label={t("admin.productStats.selectProduct")}
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={onRangeChange}
          size="small"
        >
          {STATS_RANGES.map((rangeOption) => (
            <ToggleButton key={rangeOption} value={rangeOption}>
              {t(`admin.orders.range.${rangeOption}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {selectedProductId === "" ? (
        <Typography className={classes.noData}>
          {t("admin.productStats.selectProduct")}
        </Typography>
      ) : stats.length === 0 ? (
        <Typography className={classes.noData}>
          {t("admin.productStats.noData")}
        </Typography>
      ) : (
        <Box className={classes.chartWrapper}>
          <ResponsiveContainer width="50%" height={350}>
            <BarChart
              data={chartData}
              barSize={53}
              barGap={45}
              barCategoryGap="80%"
              margin={{ left: 40, right: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.vars?.palette.admin.border}
              />
              <XAxis
                dataKey="label"
                stroke={theme.vars?.palette.admin.textMuted}
                padding={{ left: 40, right: 40 }}
              />
              <YAxis
                yAxisId="left"
                stroke={theme.vars?.palette.admin.textMuted}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={theme.vars?.palette.admin.textMuted}
                width={40}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: theme.vars?.palette.admin.input,
                  border: `1px solid ${theme.vars?.palette.admin.borderLight}`,
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="quantity"
                name={t("admin.productStats.quantity")}
                fill={theme.vars?.palette.kerian.main}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                name={t("admin.productStats.revenue")}
                fill={theme.vars?.palette.admin.accentPurple}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Root>
  );
}
