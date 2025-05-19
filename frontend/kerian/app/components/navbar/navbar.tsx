"use client";

import { AppBar, Button, Toolbar, Box } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import Link from "next/link";
import { boxShadows, colors } from "@/constants/colors";
import { getUserRole } from "../../utils/auth";
import { usePathname } from "next/navigation";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const PREFIX = "Navbar";

const classes = {
  root: `${PREFIX}-root`,
  toolbar: `${PREFIX}-toolbar`,
  leftBox: `${PREFIX}-leftBox`,
  rightBox: `${PREFIX}-rightBox`,
  cartBox: `${PREFIX}-cartBox`,
  cartBoxActive: `${PREFIX}-cartBoxActive`,
};
type Route = {
  path: string;
  name?: string;
  icon?: React.ElementType;
  if: "always" | "loggedIn" | "loggedOut" | "admin";
  align: "left" | "right";
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    "& .MuiPaper-root": {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      backgroundColor: colors.kerian_navbar,
    },
    "& .MuiButton-root": {
      color: "white",
      textTransform: "none",
    },
    "& .MuiButton-root:hover": {
      boxShadow: boxShadows.kerian_main_button_hover_shadow,
    },
    "& .MuiButton-root.active": {
      color: colors.kerian_main,
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
    gap: 10,
  },
  [`& .${classes.rightBox}`]: {
    marginLeft: "auto",
    display: "flex",
    gap: 10,
  },
  [`& .${classes.cartBox}`]: {
    width: 20,
    height: 20,
    padding: "6px 8px",
    marginRight: "15px",
    cursor: "pointer",
    color: "white",
    "&:hover": {
      color: colors.kerian_main,
    },
  },
  [`& .${classes.cartBoxActive}`]: {
    width: 20,
    height: 20,
    padding: "6px 8px",
    marginRight: "15px",
    cursor: "pointer",
    color: colors.kerian_main,
  },
}));

export default function Navbar() {
  const [role, setRole] = useState<"guest" | "user" | "admin">("guest");

  useEffect(() => {
    const updateRole = () => {
      setRole(getUserRole());
    };

    updateRole();
    window.addEventListener("userChanged", updateRole);

    return () => window.removeEventListener("userChanged", updateRole);
  }, [role]);

  const isLoggedIn = role !== "guest";

  const routes: Route[] = [
    { path: "/", name: "Home", if: "always", align: "left" },
    { path: "/products", name: "Products", if: "always", align: "left" },
    { path: "/login", name: "Login", if: "loggedOut", align: "right" },
    { path: "/register", name: "Register", if: "loggedOut", align: "right" },
    {
      path: "/cart",
      icon: ShoppingCartIcon,
      if: "loggedIn",
      align: "right",
    },
    { path: "/logout", name: "Logout", if: "loggedIn", align: "right" },
  ];

  const filteredRoutes = routes.filter((r) => {
    if (r.if === "loggedIn") return isLoggedIn;
    if (r.if === "loggedOut") return !isLoggedIn;
    if (r.if === "admin") return role === "admin";
    return true;
  });

  const leftRoutes = filteredRoutes.filter((r) => r.align === "left");
  const rightRoutes = filteredRoutes.filter((r) => r.align === "right");

  const pathname = usePathname();

  const renderRoutes = (routeArray: Route[]) =>
    routeArray.map((route, index) => {
      const isActive = pathname === route.path;

      return (
        <Link href={route.path} key={index}>
          {route.icon ? (
            <Box className={isActive ? classes.cartBoxActive : classes.cartBox}>
              <route.icon />
            </Box>
          ) : (
            <Button className={isActive ? "active" : ""}>{route.name}</Button>
          )}
        </Link>
      );
    });

  return (
    <Root className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Box className={classes.leftBox}>{renderRoutes(leftRoutes)}</Box>
          <Box className={classes.rightBox}>{renderRoutes(rightRoutes)}</Box>
        </Toolbar>
      </AppBar>
    </Root>
  );
}
