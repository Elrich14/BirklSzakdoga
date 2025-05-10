"use client";
import { createTheme } from "@mui/material/styles";
import { colors } from "./constants/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
      paper: "#111111",
    },
    text: {
      primary: "#ffffff",
    },
    primary: {
      main: colors.kerian_main,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          backgroundColor: "#141414",
          color: "#ffffff",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: "info" },
              style: {
                backgroundColor: "#60a5fa",
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;
