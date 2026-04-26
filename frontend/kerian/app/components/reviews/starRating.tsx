"use client";

import { Box, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "small" | "medium" | "large";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const PREFIX = "StarRating";

const classes = {
  root: `${PREFIX}-root`,
  star: `${PREFIX}-star`,
  starButton: `${PREFIX}-starButton`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
  },
  [`& .${classes.star}`]: {
    color: theme.palette.kerian.main,
  },
  [`& .${classes.starButton}`]: {
    padding: "2px",
    color: theme.palette.kerian.main,
  },
}));

const StarRating = ({
  value,
  max = 5,
  size = "medium",
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const onStarClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };

  const stars = [];
  for (let position = 1; position <= max; position += 1) {
    const isFilled = position <= value;

    if (interactive) {
      stars.push(
        <IconButton
          key={position}
          className={classes.starButton}
          size={size}
          onClick={(event) => {
            event.stopPropagation();
            onStarClick(position);
          }}
          aria-label={`Rate ${position} stars`}
        >
          {isFilled ? (
            <StarIcon fontSize={size} />
          ) : (
            <StarBorderIcon fontSize={size} />
          )}
        </IconButton>
      );
    } else if (isFilled) {
      stars.push(
        <StarIcon
          key={position}
          className={classes.star}
          fontSize={size}
        />
      );
    } else {
      stars.push(
        <StarBorderIcon
          key={position}
          className={classes.star}
          fontSize={size}
        />
      );
    }
  }

  return <Root className={classes.root}>{stars}</Root>;
};

export default StarRating;
