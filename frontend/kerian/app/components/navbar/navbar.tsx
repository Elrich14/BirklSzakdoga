"use client";

import {
  AppBar,
  Button,
  Toolbar,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
  Badge,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "../../utils/auth";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../providers/languageProvider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import { useCartStore } from "../store/cartStore";
import ThemeToggle from "../themeToggle";
import MobileNavDrawer from "./mobileNavDrawer";

const PREFIX = "Navbar";

const classes = {
  root: `${PREFIX}-root`,
  toolbar: `${PREFIX}-toolbar`,
  leftBox: `${PREFIX}-leftBox`,
  rightBox: `${PREFIX}-rightBox`,
  cartBox: `${PREFIX}-cartBox`,
  cartBoxActive: `${PREFIX}-cartBoxActive`,
  langSelect: `${PREFIX}-langSelect`,
  burgerButton: `${PREFIX}-burgerButton`,
};
export type Route = {
  path: string;
  name?: string;
  icon?: React.ReactNode;
  if: "always" | "loggedIn" | "loggedOut" | "admin" | "userOnly";
  align: "left" | "right";
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    "& .MuiPaper-root": {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      backgroundColor: (theme.vars || theme).palette.kerian.navbar,
    },
    "& .MuiButton-root": {
      color: (theme.vars || theme).palette.text.primary,
      textTransform: "none",
    },
    "& .MuiButton-root:hover": {
      boxShadow: (theme.vars || theme).palette.kerian.shadowHover,
    },
    "& .MuiButton-root.active": {
      color: (theme.vars || theme).palette.kerian.main,
      fontWeight: "bold",
      fontStyle: "italic",
    },
    "& .MuiToolbar-root": {
      display: "flex",
      minHeight: "60px",
    },
  },
  [`& .${classes.toolbar}`]: {
    width: "100%",
  },
  [`& .${classes.leftBox}`]: {
    display: "flex",
    gap: "10px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  [`& .${classes.rightBox}`]: {
    marginLeft: "auto",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      "& > :not([data-keep-mobile])": {
        display: "none",
      },
    },
  },
  [`& .${classes.burgerButton}`]: {
    display: "none",
    color: (theme.vars || theme).palette.text.primary,
    marginRight: "8px",
    "&:hover": {
      color: (theme.vars || theme).palette.kerian.main,
    },
    [theme.breakpoints.down("md")]: {
      display: "inline-flex",
    },
  },
  [`& .${classes.cartBox}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: "8px",
    cursor: "pointer",
    color: (theme.vars || theme).palette.text.primary,
    "&:hover": {
      color: (theme.vars || theme).palette.kerian.main,
    },
  },
  [`& .${classes.cartBoxActive}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: "8px",
    cursor: "pointer",
    color: (theme.vars || theme).palette.kerian.main,
  },
  [`& .${classes.langSelect}`]: {
    color: (theme.vars || theme).palette.text.primary,
    fontSize: "14px",
    minWidth: "50px",
    "& .MuiSelect-select": {
      padding: "4px 24px 4px 8px",
    },
    "& .MuiSelect-icon": {
      color: (theme.vars || theme).palette.text.primary,
    },
    "&:hover": {
      color: (theme.vars || theme).palette.kerian.main,
      "& .MuiSelect-icon": {
        color: (theme.vars || theme).palette.kerian.main,
      },
    },
  },
}));

export default function Navbar() {
  const cartItems = useCartStore((state) => state.items);
  const [role, setRole] = useState<"guest" | "user" | "admin">("guest");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const updateRole = () => {
      setRole(getUserRole());
    };

    updateRole();
    window.addEventListener("userChanged", updateRole);

    return () => window.removeEventListener("userChanged", updateRole);
  }, []);

  const isLoggedIn = role !== "guest";

  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const onLanguageChange = (event: SelectChangeEvent) => {
    changeLanguage(event.target.value);
  };

  const routes: Route[] = [
    { path: "/", name: t("navbar.home"), if: "always", align: "left" },
    {
      path: "/products",
      name: t("navbar.products"),
      if: "always",
      align: "left",
    },
    {
      path: "/wishlist",
      name: t("navbar.wishlist"),
      if: "loggedIn",
      align: "left",
    },
    {
      path: "/admin",
      name: t("navbar.admin"),
      if: "admin",
      align: "left",
    },
    {
      path: "/login",
      name: t("navbar.login"),
      if: "loggedOut",
      align: "right",
    },
    {
      path: "/register",
      name: t("navbar.register"),
      if: "loggedOut",
      align: "right",
    },
    {
      path: "/cart",
      icon: (
        <Badge badgeContent={cartItems.length} color="primary">
          <ShoppingCartIcon />
        </Badge>
      ),
      if: "loggedIn",
      align: "right",
    },
    {
      path: "/profile",
      name: t("navbar.profile"),
      if: "loggedIn",
      align: "right",
    },
    {
      path: "/logout",
      name: t("navbar.logout"),
      if: "loggedIn",
      align: "right",
    },
  ];

  const filteredRoutes = routes.filter((route) => {
    if (route.if === "loggedIn") return isLoggedIn;
    if (route.if === "loggedOut") return !isLoggedIn;
    if (route.if === "admin") return role === "admin";
    if (route.if === "userOnly") return role === "user";
    return true;
  });

  const leftRoutes = filteredRoutes.filter((route) => route.align === "left");
  const rightRoutes = filteredRoutes.filter((route) => route.align === "right");

  const pathname = usePathname();

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const renderRoutes = (routeArray: Route[]) =>
    routeArray.map((route, index) => {
      const isActive = pathname === route.path;
      const isIconRoute = !!route.icon;

      return (
        <Link
          href={route.path}
          key={index}
          data-keep-mobile={isIconRoute || undefined}
        >
          {route.icon ? (
            <Box className={isActive ? classes.cartBoxActive : classes.cartBox}>
              {route.icon}
            </Box>
          ) : (
            <Button className={isActive ? "active" : ""}>{route.name}</Button>
          )}
        </Link>
      );
    });

  return (
    <Root className={classes.root}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            className={classes.burgerButton}
            onClick={() => setIsDrawerOpen(true)}
            aria-label={t("navbar.menu")}
          >
            <MenuIcon />
          </IconButton>
          <Box className={classes.leftBox}>{renderRoutes(leftRoutes)}</Box>
          <Box className={classes.rightBox}>
            {renderRoutes(rightRoutes)}
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
        </Toolbar>
      </AppBar>
      <MobileNavDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        leftRoutes={leftRoutes}
        rightRoutes={rightRoutes}
        pathname={pathname}
      />
    </Root>
  );
}
