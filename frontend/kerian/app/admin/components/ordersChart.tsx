"use client";

import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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
import { fetchOrderStats } from "@/api";
import { STATS_RANGES, StatsRange } from "@/constants/constants";

const PREFIX = "OrdersChart";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
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
  [`& .${classes.chartWrapper}`]: {
    display: "flex",
    justifyContent: "center",
  },
  [`& .${classes.noData}`]: {
    textAlign: "center",
    color: theme.palette.admin.textMuted,
    padding: "40px 0",
  },
}));

export default function OrdersChart() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [range, setRange] = useState<StatsRange>("month");

  const { data: stats = [] } = useQuery({
    queryKey: ["orderStats", range],
    queryFn: () => fetchOrderStats(range),
  });

  const onRangeChange = (
    _: React.MouseEvent<HTMLElement>,
    newRange: StatsRange | null
  ) => {
    if (newRange) setRange(newRange);
  };

  const chartData = useMemo(() => [...stats].reverse(), [stats]);

  return (
    <Root className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h6">{t("admin.orders.title")}</Typography>
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

      {stats.length === 0 ? (
        <Typography className={classes.noData}>
          {t("admin.orders.noData")}
        </Typography>
      ) : (
        <Box className={classes.chartWrapper}>
        <ResponsiveContainer width="50%" height={350}>
          <BarChart data={chartData} barSize={53} barGap={45} barCategoryGap="80%" margin={{ left: 40, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.admin.border} />
            <XAxis dataKey="label" stroke={theme.palette.admin.textMuted} padding={{ left: 40, right: 40 }} />
            <YAxis yAxisId="left" stroke={theme.palette.admin.textMuted} width={40} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.palette.admin.textMuted} width={40} />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: theme.palette.admin.input,
                border: `1px solid ${theme.palette.admin.borderLight}`,
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="orderCount"
              name={t("admin.orders.count")}
              fill={theme.palette.kerian.main}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="income"
              name={t("admin.orders.income")}
              fill={theme.palette.admin.accentPurple}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        </Box>
      )}
    </Root>
  );
}
