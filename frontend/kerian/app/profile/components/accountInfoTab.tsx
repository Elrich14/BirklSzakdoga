"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { styled, useColorScheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCurrentUser, CurrentUser } from "@/api";

const PREFIX = "AccountInfoTab";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  row: `${PREFIX}-row`,
  label: `${PREFIX}-label`,
  value: `${PREFIX}-value`,
  error: `${PREFIX}-error`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    maxWidth: "640px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  [`& .${classes.title}`]: {
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: "24px",
    color: (theme.vars || theme).palette.kerian.main,
  },
  [`& .${classes.card}`]: {
    backgroundColor: (theme.vars || theme).palette.background.paper,
    border: `1px solid ${theme.palette.admin.border}`,
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  [`& .${classes.row}`]: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: `1px solid ${theme.palette.admin.border}`,
    "&:last-of-type": {
      borderBottom: "none",
    },
  },
  [`& .${classes.label}`]: {
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: 600,
  },
  [`& .${classes.value}`]: {
    fontFamily: "monospace",
    fontSize: "14px",
  },
  [`& .${classes.error}`]: {
    color: (theme.vars || theme).palette.error.main,
    fontFamily: "monospace",
  },
}));

export default function AccountInfoTab() {
  const { t } = useTranslation();
  const { mode } = useColorScheme();

  const { data, isLoading, isError } = useQuery<CurrentUser, Error>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const themeLabel =
    mode === "light"
      ? t("profile.account.themeLight")
      : t("profile.account.themeDark");

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("profile.tabs.account")}
      </Typography>

      <Box className={classes.card}>
        {isLoading && (
          <>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="40%" />
          </>
        )}

        {isError && (
          <Typography className={classes.error}>
            {t("profile.account.loadError")}
          </Typography>
        )}

        {data && (
          <>
            <Box className={classes.row}>
              <Typography className={classes.label}>
                {t("profile.account.username")}
              </Typography>
              <Typography className={classes.value}>{data.username}</Typography>
            </Box>
            <Box className={classes.row}>
              <Typography className={classes.label}>
                {t("profile.account.email")}
              </Typography>
              <Typography className={classes.value}>{data.email}</Typography>
            </Box>
            <Box className={classes.row}>
              <Typography className={classes.label}>
                {t("profile.account.signInMethod")}
              </Typography>
              <Typography className={classes.value}>
                {data.authProvider === "google"
                  ? t("profile.account.googleSignIn")
                  : t("profile.account.passwordSignIn")}
              </Typography>
            </Box>
            <Box className={classes.row}>
              <Typography className={classes.label}>
                {t("profile.account.currentTheme")}
              </Typography>
              <Typography className={classes.value}>{themeLabel}</Typography>
            </Box>
          </>
        )}
      </Box>
    </Root>
  );
}
