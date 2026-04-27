"use client";

import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CancelIcon from "@mui/icons-material/Cancel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { fetchOrderStatus } from "@/api";
import {
  DELIVERY_STEPS,
  ORDER_STATUS_POLL_INTERVAL_MS,
  OrderStatus,
} from "@/constants/constants";
import { colors } from "@/constants/colors";

interface Props {
  orderId: number;
  initialStatus: OrderStatus;
}

const PREFIX = "OrderStatusTracker";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  stepper: `${PREFIX}-stepper`,
  step: `${PREFIX}-step`,
  connector: `${PREFIX}-connector`,
  iconWrapper: `${PREFIX}-iconWrapper`,
  completedIcon: `${PREFIX}-completedIcon`,
  activeIcon: `${PREFIX}-activeIcon`,
  pendingIcon: `${PREFIX}-pendingIcon`,
  cancelledIcon: `${PREFIX}-cancelledIcon`,
  stepContent: `${PREFIX}-stepContent`,
  stepLabel: `${PREFIX}-stepLabel`,
  stepDescription: `${PREFIX}-stepDescription`,
  loadingBox: `${PREFIX}-loadingBox`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "18px",
    color: colors.snackbar_success,
    marginBottom: "8px",
  },
  [`& .${classes.stepper}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.step}`]: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    position: "relative",
  },
  [`& .${classes.connector}`]: {
    width: "2px",
    minHeight: "24px",
    marginLeft: "11px",
    backgroundColor: theme.vars?.palette.admin.border,
  },
  [`& .${classes.iconWrapper}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "24px",
    height: "24px",
  },
  [`& .${classes.completedIcon}`]: {
    color: colors.snackbar_success,
    fontSize: "24px",
  },
  [`& .${classes.activeIcon}`]: {
    color: theme.vars?.palette.kerian.main,
    fontSize: "24px",
    animation: "pulse 1.5s ease-in-out infinite",
    "@keyframes pulse": {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
  },
  [`& .${classes.pendingIcon}`]: {
    color: theme.vars?.palette.admin.borderLight,
    fontSize: "16px",
  },
  [`& .${classes.cancelledIcon}`]: {
    color: theme.vars?.palette.error.main,
    fontSize: "24px",
  },
  [`& .${classes.stepContent}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingBottom: "4px",
  },
  [`& .${classes.stepLabel}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "15px",
  },
  [`& .${classes.stepDescription}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.7,
  },
  [`& .${classes.loadingBox}`]: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
  },
}));

const OrderStatusTracker = ({ orderId, initialStatus }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data } = useQuery({
    queryKey: ["orderStatus", orderId],
    queryFn: () => fetchOrderStatus(orderId),
    initialData: {
      orderId,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      if (currentStatus === "delivered" || currentStatus === "cancelled") {
        return false;
      }
      return ORDER_STATUS_POLL_INTERVAL_MS;
    },
  });

  const currentStatus = data?.status ?? initialStatus;
  const isCancelled = currentStatus === "cancelled";

  const currentStepIndex = DELIVERY_STEPS.indexOf(currentStatus);

  const isDelivered = currentStatus === "delivered";

  const getStepState = (
    stepIndex: number
  ): "completed" | "active" | "pending" => {
    if (isCancelled) return "pending";
    if (isDelivered)
      return stepIndex <= currentStepIndex ? "completed" : "pending";
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";
    return "pending";
  };

  const renderStepIcon = (state: "completed" | "active" | "pending") => {
    if (state === "completed") {
      return <CheckCircleIcon className={classes.completedIcon} />;
    }
    if (state === "active") {
      return <FiberManualRecordIcon className={classes.activeIcon} />;
    }
    return <RadioButtonUncheckedIcon className={classes.pendingIcon} />;
  };

  const getConnectorColor = (stepIndex: number): string => {
    if (isCancelled) return theme.vars?.palette.admin.border;
    if (stepIndex < currentStepIndex) return colors.snackbar_success;
    return theme.vars?.palette.admin.border;
  };

  const getLabelOpacity = (state: "completed" | "active" | "pending") => {
    if (state === "active") return 1;
    if (state === "completed") return 0.85;
    return 0.4;
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("orderStatus.title", { orderId })}
      </Typography>

      <Box className={classes.stepper}>
        {DELIVERY_STEPS.map((step, stepIndex) => {
          const state = getStepState(stepIndex);
          const isLast = stepIndex === DELIVERY_STEPS.length - 1;

          return (
            <Box key={step}>
              <Box className={classes.step}>
                <Box className={classes.iconWrapper}>
                  {renderStepIcon(state)}
                </Box>
                <Box
                  className={classes.stepContent}
                  style={{ opacity: getLabelOpacity(state) }}
                >
                  <Typography className={classes.stepLabel}>
                    {t(`orderStatus.${step}`)}
                  </Typography>
                  <Typography className={classes.stepDescription}>
                    {t(`orderStatus.${step}Description`)}
                  </Typography>
                </Box>
              </Box>
              {!isLast && (
                <Box
                  className={classes.connector}
                  style={{
                    backgroundColor: getConnectorColor(stepIndex),
                  }}
                />
              )}
            </Box>
          );
        })}

        {isCancelled && (
          <>
            <Box
              className={classes.connector}
              style={{ backgroundColor: theme.vars?.palette.error.main }}
            />
            <Box className={classes.step}>
              <Box className={classes.iconWrapper}>
                <CancelIcon className={classes.cancelledIcon} />
              </Box>
              <Box className={classes.stepContent}>
                <Typography
                  className={classes.stepLabel}
                  style={{ color: theme.vars?.palette.error.main }}
                >
                  {t("orderStatus.cancelled")}
                </Typography>
                <Typography className={classes.stepDescription}>
                  {t("orderStatus.cancelledDescription")}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Root>
  );
};

export default OrderStatusTracker;
