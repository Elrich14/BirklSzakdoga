"use client";

import { styled } from "@mui/system";
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
import { colors } from "@/constants/colors";
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
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.table}`]: {
    backgroundColor: colors.admin_surface,
    borderRadius: "12px",
    "& .MuiTableCell-root": {
      borderColor: colors.admin_border,
    },
  },
  [`& .${classes.statusSelect}`]: {
    minWidth: "140px",
    "& .MuiSelect-select": {
      padding: "8px 12px",
      fontSize: "14px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.admin_border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.admin_border_light,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.kerian_main,
    },
  },
  [`& .${classes.itemsTable}`]: {
    backgroundColor: colors.admin_input,
    borderRadius: "8px",
    marginBottom: "8px",
    "& .MuiTableCell-root": {
      borderColor: colors.admin_border,
      fontSize: "13px",
      color: colors.admin_text_light,
    },
  },
  [`& .${classes.expandCell}`]: {
    width: "48px",
    padding: "4px",
  },
  [`& .${classes.noOrders}`]: {
    textAlign: "center",
    padding: "48px",
    color: colors.admin_text_muted,
  },
  [`& .${classes.loadingMore}`]: {
    display: "flex",
    justifyContent: "center",
    padding: "16px",
  },
}));

const StyledDialog = styled(Dialog)(() => ({
  [`& .${classes.confirmDialogPaper}`]: {
    backgroundColor: colors.admin_surface,
    color: colors.white,
  },
  [`& .${classes.confirmActions}`]: {
    padding: "8px 24px 16px",
  },
  [`& .${classes.confirmButton}`]: {
    backgroundColor: colors.kerian_main,
    color: colors.white,
    "&:hover": {
      backgroundColor: colors.kerian_main,
      opacity: 0.85,
    },
  },
  [`& .${classes.cancelButton}`]: {
    color: colors.admin_text_light,
  },
}));

const OrderManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
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

// Extracted row component to keep the main table clean
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
                color={colors.admin_text_light}
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

export default OrderManagement;
