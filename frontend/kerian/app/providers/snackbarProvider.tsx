"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { styled } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { colors } from "@/constants/colors";

interface SnackbarState {
  isOpen: boolean;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

const PREFIX = "SnackbarProvider";
const classes = {
  alert: `${PREFIX}-alert`,
};

const StyledAlert = styled(Alert)(() => ({
  [`&.${classes.alert}`]: {
    fontWeight: 500,
    fontSize: "14px",
    alignItems: "center",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    "&.MuiAlert-standardSuccess": {
      backgroundColor: colors.kerian_main,
      color: "#fff",
    },
    "&.MuiAlert-standardSuccess .MuiAlert-icon": {
      color: "#fff",
    },
  },
}));

const AUTO_HIDE_DURATION = 4000;

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isOpen: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbar({ isOpen: true, message, severity });
    },
    []
  );

  const onClose = useCallback(
    (_?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      setSnackbar((prev) => ({ ...prev, isOpen: false }));
    },
    []
  );

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.isOpen}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <StyledAlert
          className={classes.alert}
          onClose={onClose}
          severity={snackbar.severity}
          variant="standard"
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </StyledAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType =>
  useContext(SnackbarContext);
