"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Collapse, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { fetchMyOrders, AdminOrder } from "@/api";
import { colors } from "@/constants/colors";
import { getUserRole } from "../utils/auth";
import OrderStatusTracker from "../components/orderStatusTracker";

const PREFIX = "MyOrders";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  empty: `${PREFIX}-empty`,
  orderCard: `${PREFIX}-orderCard`,
  orderHeader: `${PREFIX}-orderHeader`,
  orderInfo: `${PREFIX}-orderInfo`,
  orderId: `${PREFIX}-orderId`,
  orderMeta: `${PREFIX}-orderMeta`,
  expandButton: `${PREFIX}-expandButton`,
  orderDetails: `${PREFIX}-orderDetails`,
  itemsTable: `${PREFIX}-itemsTable`,
  itemRow: `${PREFIX}-itemRow`,
  itemLabel: `${PREFIX}-itemLabel`,
  itemValue: `${PREFIX}-itemValue`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "700px",
    margin: "0 auto",
    padding: "32px 16px",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "24px",
  },
  [`& .${classes.empty}`]: {
    fontFamily: "monospace",
    fontSize: "16px",
    opacity: 0.6,
    textAlign: "center",
    padding: "48px 0",
  },
  [`& .${classes.orderCard}`]: {
    borderRadius: "12px",
    border: `1px solid ${colors.admin_border}`,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    overflow: "hidden",
  },
  [`& .${classes.orderHeader}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
  },
  [`& .${classes.orderInfo}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  [`& .${classes.orderId}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "16px",
    color: colors.kerian_main,
  },
  [`& .${classes.orderMeta}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.6,
  },
  [`& .${classes.expandButton}`]: {
    color: colors.admin_text_light,
  },
  [`& .${classes.orderDetails}`]: {
    padding: "0 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  [`& .${classes.itemsTable}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${colors.admin_border}`,
  },
  [`& .${classes.itemRow}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "monospace",
    fontSize: "13px",
  },
  [`& .${classes.itemLabel}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.85,
  },
  [`& .${classes.itemValue}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.6,
  },
}));

export default function MyOrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (getUserRole() === "guest") {
      router.push("/login");
    }
  }, [router]);

  const { data: orders = [] } = useQuery({
    queryKey: ["myOrders"],
    queryFn: fetchMyOrders,
    enabled: getUserRole() !== "guest",
  });

  if (getUserRole() === "guest") {
    return null;
  }

  const onToggleOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>{t("myOrders.title")}</Typography>

      {orders.length === 0 ? (
        <Typography className={classes.empty}>{t("myOrders.empty")}</Typography>
      ) : (
        orders.map((order: AdminOrder) => (
          <Box key={order.id} className={classes.orderCard}>
            <Box
              className={classes.orderHeader}
              onClick={() => onToggleOrder(order.id)}
            >
              <Box className={classes.orderInfo}>
                <Typography className={classes.orderId}>#{order.id}</Typography>
                <Typography className={classes.orderMeta}>
                  {t("myOrders.orderDate", {
                    date: formatDate(order.createdAt),
                  })}
                  {" — "}
                  {t("myOrders.total", { total: order.totalPrice })}
                  {" — "}
                  {t("myOrders.items", { count: order.items.length })}
                </Typography>
              </Box>
              <IconButton className={classes.expandButton}>
                {expandedOrderId === order.id ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </IconButton>
            </Box>

            <Collapse
              in={expandedOrderId === order.id}
              timeout="auto"
              unmountOnExit
            >
              <Box className={classes.orderDetails}>
                <Box className={classes.itemsTable}>
                  {order.items.map((item) => (
                    <Box key={item.id} className={classes.itemRow}>
                      <Typography className={classes.itemLabel}>
                        {item.productName}
                        {item.size ? ` / ${item.size}` : ""}
                        {item.color ? ` / ${item.color}` : ""}
                        {item.gender ? ` / ${item.gender}` : ""}
                      </Typography>
                      <Typography className={classes.itemValue}>
                        {item.quantity} x {item.productPrice} Ft
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <OrderStatusTracker
                  orderId={order.id}
                  initialStatus={order.status}
                />
              </Box>
            </Collapse>
          </Box>
        ))
      )}
    </Root>
  );
}
