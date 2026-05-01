"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { getOrderBySession, OrderWithItems } from "@/api";
import { useCartStore } from "../../components/store/cartStore";
import OrderStatusTracker from "../../components/orderStatusTracker";

const PREFIX = "OrderReturn";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  message: `${PREFIX}-message`,
  spinnerBox: `${PREFIX}-spinnerBox`,
  actionButton: `${PREFIX}-actionButton`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "40px 20px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "50px",
    borderRadius: "4px",
    boxShadow: theme.palette.kerian.shadowHover,
  },
  [`& .${classes.title}`]: {
    marginBottom: "8px",
  },
  [`& .${classes.message}`]: {
    textAlign: "center",
  },
  [`& .${classes.spinnerBox}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px 0",
  },
  [`& .${classes.actionButton}`]: {
    marginTop: "16px",
  },
}));

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

function OrderReturnInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError(t("payment.missingSession"));
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const fetched = await getOrderBySession(sessionId);
        if (cancelled) return;
        setOrder(fetched);

        if (fetched.paymentStatus === "pending" && pollCount < MAX_POLLS) {
          setTimeout(() => setPollCount((count) => count + 1), POLL_INTERVAL_MS);
        }
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "fetch failed";
        setError(message);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, pollCount, t]);

  useEffect(() => {
    if (order?.paymentStatus === "paid" && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [order?.paymentStatus, cartCleared, clearCart]);

  if (error) {
    return (
      <Root className={classes.root}>
        <Typography className={classes.title} variant="h5" color="error">
          {t("payment.failed")}
        </Typography>
        <Typography className={classes.message}>{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
          onClick={() => router.push("/cart")}
        >
          {t("payment.backToCart")}
        </Button>
      </Root>
    );
  }

  if (!order) {
    return (
      <Root className={classes.root}>
        <Box className={classes.spinnerBox}>
          <CircularProgress />
          <Typography>{t("payment.processing")}</Typography>
        </Box>
      </Root>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <Root className={classes.root}>
        <Typography className={classes.title} variant="h5" color="primary">
          {t("payment.success")}
        </Typography>
        <OrderStatusTracker
          orderId={order.id}
          initialStatus={order.status}
        />
      </Root>
    );
  }

  if (order.paymentStatus === "failed" || order.paymentStatus === "expired") {
    return (
      <Root className={classes.root}>
        <Typography className={classes.title} variant="h5" color="error">
          {order.paymentStatus === "expired"
            ? t("payment.expired")
            : t("payment.failed")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
          onClick={() => router.push("/cart")}
        >
          {t("payment.backToCart")}
        </Button>
      </Root>
    );
  }

  return (
    <Root className={classes.root}>
      <Box className={classes.spinnerBox}>
        <CircularProgress />
        <Typography>{t("payment.processing")}</Typography>
      </Box>
    </Root>
  );
}

export default function OrderReturnPage() {
  return (
    <Suspense fallback={null}>
      <OrderReturnInner />
    </Suspense>
  );
}
