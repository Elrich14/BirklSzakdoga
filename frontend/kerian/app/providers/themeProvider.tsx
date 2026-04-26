"use client";

import { ReactNode } from "react";
import { CssVarsProvider } from "@mui/material/styles";
import theme from "@/theme";

interface Props {
  children: ReactNode;
}

export default function ThemeProvider({ children }: Props) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      {children}
    </CssVarsProvider>
  );
}
