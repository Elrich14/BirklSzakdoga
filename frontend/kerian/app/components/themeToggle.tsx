"use client";

import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const PREFIX = "ThemeToggle";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  [`&.${classes.root}`]: {
    color: theme.palette.text.primary,
    "&:hover": {
      color: theme.palette.kerian.main,
    },
  },
}));

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <StyledIconButton
        className={classes.root}
        aria-label={t("themeToggle.aria")}
      >
        <LightModeOutlinedIcon />
      </StyledIconButton>
    );
  }

  const isLight = mode === "light";

  const onToggle = () => {
    setMode(isLight ? "dark" : "light");
  };

  return (
    <StyledIconButton
      className={classes.root}
      onClick={onToggle}
      aria-label={
        isLight ? t("themeToggle.switchToDark") : t("themeToggle.switchToLight")
      }
    >
      {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
    </StyledIconButton>
  );
}
