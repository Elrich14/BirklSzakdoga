"use client";

import { useState } from "react";
import { styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Collapse, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { fetchMyOrders, AdminOrder } from "@/api";
import OrderStatusTracker from "../../components/orderStatusTracker";

const PREFIX = "MyOrdersTab";
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

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "700px",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "24px",
    color: (theme.vars || theme).palette.kerian.main,
  },
  [`& .${classes.empty}`]: {
    fontFamily: "monospace",
    fontSize: "16px",
    opacity: 0.6,
    textAlign: "center",
    padding: "48px 0",
    color: theme.palette.text.primary,
  },
  [`& .${classes.orderCard}`]: {
    borderRadius: "12px",
    border: `1px solid ${theme.palette.admin.border}`,
    backgroundColor: (theme.vars || theme).palette.background.paper,
    overflow: "hidden",
  },
  [`& .${classes.orderHeader}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    cursor: "pointer",
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
    color: theme.palette.kerian.main,
  },
  [`& .${classes.orderMeta}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: (theme.vars || theme).palette.text.secondary,
  },
  [`& .${classes.expandButton}`]: {
    color: (theme.vars || theme).palette.admin.textLight,
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
    backgroundColor: (theme.vars || theme).palette.kerian.overlayHoverLight,
    border: `1px solid ${theme.palette.admin.border}`,
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
    color: (theme.vars || theme).palette.text.primary,
  },
  [`& .${classes.itemValue}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: (theme.vars || theme).palette.text.secondary,
  },
}));

export default function MyOrdersTab() {
  const { t } = useTranslation();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["myOrders"],
    queryFn: fetchMyOrders,
  });

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
