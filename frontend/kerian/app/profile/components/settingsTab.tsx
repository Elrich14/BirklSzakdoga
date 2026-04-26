"use client";

import {
  Box,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { styled, useColorScheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../providers/languageProvider";
import ThemeToggle from "../../components/themeToggle";

const PREFIX = "SettingsTab";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  row: `${PREFIX}-row`,
  label: `${PREFIX}-label`,
  control: `${PREFIX}-control`,
  status: `${PREFIX}-status`,
  langSelect: `${PREFIX}-langSelect`,
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
    gap: "8px",
  },
  [`& .${classes.row}`]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: `1px solid ${theme.palette.admin.border}`,
    "&:last-of-type": {
      borderBottom: "none",
    },
  },
  [`& .${classes.label}`]: {
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: 600,
    color: (theme.vars || theme).palette.text.primary,
  },
  [`& .${classes.control}`]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
  },
  [`& .${classes.status}`]: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: (theme.vars || theme).palette.text.secondary,
  },
  [`& .${classes.langSelect}`]: {
    color: (theme.vars || theme).palette.text.primary,
    fontSize: "14px",
    minWidth: "80px",
  },
}));

export default function SettingsTab() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { mode } = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onLanguageChange = (event: SelectChangeEvent) => {
    changeLanguage(event.target.value);
  };

  const themeStatus =
    isMounted && mode === "light"
      ? t("profile.settings.themeLight")
      : t("profile.settings.themeDark");

  return (
    <Root className={classes.root}>
      <Typography className={classes.title}>
        {t("profile.tabs.settings")}
      </Typography>

      <Box className={classes.card}>
        <Box className={classes.row}>
          <Typography className={classes.label}>
            {t("profile.settings.theme")}
          </Typography>
          <Box className={classes.control}>
            <Typography className={classes.status}>{themeStatus}</Typography>
            <ThemeToggle />
          </Box>
        </Box>

        <Box className={classes.row}>
          <Typography className={classes.label}>
            {t("profile.settings.language")}
          </Typography>
          <Select
            value={language}
            onChange={onLanguageChange}
            variant="standard"
            className={classes.langSelect}
          >
            <MenuItem value="en">{t("common.english")}</MenuItem>
            <MenuItem value="hu">{t("common.hungarian")}</MenuItem>
          </Select>
        </Box>
      </Box>
    </Root>
  );
}
