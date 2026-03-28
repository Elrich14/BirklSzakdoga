"use client";

import { Card, CardContent, styled } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

const PREFIX = "ProductCardSkeleton";
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  footer: `${PREFIX}-footer`,
};

const Root = styled(Card)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderRadius: "6px",
    overflow: "hidden",
  },
  [`& .${classes.content}`]: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  [`& .${classes.footer}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "10px",
  },
}));

export default function ProductCardSkeleton() {
  return (
    <Root className={classes.root}>
      <Skeleton variant="rectangular" height={240} animation="wave" />
      <CardContent className={classes.content}>
        <Skeleton variant="text" width="60%" height={32} animation="wave" />
        <Skeleton variant="text" width="100%" height={18} animation="wave" />
        <Skeleton variant="text" width="80%" height={18} animation="wave" />
        <div className={classes.footer}>
          <Skeleton variant="text" width="40%" height={32} animation="wave" />
          <Skeleton
            variant="rounded"
            width={100}
            height={28}
            animation="wave"
          />
        </div>
      </CardContent>
    </Root>
  );
}
