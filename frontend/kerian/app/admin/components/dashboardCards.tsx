"use client";

import { styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, CircularProgress } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import { fetchDashboardStats } from "@/api";

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

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  [`& .${classes.card}`]: {
    backgroundColor: theme.vars?.palette.admin.surface,
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "360px",
      marginInline: "auto",
      justifyContent: "center",
    },
  },
  [`& .${classes.iconWrapper}`]: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.vars?.palette.kerian.bg,
    color: theme.vars?.palette.kerian.main,
    flexShrink: 0,
  },
}));

const LoadingWrapper = styled(Box)(({ theme }) => ({
  [`&.${classes.loadingWrapper}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "32px",
    paddingBottom: "32px",
  },
  [`& .${classes.spinner}`]: {
    color: theme.vars?.palette.kerian.main,
  },
}));

const CardLabel = styled(Typography)(({ theme }) => ({
  [`&.${classes.cardLabel}`]: {
    color: theme.vars?.palette.admin.textSecondary,
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
