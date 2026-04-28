"use client";

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useLanguage } from "../../providers/languageProvider";
import ThemeToggle from "../themeToggle";
import { Route } from "./navbar";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  leftRoutes: Route[];
  rightRoutes: Route[];
  pathname: string;
}

const PREFIX = "MobileNavDrawer";
const classes = {
  header: `${PREFIX}-header`,
  closeButton: `${PREFIX}-closeButton`,
  list: `${PREFIX}-list`,
  listItem: `${PREFIX}-listItem`,
  activeItem: `${PREFIX}-activeItem`,
  divider: `${PREFIX}-divider`,
  footer: `${PREFIX}-footer`,
  langSelect: `${PREFIX}-langSelect`,
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: "280px",
    height: "100vh",
    maxHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "4px",
    flexShrink: 0,
  },
  [`& .${classes.closeButton}`]: {
    color: theme.vars?.palette.text.primary,
    padding: "6px",
    "&:hover": {
      color: theme.vars?.palette.kerian.main,
    },
  },
  [`& .${classes.list}`]: {
    padding: "0 8px",
    flexGrow: 1,
    minHeight: 0,
    overflowY: "auto",
  },
  [`& .${classes.listItem}`]: {
    borderRadius: "8px",
    marginBottom: "2px",
    color: theme.vars?.palette.text.primary,
  },
  [`& .${classes.activeItem}`]: {
    borderRadius: "8px",
    marginBottom: "2px",
    backgroundColor: theme.vars?.palette.kerian.bg,
    color: theme.vars?.palette.kerian.main,
    fontWeight: "bold",
  },
  [`& .${classes.divider}`]: {
    margin: "4px 16px",
  },
  [`& .${classes.footer}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    flexShrink: 0,
  },
  [`& .${classes.langSelect}`]: {
    color: theme.vars?.palette.text.primary,
    fontSize: "14px",
    minWidth: "60px",
    "& .MuiSelect-select": {
      padding: "4px 24px 4px 8px",
    },
    "& .MuiSelect-icon": {
      color: theme.vars?.palette.text.primary,
    },
    "&:hover": {
      color: theme.vars?.palette.kerian.main,
      "& .MuiSelect-icon": {
        color: theme.vars?.palette.kerian.main,
      },
    },
  },
}));

const MobileNavDrawer = ({
  open,
  onClose,
  leftRoutes,
  rightRoutes,
  pathname,
}: MobileNavDrawerProps) => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const onLanguageChange = (event: SelectChangeEvent) => {
    changeLanguage(event.target.value);
  };

  const visibleLeft = leftRoutes.filter((route) => route.name);
  const visibleRight = rightRoutes.filter((route) => route.name);

  const renderRouteItem = (route: Route, index: number) => {
    const isActive = pathname === route.path;
    return (
      <Link
        href={route.path}
        key={`${route.align}-${index}`}
        onClick={onClose}
      >
        <ListItemButton
          dense
          className={isActive ? classes.activeItem : classes.listItem}
        >
          <ListItemText primary={route.name} />
        </ListItemButton>
      </Link>
    );
  };

  return (
    <StyledDrawer anchor="left" open={open} onClose={onClose}>
      <Box className={classes.header}>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          aria-label={t("navbar.closeMenu")}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <List className={classes.list}>
        {visibleLeft.map(renderRouteItem)}
        {visibleLeft.length > 0 && visibleRight.length > 0 && (
          <Divider className={classes.divider} />
        )}
        {visibleRight.map(renderRouteItem)}
      </List>
      <Divider />
      <Box className={classes.footer}>
        <ThemeToggle />
        <Select
          value={language}
          onChange={onLanguageChange}
          variant="standard"
          disableUnderline
          className={classes.langSelect}
          renderValue={(value) => (value === "en" ? "EN" : "HU")}
        >
          <MenuItem value="en">{t("common.english")}</MenuItem>
          <MenuItem value="hu">{t("common.hungarian")}</MenuItem>
        </Select>
      </Box>
    </StyledDrawer>
  );
};

export default MobileNavDrawer;
