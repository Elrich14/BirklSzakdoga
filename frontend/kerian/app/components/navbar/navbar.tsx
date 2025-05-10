"use client";
import { AppBar, Button, Toolbar, Box } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import Link from "next/link";
import { boxShadows, colors } from "@/constants/colors";

const PREFIX = "Navbar";

const classes = {
  root: `${PREFIX}-root`,
  toolbar: `${PREFIX}-toolbar`,
  leftBox: `${PREFIX}-leftBox`,
  rightBox: `${PREFIX}-rightBox`,
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
    gap: 1,
  },
  [`& .${classes.rightBox}`]: {
    marginLeft: "auto",
    display: "flex",
    gap: 1,
  },
}));

export default function Navbar() {
  const [user, setUser] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const handleUser = () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const loginAt = parsed.loginAt;
          const MAX_DURATION = 60 * 60 * 1000; // 1 óra

          if (Date.now() - loginAt > MAX_DURATION) {
            localStorage.removeItem("user");
            setUser(null);
            window.dispatchEvent(new Event("userChanged"));
          } else {
            setUser(parsed.username);
          }
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleUser();
    window.addEventListener("userChanged", handleUser);
    return () => window.removeEventListener("userChanged", handleUser);
  }, []);

  const isLoggedIn = Boolean(user);

  const routes = [
    { path: "/", name: "Home", if: "loggedOut", align: "left" },
    { path: "/login", name: "Login", if: "loggedOut", align: "right" },
    { path: "/register", name: "Register", if: "loggedOut", align: "right" },
    { path: "/products", name: "Products", if: "always", align: "left" },
    { path: "/logout", name: "Logout", if: "loggedIn", align: "right" },
  ];

  const filteredRoutes = routes.filter((r) => {
    if (r.if === "loggedIn") return isLoggedIn;
    if (r.if === "loggedOut") return !isLoggedIn;
    return true;
  });

  const leftRoutes = filteredRoutes.filter((r) => r.align === "left");
  const rightRoutes = filteredRoutes.filter((r) => r.align === "right");

  const renderRoutes = (routeArray: typeof routes) =>
    routeArray.map((route, index) => (
      <Link href={route.path} key={index}>
        <Button>{route.name}</Button>
      </Link>
    ));

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
