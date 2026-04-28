"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  TextField,
  Tooltip,
  CircularProgress,
  Divider,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  fetchProductReviews,
  canReviewProduct,
  createReview,
  deleteReview,
  Review,
  CanReviewReason,
} from "@/api";
import { getUserRole, getCurrentUserId } from "../../utils/auth";
import { useSnackbar } from "../../providers/snackbarProvider";
import StarRating from "./starRating";

interface ReviewsPopupProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const PREFIX = "ReviewsPopup";

const classes = {
  root: `${PREFIX}-root`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  closeButton: `${PREFIX}-closeButton`,
  header: `${PREFIX}-header`,
  averageRow: `${PREFIX}-averageRow`,
  averageNumber: `${PREFIX}-averageNumber`,
  reviewCount: `${PREFIX}-reviewCount`,
  formBox: `${PREFIX}-formBox`,
  formTitle: `${PREFIX}-formTitle`,
  formActions: `${PREFIX}-formActions`,
  submitButton: `${PREFIX}-submitButton`,
  commentField: `${PREFIX}-commentField`,
  reviewList: `${PREFIX}-reviewList`,
  reviewItem: `${PREFIX}-reviewItem`,
  reviewHeader: `${PREFIX}-reviewHeader`,
  reviewLeft: `${PREFIX}-reviewLeft`,
  reviewRight: `${PREFIX}-reviewRight`,
  reviewAuthor: `${PREFIX}-reviewAuthor`,
  reviewDate: `${PREFIX}-reviewDate`,
  reviewComment: `${PREFIX}-reviewComment`,
  emptyState: `${PREFIX}-emptyState`,
  loadingBox: `${PREFIX}-loadingBox`,
  divider: `${PREFIX}-divider`,
  reasonAlert: `${PREFIX}-reasonAlert`,
  ratingLabel: `${PREFIX}-ratingLabel`,
};

const Root = styled(Dialog)(({ theme }) => ({
  [`& .MuiDialog-paper`]: {
    maxWidth: "650px",
    width: "100%",
    maxHeight: "calc(100vh - 60px)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.vars?.palette.background.paper,
    [theme.breakpoints.up("md")]: {
      minWidth: "500px",
    },
  },
  [`& .${classes.dialogTitle}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "18px",
  },
  [`& .${classes.closeButton}`]: {
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.header}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  [`& .${classes.averageRow}`]: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  [`& .${classes.averageNumber}`]: {
    fontFamily: "monospace",
    fontSize: "32px",
    fontWeight: "bold",
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.reviewCount}`]: {
    fontFamily: "monospace",
    fontSize: "14px",
    opacity: 0.7,
  },
  [`& .${classes.formBox}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    border: `1px solid ${theme.vars?.palette.kerian.main}`,
    marginBottom: "16px",
  },
  [`& .${classes.formTitle}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "16px",
  },
  [`& .${classes.ratingLabel}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "4px",
  },
  [`& .${classes.formActions}`]: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  [`& .${classes.submitButton}`]: {
    fontFamily: "monospace",
    backgroundColor: theme.vars?.palette.kerian.main,
    color: "#ffffff",
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.vars?.palette.kerian.main,
      opacity: 0.85,
    },
    "&.Mui-disabled": {
      backgroundColor: theme.vars?.palette.kerian.bg,
      color: "#ffffff",
    },
  },
  [`& .${classes.commentField}`]: {
    "& .MuiOutlinedInput-root": {
      fontFamily: "monospace",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.vars?.palette.kerian.overlayHoverLight,
    },
  },
  [`& .${classes.reviewList}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  [`& .${classes.reviewItem}`]: {
    padding: "12px",
    borderRadius: "6px",
    backgroundColor: theme.vars?.palette.kerian.overlayHoverLight,
  },
  [`& .${classes.reviewHeader}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.reviewLeft}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  [`& .${classes.reviewRight}`]: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  [`& .${classes.reviewAuthor}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "14px",
  },
  [`& .${classes.reviewDate}`]: {
    fontFamily: "monospace",
    fontSize: "12px",
    opacity: 0.6,
  },
  [`& .${classes.reviewComment}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    marginTop: "6px",
    whiteSpace: "pre-wrap",
  },
  [`& .${classes.emptyState}`]: {
    fontFamily: "monospace",
    fontStyle: "italic",
    opacity: 0.6,
    textAlign: "center",
    padding: "24px 0",
  },
  [`& .${classes.loadingBox}`]: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
  },
  [`& .${classes.divider}`]: {
    marginTop: "12px",
    marginBottom: "12px",
    borderColor: theme.vars?.palette.kerian.overlayHoverLight,
  },
  [`& .${classes.reasonAlert}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    marginBottom: "16px",
    backgroundColor: theme.vars?.palette.kerian.bg,
    color: theme.vars?.palette.kerian.main,
    "& .MuiAlert-icon": {
      color: theme.vars?.palette.kerian.main,
    },
  },
}));

const REASON_TRANSLATION_KEYS: Record<
  Exclude<CanReviewReason, null>,
  string
> = {
  "not-purchased": "reviews.reason.notPurchased",
  "not-delivered": "reviews.reason.notDelivered",
  "already-reviewed": "reviews.reason.alreadyReviewed",
};

const ReviewsPopup = ({
  open,
  onClose,
  productId,
  productName,
}: ReviewsPopupProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const userRole = getUserRole();
  const currentUserId = getCurrentUserId();
  const isLoggedIn = userRole === "user" || userRole === "admin";

  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: open,
  });

  const eligibilityQuery = useQuery({
    queryKey: ["can-review", productId],
    queryFn: () => canReviewProduct(productId),
    enabled: open && isLoggedIn,
  });

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", productId] });
      setSelectedRating(0);
      setComment("");
      showSnackbar(t("reviews.snackbar.created"), "success");
    },
    onError: (error: Error) => {
      showSnackbar(error.message || t("reviews.snackbar.createError"), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", productId] });
      showSnackbar(t("reviews.snackbar.deleted"), "success");
    },
    onError: (error: Error) => {
      showSnackbar(error.message || t("reviews.snackbar.deleteError"), "error");
    },
  });

  const reviews: Review[] = reviewsQuery.data || [];

  let averageRating = 0;
  if (reviews.length > 0) {
    let total = 0;
    for (const review of reviews) {
      total += review.rating;
    }
    averageRating = total / reviews.length;
  }

  const onSubmit = () => {
    if (selectedRating < 1) {
      showSnackbar(t("reviews.validation.ratingRequired"), "warning");
      return;
    }
    createMutation.mutate({
      productId,
      rating: selectedRating,
      comment: comment.trim() || undefined,
    });
  };

  const onDelete = (reviewId: number) => {
    if (window.confirm(t("reviews.deleteConfirm"))) {
      deleteMutation.mutate(reviewId);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const canShowForm = isLoggedIn && eligibilityQuery.data?.canReview === true;

  const renderEligibilityAlert = () => {
    if (!isLoggedIn) {
      return (
        <Alert severity="info" className={classes.reasonAlert}>
          {t("reviews.loginToReview")}
        </Alert>
      );
    }
    if (!eligibilityQuery.data || eligibilityQuery.data.canReview) {
      return null;
    }
    const reasonKey = eligibilityQuery.data.reason
      ? REASON_TRANSLATION_KEYS[eligibilityQuery.data.reason]
      : null;
    if (!reasonKey) return null;
    return (
      <Alert severity="info" className={classes.reasonAlert}>
        {t(reasonKey)}
      </Alert>
    );
  };

  return (
    <Root
      open={open}
      onClose={onClose}
      className={classes.root}
      fullScreen={isMobile}
    >
      <DialogTitle className={classes.dialogTitle}>
        <span>{t("reviews.title", { product: productName })}</span>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          aria-label={t("card.aria.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.header}>
          <Box className={classes.averageRow}>
            <Typography className={classes.averageNumber}>
              {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
            </Typography>
            <StarRating value={Math.round(averageRating)} size="medium" />
            <Typography className={classes.reviewCount}>
              {t("reviews.count", { count: reviews.length })}
            </Typography>
          </Box>
        </Box>

        {canShowForm ? (
          <Box className={classes.formBox}>
            <Typography className={classes.formTitle}>
              {t("reviews.writeReview")}
            </Typography>
            <Box>
              <Typography className={classes.ratingLabel}>
                {t("reviews.yourRating")}
              </Typography>
              <StarRating
                value={selectedRating}
                interactive
                onChange={setSelectedRating}
                size="large"
              />
            </Box>
            <TextField
              className={classes.commentField}
              multiline
              rows={3}
              fullWidth
              placeholder={t("reviews.commentPlaceholder")}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Box className={classes.formActions}>
              <Button
                className={classes.submitButton}
                onClick={onSubmit}
                disabled={createMutation.isPending}
              >
                {t("reviews.submit")}
              </Button>
            </Box>
          </Box>
        ) : (
          renderEligibilityAlert()
        )}

        <Divider className={classes.divider} />

        {reviewsQuery.isLoading ? (
          <Box className={classes.loadingBox}>
            <CircularProgress />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography className={classes.emptyState}>
            {t("reviews.noReviews")}
          </Typography>
        ) : (
          <Box className={classes.reviewList}>
            {reviews.map((review) => {
              const isOwner = review.userId === currentUserId;
              const isAdmin = userRole === "admin";
              const canDelete = isOwner || isAdmin;
              return (
                <Box key={review.id} className={classes.reviewItem}>
                  <Box className={classes.reviewHeader}>
                    <Box className={classes.reviewLeft}>
                      <Typography className={classes.reviewAuthor}>
                        {review.user?.username || t("reviews.anonymousUser")}
                      </Typography>
                      <StarRating value={review.rating} size="small" />
                    </Box>
                    <Box className={classes.reviewRight}>
                      <Typography className={classes.reviewDate}>
                        {formatDate(review.createdAt)}
                      </Typography>
                      {canDelete && (
                        <Tooltip title={t("reviews.deleteAction")}>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(review.id)}
                            aria-label={t("reviews.deleteAction")}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  {review.comment && (
                    <Typography className={classes.reviewComment}>
                      {review.comment}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Root>
  );
};

export default ReviewsPopup;
