"use client";

import Image from "next/image";
import csontvaz from "../pics/csontvaz.png";
import { styled } from "@mui/material";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

const PREFIX = "Home";

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  kerian: `${PREFIX}-kerian`,
  heroImage: `${PREFIX}-heroImage`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 64px)",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "0 16px",
    [theme.breakpoints.down("sm")]: {
      gap: "12px",
    },
  },
  [`& .${classes.kerian}`]: {
    fontSize: "clamp(60px, 18vw, 200px)",
    fontWeight: "bold",
    color: theme.vars?.palette.text.primary,
    margin: 0,
  },
  [`& .${classes.heroImage}`]: {
    width: "100%",
    height: "auto",
    maxWidth: "400px",
    ...theme.applyStyles("dark", {
      filter: "invert(1)",
    }),
  },
}));

export default function Home() {
  return (
    <Root className={classes.root}>
      <div className={classes.container}>
        <Image
          src={csontvaz}
          alt="Csontváz"
          width={400}
          height={400}
          className={classes.heroImage}
        />

        <h1 className={`${classes.kerian} ${playfair.className}`}>KERIAN</h1>
      </div>
    </Root>
  );
}
