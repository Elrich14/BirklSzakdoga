"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { fetchProductReviews } from "@/api";
import StarRating from "../reviews/starRating";
import ReviewsPopup from "../reviews/reviewsPopup";

interface RatingSummaryProps {
  productId: number;
  productName: string;
  isEnabled: boolean;
}

const PREFIX = "RatingSummary";

const classes = {
  root: `${PREFIX}-root`,
  average: `${PREFIX}-average`,
  count: `${PREFIX}-count`,
  viewLink: `${PREFIX}-viewLink`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 0",
    marginBottom: "10px",
    cursor: "pointer",
    width: "fit-content",
    "&:hover": {
      opacity: 0.85,
    },
  },
  [`& .${classes.average}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "15px",
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.count}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    opacity: 0.7,
  },
  [`& .${classes.viewLink}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: theme.vars?.palette.kerian.main,
    textDecoration: "underline",
  },
}));

const RatingSummary = ({
  productId,
  productName,
  isEnabled,
}: RatingSummaryProps) => {
  const { t } = useTranslation();
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: isEnabled,
  });

  const reviews = reviewsQuery.data ?? [];
  let averageRating = 0;
  if (reviews.length > 0) {
    let total = 0;
    for (const review of reviews) {
      total += review.rating;
    }
    averageRating = total / reviews.length;
  }

  return (
    <>
      <Root
        className={classes.root}
        onClick={(event) => {
          event.stopPropagation();
          setIsReviewsOpen(true);
        }}
      >
        <StarRating value={Math.round(averageRating)} size="small" />
        <Typography className={classes.average}>
          {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
        </Typography>
        <Typography className={classes.count}>
          {t("reviews.count", { count: reviews.length })}
        </Typography>
        <Typography className={classes.viewLink}>
          {t("reviews.viewReviews")}
        </Typography>
      </Root>
      <ReviewsPopup
        open={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        productId={productId}
        productName={productName}
      />
    </>
  );
};

export default RatingSummary;
