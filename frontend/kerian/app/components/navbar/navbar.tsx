"use client";
import { boxShadows } from "@/constants/colors";
import { AppBar, Button, Link, styled, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";

const PREFIX = "Navbar";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    "& .MuiPaper-root": {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      backgroundColor: "#3d3d3d",
    },
    "& .MuiTypography-root": {
      display: "flex",
      justifyContent: "center",
      fontFamily: "serif",
      textDecoration: "none",
    },
    "& .MuiButton-root": {
      color: "white",
    },
    "& .MuiButton-root:hover": {
      boxShadow: boxShadows.kerian_main_button_hover_shadow,
    },
    "& .MuiToolbar-root": {
      display: "flex",
    },
  },
}));

export default function Navbar() {
  const [user, setUser] = useState<string | null>(null);

  const routes = [
    {
      path: "/",
      name: "Home",
    },
    {
      path: "/login",
      name: "Login",
      if: "loggedOut",
    },
    {
      path: "/register",
      name: "Register",
      if: "loggedOut",
    },
    {
      path: "/logout",
      name: "Logout",
      if: "loggedIn",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleCustomEvent = () => {
        const user = localStorage.getItem("user");
        if (user) {
          setUser(user);
        }
      };
      handleCustomEvent();

      window.addEventListener("userChanged", handleCustomEvent);

      return () => {
        window.removeEventListener("userChanged", handleCustomEvent);
      };
    }
  }, []);

  return (
    <Root className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {routes
            .filter((r) =>
              r.if ? r.if === (user ? "loggedIn" : "loggedOut") : true
            )
            .map((route, index) => (
              <Link href={route.path} key={index}>
                <Button>{route.name}</Button>
              </Link>
            ))}
        </Toolbar>
      </AppBar>
    </Root>
  );
}
