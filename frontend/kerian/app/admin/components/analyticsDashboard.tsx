"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { colors } from "@/constants/colors";
import DashboardCards from "./dashboardCards";
import OrdersChart from "./ordersChart";
import ProductSellRating from "./productSellRating";

const PREFIX = "AnalyticsDashboard";
const classes = {
  root: `${PREFIX}-root`,
  section: `${PREFIX}-section`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  [`& .${classes.section}`]: {
    backgroundColor: colors.admin_surface,
    borderRadius: "12px",
    padding: "24px",
  },
}));

export default function AnalyticsDashboard() {
  const { t } = useTranslation();

  return (
    <Root className={classes.root}>
      <DashboardCards />
      <Box className={classes.section}>
        <OrdersChart />
      </Box>
      <Box className={classes.section}>
        <ProductSellRating />
      </Box>
    </Root>
  );
}
