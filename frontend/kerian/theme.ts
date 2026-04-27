"use client";
import { extendTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    vars?: Theme;
  }
  interface Palette {
    kerian: {
      main: string;
      hover: string;
      bg: string;
      navbar: string;
      shadow: string;
      shadowHover: string;
      dangerBg: string;
      dangerBorder: string;
      warningBg: string;
      warningBorder: string;
      overlayMuted: string;
      overlayHoverLight: string;
    };
    admin: {
      surface: string;
      input: string;
      border: string;
      borderLight: string;
      textMuted: string;
      textSecondary: string;
      textLight: string;
      accentPurple: string;
      checkboxInactive: string;
      overlay: string;
      overlayHover: string;
    };
  }
  interface PaletteOptions {
    kerian?: Partial<Palette["kerian"]>;
    admin?: Partial<Palette["admin"]>;
  }
}

const theme = extendTheme({
  cssVarPrefix: "mui",
  colorSchemeSelector: "class",
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        background: {
          default: "#000000",
          paper: "#111111",
        },
        text: {
          primary: "#ffffff",
          secondary: "#cccccc",
        },
        primary: {
          main: "#039c82",
        },
        error: {
          main: "#f44336",
        },
        warning: {
          main: "#ffb74d",
        },
        kerian: {
          main: "#039c82",
          hover: "#00cfac",
          bg: "rgba(3, 156, 130, 0.12)",
          navbar: "#3d3d3d",
          shadow: "rgba(0, 207, 172, 0.30)",
          shadowHover: "0 4px 8px rgba(0, 207, 172, 0.30)",
          dangerBg: "rgba(244, 67, 54, 0.08)",
          dangerBorder: "rgba(244, 67, 54, 0.30)",
          warningBg: "rgba(255, 152, 0, 0.08)",
          warningBorder: "rgba(255, 152, 0, 0.30)",
          overlayMuted: "rgba(136, 136, 136, 0.15)",
          overlayHoverLight: "rgba(255, 255, 255, 0.03)",
        },
        admin: {
          surface: "#1a1a1a",
          input: "#222222",
          border: "#333333",
          borderLight: "#444444",
          textMuted: "#888888",
          textSecondary: "#999999",
          textLight: "#cccccc",
          accentPurple: "#6366f1",
          checkboxInactive: "#666666",
          overlay: "rgba(0, 0, 0, 0.70)",
          overlayHover: "rgba(0, 0, 0, 0.90)",
        },
      },
    },
    light: {
      palette: {
        mode: "light",
        background: {
          default: "#ece8de",
          paper: "#f3f0e6",
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#4a4a4a",
        },
        primary: {
          main: "#02745e",
        },
        error: {
          main: "#c62828",
        },
        warning: {
          main: "#b26a00",
        },
        kerian: {
          main: "#02745e",
          hover: "#015e4c",
          bg: "rgba(2, 116, 94, 0.10)",
          navbar: "#d6d0c4",
          shadow: "rgba(31, 36, 33, 0.08)",
          shadowHover: "0 4px 8px rgba(0, 0, 0, 0.12)",
          dangerBg: "rgba(198, 40, 40, 0.08)",
          dangerBorder: "rgba(198, 40, 40, 0.30)",
          warningBg: "rgba(178, 106, 0, 0.10)",
          warningBorder: "rgba(178, 106, 0, 0.30)",
          overlayMuted: "rgba(0, 0, 0, 0.06)",
          overlayHoverLight: "rgba(0, 0, 0, 0.04)",
        },
        admin: {
          surface: "#efece6",
          input: "#fbf9f4",
          border: "#d8d2c4",
          borderLight: "#c4bda8",
          textMuted: "#6e6a60",
          textSecondary: "#7a7567",
          textLight: "#3f3c36",
          accentPurple: "#4f46e5",
          checkboxInactive: "#a39b8a",
          overlay: "rgba(0, 0, 0, 0.55)",
          overlayHover: "rgba(0, 0, 0, 0.70)",
        },
      },
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
