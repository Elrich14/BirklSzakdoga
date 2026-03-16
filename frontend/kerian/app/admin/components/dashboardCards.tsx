"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, CircularProgress } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import { fetchDashboardStats } from "@/api";
import { colors } from "@/constants/colors";

const PREFIX = "DashboardCards";
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  iconWrapper: `${PREFIX}-iconWrapper`,
  loadingWrapper: `${PREFIX}-loadingWrapper`,
  spinner: `${PREFIX}-spinner`,
  cardLabel: `${PREFIX}-cardLabel`,
  cardValue: `${PREFIX}-cardValue`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  [`& .${classes.card}`]: {
    backgroundColor: colors.admin_surface,
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  [`& .${classes.iconWrapper}`]: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.kerian_main}22`,
    color: colors.kerian_main,
    flexShrink: 0,
  },
}));

const LoadingWrapper = styled(Box)(() => ({
  [`&.${classes.loadingWrapper}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "32px",
    paddingBottom: "32px",
  },
  [`& .${classes.spinner}`]: {
    color: colors.kerian_main,
  },
}));

const CardLabel = styled(Typography)(() => ({
  [`&.${classes.cardLabel}`]: {
    color: colors.admin_text_secondary,
  },
}));

const CardValue = styled(Typography)(() => ({
  [`&.${classes.cardValue}`]: {
    fontWeight: 700,
  },
}));

const CARDS = [
  { key: "totalRevenue", icon: AttachMoneyIcon, format: "currency" },
  { key: "ordersToday", icon: ShoppingCartIcon, format: "number" },
  { key: "totalProducts", icon: InventoryIcon, format: "number" },
  { key: "totalCustomers", icon: PeopleIcon, format: "number" },
] as const;

export default function DashboardCards() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const formatValue = (value: number, format: string) => {
    if (format === "currency") {
      return `${value.toLocaleString()} Ft`;
    }
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <LoadingWrapper className={classes.loadingWrapper}>
        <CircularProgress className={classes.spinner} />
      </LoadingWrapper>
    );
  }

  return (
    <Root className={classes.root}>
      {CARDS.map(({ key, icon: Icon, format }) => (
        <Box key={key} className={classes.card}>
          <Box className={classes.iconWrapper}>
            <Icon />
          </Box>
          <Box>
            <CardLabel variant="body2" className={classes.cardLabel}>
              {t(`admin.dashboard.${key}`)}
            </CardLabel>
            <CardValue variant="h5" className={classes.cardValue}>
              {data ? formatValue(data[key], format) : "—"}
            </CardValue>
          </Box>
        </Box>
      ))}
    </Root>
  );
}
