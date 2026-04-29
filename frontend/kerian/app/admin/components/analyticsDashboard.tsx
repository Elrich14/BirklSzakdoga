"use client";

import { styled } from "@mui/material";
import { Box } from "@mui/material";
import DashboardCards from "./dashboardCards";
import OrdersChart from "./ordersChart";
import ProductSellRating from "./productSellRating";

const PREFIX = "AnalyticsDashboard";
const classes = {
  root: `${PREFIX}-root`,
  section: `${PREFIX}-section`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  [`& .${classes.section}`]: {
    backgroundColor: theme.vars?.palette.admin.surface,
    borderRadius: "12px",
    padding: "24px",
  },
}));

export default function AnalyticsDashboard() {
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
