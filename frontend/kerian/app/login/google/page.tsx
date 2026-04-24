"use client";

import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { boxShadows, colors } from "../../../constants/colors";
import {
  USERNAME_AVAILABILITY_DEBOUNCE_MS,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "../../../constants/constants";
import {
  exchangeGoogleHandoff,
  checkUsernameAvailable,
  completeGoogleSignup,
} from "@/api";
import { useSnackbar } from "../../providers/snackbarProvider";

type TokenPayload = {
  id: string;
  email: string;
  role: "admin" | "user";
  username?: string;
  exp: number;
};

type PageState =
  | { kind: "loading" }
  | { kind: "needsUsername"; pendingToken: string; suggested: string }
  | { kind: "submitting"; pendingToken: string; suggested: string }
  | { kind: "error"; message: string };

type Availability =
  | "unknown"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

const PREFIX = "GoogleHandoffPage";

const classes = {
  root: `${PREFIX}-root`,
  box: `${PREFIX}-box`,
  submitButton: `${PREFIX}-submitButton`,
  availabilityOk: `${PREFIX}-availabilityOk`,
  availabilityBad: `${PREFIX}-availabilityBad`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100px",
    fontFamily: "serif",
  },
  [`& .${classes.box}`]: {
    minWidth: "400px",
    maxWidth: "400px",
    padding: "30px",
    boxShadow: boxShadows.kerian_main_button_hover_shadow,
    borderRadius: "4px",
  },
  [`& .${classes.submitButton}`]: {
    marginTop: "16px",
    backgroundColor: colors.kerian_main,
    "&:hover": { backgroundColor: colors.kerian_main_button_hover },
  },
  [`& .${classes.availabilityOk}`]: {
    fontSize: "13px",
    marginTop: "4px",
    color: colors.kerian_main,
  },
  [`& .${classes.availabilityBad}`]: {
    fontSize: "13px",
    marginTop: "4px",
    color: colors.danger,
  },
}));

function deriveUsername(pendingToken: string): string {
  try {
    const claims = jwtDecode<{ email?: string; displayName?: string }>(
      pendingToken
    );
    const prefix = claims.email?.split("@")[0] ?? "";
    return prefix
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, USERNAME_MAX_LENGTH);
  } catch {
    return "";
  }
}

export default function GoogleHandoffPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>("unknown");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exchangedRef = useRef(false);

  const storeTokenAndRedirect = useCallback(
    (token: string) => {
      const decoded = jwtDecode<TokenPayload>(token);
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: decoded.email,
          role: decoded.role,
          loginAt: Date.now(),
        })
      );
      window.dispatchEvent(new Event("userChanged"));
      showSnackbar(t("snackbar.loginSuccess"), "success");
      router.replace("/");
    },
    [router, showSnackbar, t]
  );

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const code = params.get("handoff");
    window.history.replaceState(null, "", "/login/google");
    if (!code) {
      router.replace("/login");
      return;
    }

    exchangeGoogleHandoff(code)
      .then((response) => {
        if ("token" in response) {
          storeTokenAndRedirect(response.token);
        } else {
          const suggested = deriveUsername(response.pendingToken);
          setUsername(suggested);
          setState({
            kind: "needsUsername",
            pendingToken: response.pendingToken,
            suggested,
          });
        }
      })
      .catch(() => {
        router.replace("/login?error=handoff_expired");
      });
  }, [params, router, storeTokenAndRedirect]);

  useEffect(() => {
    if (state.kind !== "needsUsername") return;
    if (
      username.length < USERNAME_MIN_LENGTH ||
      username.length > USERNAME_MAX_LENGTH
    ) {
      setAvailability("invalid");
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setAvailability("invalid");
      return;
    }
    setAvailability("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { available } = await checkUsernameAvailable(username);
        setAvailability(available ? "available" : "taken");
      } catch {
        setAvailability("unknown");
      }
    }, USERNAME_AVAILABILITY_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, state.kind]);

  const onSubmitUsername = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (state.kind !== "needsUsername") return;
    if (availability !== "available") return;
    const { pendingToken, suggested } = state;
    setState({ kind: "submitting", pendingToken, suggested });
    try {
      const { token } = await completeGoogleSignup(pendingToken, username);
      storeTokenAndRedirect(token);
    } catch (err) {
      const typed = err as Error & { status?: number };
      if (typed.status === 409) {
        setAvailability("taken");
        setState({ kind: "needsUsername", pendingToken, suggested });
      } else {
        router.replace("/login?error=oauth_failed");
      }
    }
  };

  if (state.kind === "loading" || state.kind === "submitting") {
    return (
      <Root className={classes.root}>
        <CircularProgress />
      </Root>
    );
  }
  if (state.kind === "error") {
    return (
      <Root className={classes.root}>
        <Typography>{state.message}</Typography>
      </Root>
    );
  }

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h5" gutterBottom>
          {t("login.google.pickUsername.title")}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {t("login.google.pickUsername.subtitle")}
        </Typography>
        <form onSubmit={onSubmitUsername}>
          <TextField
            label={t("register.username")}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          <Typography
            className={
              availability === "available"
                ? classes.availabilityOk
                : classes.availabilityBad
            }
          >
            {availability === "available" &&
              t("login.google.pickUsername.available")}
            {availability === "taken" &&
              t("login.google.pickUsername.taken")}
            {availability === "invalid" &&
              t("login.google.pickUsername.invalid")}
            {availability === "checking" &&
              t("login.google.pickUsername.checking")}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className={classes.submitButton}
            disabled={availability !== "available"}
          >
            {t("login.google.pickUsername.submit")}
          </Button>
        </form>
      </Box>
    </Root>
  );
}
