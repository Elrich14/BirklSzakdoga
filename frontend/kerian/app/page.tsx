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
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 64px)",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  [`& .${classes.kerian}`]: {
    fontSize: "200px",
    fontWeight: "bold",
    color: "white",
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
          style={{
            filter: "invert(1)",
          }}
        />

        <h1 className={`${classes.kerian} ${playfair.className}`}>KERIAN</h1>
      </div>
    </Root>
  );
}
