"use client";

import { styled } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  fetchAdminOrders,
  updateOrderStatus,
  AdminOrder,
  AdminOrdersPage,
} from "@/api";
import { ORDER_STATUSES, OrderStatus } from "@/constants/constants";
import { useSnackbar } from "../../providers/snackbarProvider";

interface PendingStatusChange {
  orderId: number;
  status: OrderStatus;
}

const PREFIX = "OrderManagement";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  table: `${PREFIX}-table`,
  statusSelect: `${PREFIX}-statusSelect`,
  itemsTable: `${PREFIX}-itemsTable`,
  expandCell: `${PREFIX}-expandCell`,
  noOrders: `${PREFIX}-noOrders`,
  confirmDialogPaper: `${PREFIX}-confirmDialogPaper`,
  confirmActions: `${PREFIX}-confirmActions`,
  confirmButton: `${PREFIX}-confirmButton`,
  cancelButton: `${PREFIX}-cancelButton`,
  loadingMore: `${PREFIX}-loadingMore`,
  cardList: `${PREFIX}-cardList`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-cardHeader`,
  cardOrderId: `${PREFIX}-cardOrderId`,
  cardLine: `${PREFIX}-cardLine`,
  cardItemList: `${PREFIX}-cardItemList`,
  cardItem: `${PREFIX}-cardItem`,
  cardItemName: `${PREFIX}-cardItemName`,
  cardItemMeta: `${PREFIX}-cardItemMeta`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  [`& .${classes.table}`]: {
    backgroundColor: theme.vars?.palette.admin.surface,
    borderRadius: "12px",
    overflowX: "auto",
    maxWidth: "100%",
    "& .MuiTableCell-root": {
      borderColor: theme.vars?.palette.admin.border,
    },
  },
  [`& .${classes.statusSelect}`]: {
    minWidth: "140px",
    "& .MuiSelect-select": {
      padding: "8px 12px",
      fontSize: "14px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.vars?.palette.admin.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.vars?.palette.admin.borderLight,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.vars?.palette.kerian.main,
    },
  },
  [`& .${classes.itemsTable}`]: {
    backgroundColor: theme.vars?.palette.admin.input,
    borderRadius: "8px",
    marginBottom: "8px",
    overflowX: "auto",
    maxWidth: "100%",
    "& .MuiTableCell-root": {
      borderColor: theme.vars?.palette.admin.border,
      fontSize: "13px",
      color: theme.vars?.palette.admin.textLight,
    },
  },
  [`& .${classes.expandCell}`]: {
    width: "48px",
    padding: "4px",
  },
  [`& .${classes.noOrders}`]: {
    textAlign: "center",
    padding: "48px",
    color: theme.vars?.palette.admin.textMuted,
  },
  [`& .${classes.loadingMore}`]: {
    display: "flex",
    justifyContent: "center",
    padding: "16px",
  },
  [`& .${classes.cardList}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  [`& .${classes.card}`]: {
    backgroundColor: theme.vars?.palette.admin.surface,
    border: `1px solid ${theme.vars?.palette.admin.border}`,
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  [`& .${classes.cardHeader}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.cardOrderId}`]: {
    fontWeight: 600,
    fontSize: "15px",
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.cardLine}`]: {
    fontSize: "13px",
    color: theme.vars?.palette.admin.textLight,
    overflowWrap: "anywhere",
  },
  [`& .${classes.cardItemList}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "8px",
    borderTop: `1px solid ${theme.vars?.palette.admin.border}`,
  },
  [`& .${classes.cardItem}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  [`& .${classes.cardItemName}`]: {
    fontSize: "13px",
    fontWeight: 600,
    color: theme.vars?.palette.text.primary,
  },
  [`& .${classes.cardItemMeta}`]: {
    fontSize: "12px",
    color: theme.vars?.palette.admin.textLight,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.confirmDialogPaper}`]: {
    backgroundColor: theme.vars?.palette.admin.surface,
    color: theme.vars?.palette.text.primary,
  },
  [`& .${classes.confirmActions}`]: {
    padding: "8px 24px 16px",
  },
  [`& .${classes.confirmButton}`]: {
    backgroundColor: theme.vars?.palette.kerian.main,
    color: theme.vars?.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.vars?.palette.kerian.main,
      opacity: 0.85,
    },
  },
  [`& .${classes.cancelButton}`]: {
    color: theme.vars?.palette.admin.textLight,
  },
}));

const OrderManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["adminOrders"],
      queryFn: ({ pageParam }: { pageParam: number | null }) =>
        fetchAdminOrders(pageParam),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage: AdminOrdersPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    });

  const orders = useMemo(() => {
    if (!data) return [];
    const result: AdminOrder[] = [];
    for (const page of data.pages) {
      for (const order of page.orders) {
        result.push(order);
      }
    }
    return result;
  }, [data]);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onIntersect]);

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      setPendingChange(null);
      showSnackbar(t("admin.orderList.statusUpdated"), "success");
    },
    onError: () => {
      setPendingChange(null);
      showSnackbar(t("admin.orderList.statusUpdateError"), "error");
    },
  });

  const onStatusChange = (orderId: number, status: OrderStatus) => {
    setPendingChange({ orderId, status });
  };

  const onConfirmStatusChange = () => {
    if (pendingChange) {
      statusMutation.mutate(pendingChange);
    }
  };

  const onCancelStatusChange = () => {
    setPendingChange(null);
  };

  const onToggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h6">{t("admin.orderList.title")}</Typography>
      </Box>

      {orders.length === 0 ? (
        <Typography className={classes.noOrders}>
          {t("admin.orderList.noOrders")}
        </Typography>
      ) : isMobile ? (
        <Box className={classes.cardList}>
          {orders.map((order: AdminOrder) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrderId === order.id}
              onToggleExpand={onToggleExpand}
              onStatusChange={onStatusChange}
              formatDate={formatDate}
            />
          ))}
        </Box>
      ) : (
        <TableContainer className={classes.table}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.expandCell} />
                <TableCell>{t("admin.orderList.orderId")}</TableCell>
                <TableCell>{t("admin.orderList.customer")}</TableCell>
                <TableCell>{t("admin.orderList.email")}</TableCell>
                <TableCell>{t("admin.orderList.total")}</TableCell>
                <TableCell>{t("admin.orderList.status")}</TableCell>
                <TableCell>{t("admin.orderList.date")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: AdminOrder) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrderId === order.id}
                  onToggleExpand={onToggleExpand}
                  onStatusChange={onStatusChange}
                  formatDate={formatDate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <Box className={classes.loadingMore}>
          <CircularProgress size={28} />
        </Box>
      )}

      <StyledDialog
        open={!!pendingChange}
        onClose={onCancelStatusChange}
        slotProps={{ paper: { className: classes.confirmDialogPaper } }}
      >
        <DialogTitle>
          {pendingChange
            ? t("admin.orderList.statusConfirm", {
                orderId: pendingChange.orderId,
                status: t(`admin.orderList.statuses.${pendingChange.status}`),
              })
            : ""}
        </DialogTitle>
        <DialogActions className={classes.confirmActions}>
          <Button
            onClick={onCancelStatusChange}
            className={classes.cancelButton}
          >
            {t("admin.orderList.cancel")}
          </Button>
          <Button
            onClick={onConfirmStatusChange}
            className={classes.confirmButton}
            disabled={statusMutation.isPending}
          >
            {t("admin.orderList.confirm")}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Root>
  );
};

interface OrderRowProps {
  order: AdminOrder;
  isExpanded: boolean;
  onToggleExpand: (orderId: number) => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  formatDate: (dateString: string) => string;
}

const OrderRow = ({
  order,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  formatDate,
}: OrderRowProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <TableRow>
        <TableCell className={classes.expandCell}>
          <IconButton size="small" onClick={() => onToggleExpand(order.id)}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{order.id}</TableCell>
        <TableCell>{order.customerName}</TableCell>
        <TableCell>{order.customerEmail}</TableCell>
        <TableCell>{order.totalPrice} Ft</TableCell>
        <TableCell>
          <Select
            value={order.status}
            onChange={(event) =>
              onStatusChange(order.id, event.target.value as OrderStatus)
            }
            size="small"
            className={classes.statusSelect}
          >
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`admin.orderList.statuses.${status}`)}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box padding="16px">
              <Typography
                variant="subtitle2"
                gutterBottom
                color={theme.vars?.palette.admin.textLight}
              >
                {t("admin.orderList.items")}
              </Typography>
              <TableContainer className={classes.itemsTable}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("admin.products.name")}</TableCell>
                      <TableCell>{t("card.fit")}</TableCell>
                      <TableCell>{t("card.size")}</TableCell>
                      <TableCell>{t("card.color")}</TableCell>
                      <TableCell>{t("card.quantity")}</TableCell>
                      <TableCell>{t("admin.products.price")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.gender || "-"}</TableCell>
                        <TableCell>{item.size || "-"}</TableCell>
                        <TableCell>{item.color || "-"}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.productPrice * item.quantity} Ft
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrderCard = ({
  order,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  formatDate,
}: OrderRowProps) => {
  const { t } = useTranslation();

  return (
    <Box className={classes.card}>
      <Box className={classes.cardHeader}>
        <Typography className={classes.cardOrderId}>#{order.id}</Typography>
        <IconButton size="small" onClick={() => onToggleExpand(order.id)}>
          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>
      <Typography className={classes.cardLine}>{order.customerName}</Typography>
      <Typography className={classes.cardLine}>
        {order.customerEmail}
      </Typography>
      <Typography className={classes.cardLine}>
        {order.totalPrice} Ft · {formatDate(order.createdAt)}
      </Typography>
      <Select
        value={order.status}
        onChange={(event) =>
          onStatusChange(order.id, event.target.value as OrderStatus)
        }
        size="small"
        className={classes.statusSelect}
        fullWidth
      >
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {t(`admin.orderList.statuses.${status}`)}
          </MenuItem>
        ))}
      </Select>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box className={classes.cardItemList}>
          <Typography className={classes.cardLine}>
            {t("admin.orderList.items")}
          </Typography>
          {order.items.map((item) => (
            <Box key={item.id} className={classes.cardItem}>
              <Typography className={classes.cardItemName}>
                {item.productName}
              </Typography>
              <Typography className={classes.cardItemMeta}>
                {[item.gender, item.size, item.color]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </Typography>
              <Typography className={classes.cardItemMeta}>
                {item.quantity} × {item.productPrice} Ft ={" "}
                {item.productPrice * item.quantity} Ft
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default OrderManagement;
