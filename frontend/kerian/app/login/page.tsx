"use client";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link as MuiLink,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, verifyTwoFactor } from "@/api";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "../providers/snackbarProvider";
import GoogleSignInButton from "../components/auth/googleSignInButton";
import {
  OAUTH_ERROR_I18N_KEYS,
  type OAuthErrorCode,
} from "../../constants/constants";

type TokenPayload = {
  id: string;
  email: string;
  role: "admin" | "user";
  username?: string;
  exp: number;
};

type LoginStep =
  | { step: "credentials" }
  | { step: "twoFactor"; pendingToken: string };

const PREFIX = "LoginPage";

const classes = {
  root: `${PREFIX}-root`,
  box: `${PREFIX}-box`,
  submitButton: `${PREFIX}-submitButton`,
  passwordRow: `${PREFIX}-passwordRow`,
  toggleButton: `${PREFIX}-toggleButton`,
  twoFactorHelp: `${PREFIX}-twoFactorHelp`,
  toggleLink: `${PREFIX}-toggleLink`,
  errorText: `${PREFIX}-errorText`,
  twoFactorTitle: `${PREFIX}-twoFactorTitle`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100px",
    fontSize: "clamp(32px, 7vw, 50px)",
    fontFamily: "serif",
    padding: "0 16px",
    "& .MuiButtonBase-root.MuiButton-root": {
      backgroundColor: theme.vars?.palette.kerian.main,
    },
    "& .MuiButtonBase-root.MuiButton-root:hover": {
      backgroundColor: theme.vars?.palette.kerian.hover,
      boxShadow: theme.vars?.palette.kerian.shadowHover,
    },

    "& .MuiInputBase-root.Mui-focused": {
      "--mui-palette-primary-main": theme.vars?.palette.kerian.main,
    },
    "& .MuiFormLabel-root.Mui-focused": {
      "--mui-palette-primary-main": theme.vars?.palette.kerian.main,
    },
  },
  [`& .${classes.box}`]: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    padding: "30px",
    boxShadow: theme.vars?.palette.kerian.shadowHover,
    borderRadius: "4px",
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
  },
  [`& .${classes.submitButton}`]: {
    marginTop: "16px",
  },
  [`& .${classes.passwordRow}`]: {
    position: "relative",
  },
  [`& .${classes.toggleButton}`]: {
    position: "absolute",
    right: "8px",
    top: "55%",
    transform: "translateY(-50%)",
  },

  [`& .${classes.twoFactorHelp}`]: {
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "8px",
    display: "block",
  },
  [`& .${classes.toggleLink}`]: {
    fontSize: "14px",
    display: "block",
    marginTop: "12px",
    cursor: "pointer",
    color: theme.vars?.palette.kerian.main,
  },
  [`& .${classes.errorText}`]: {
    fontSize: "14px",
    color: theme.vars?.palette.error.main,
    marginTop: "8px",
  },
  [`& .${classes.twoFactorTitle}`]: {
    textAlign: "center",
  },
}));

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginStep>({
    step: "credentials",
  });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const twoFactorInputRef = useRef<HTMLInputElement | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (loginState.step === "twoFactor") {
      twoFactorInputRef.current?.focus();
    }
  }, [loginState.step]);

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (!errorCode) return;
    const translationKey = OAUTH_ERROR_I18N_KEYS[errorCode as OAuthErrorCode];
    if (translationKey) {
      showSnackbar(t(translationKey), "error");
      window.history.replaceState(null, "", "/login");
    }
  }, [searchParams, showSnackbar, t]);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("common.validation.invalidEmail"))
      .required(t("common.validation.required")),
    password: Yup.string().required(t("common.validation.required")),
  });

  const storeTokenAndRedirect = (token: string) => {
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
    router.replace("/");
  };

  const onCredentialsSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const response = await loginUser(values);

      if ("twoFactorRequired" in response && response.twoFactorRequired) {
        setLoginState({
          step: "twoFactor",
          pendingToken: response.pendingToken,
        });
        resetForm();
        return;
      }

      storeTokenAndRedirect(response.token);
      showSnackbar(t("snackbar.loginSuccess"), "success");
      resetForm();
    } catch {
      showSnackbar(t("snackbar.loginError"), "error");
    }
  };

  const submitTwoFactorCode = async (codeToSubmit: string) => {
    if (loginState.step !== "twoFactor") return;
    setIsVerifying(true);
    setTwoFactorError("");
    try {
      const { token } = await verifyTwoFactor(
        loginState.pendingToken,
        codeToSubmit
      );
      storeTokenAndRedirect(token);
      showSnackbar(t("snackbar.loginSuccess"), "success");
    } catch (err) {
      const typedError = err as Error & {
        status?: number;
        retryAfterSeconds?: number;
      };
      if (typedError.status === 429) {
        const minutes = Math.ceil((typedError.retryAfterSeconds ?? 900) / 60);
        setTwoFactorError(t("login.twoFactor.rateLimited", { minutes }));
      } else if (typedError.status === 401) {
        if (typedError.message === "Invalid or expired token") {
          setLoginState({ step: "credentials" });
          showSnackbar(t("login.twoFactor.sessionExpired"), "error");
        } else {
          setTwoFactorError(t("login.twoFactor.invalidCode"));
        }
      } else {
        setTwoFactorError(t("snackbar.loginError"));
      }
      setTwoFactorCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const onTwoFactorInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.target.value;
    if (useRecoveryCode) {
      const cleanedValue = rawValue
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "")
        .slice(0, 9);
      setTwoFactorCode(cleanedValue);
    } else {
      const cleanedValue = rawValue.replace(/\D/g, "").slice(0, 6);
      setTwoFactorCode(cleanedValue);
      if (cleanedValue.length === 6 && !isVerifying) {
        submitTwoFactorCode(cleanedValue);
      }
    }
  };

  const onRecoveryToggle = () => {
    setUseRecoveryCode((previous) => !previous);
    setTwoFactorCode("");
    setTwoFactorError("");
  };

  const onTwoFactorSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!twoFactorCode) return;
    submitTwoFactorCode(twoFactorCode);
  };

  const renderCredentialsForm = () => (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onCredentialsSubmit}
    >
      {({
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
        isSubmitting,
      }) => (
        <Form>
          <TextField
            label={t("common.email")}
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            variant="outlined"
            margin="normal"
            type="email"
            autoComplete="email"
            fullWidth
          />

          <Box className={classes.passwordRow}>
            <TextField
              label={t("common.password")}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              variant="outlined"
              margin="normal"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
            />
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              size="small"
              disableRipple
              className={classes.toggleButton}
            >
              {showPassword ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={classes.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("login.submit")
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );

  const renderTwoFactorForm = () => (
    <form onSubmit={onTwoFactorSubmit}>
      <Typography className={classes.twoFactorHelp}>
        {useRecoveryCode
          ? t("login.twoFactor.recoveryPrompt")
          : t("login.twoFactor.codePrompt")}
      </Typography>

      <TextField
        inputRef={twoFactorInputRef}
        value={twoFactorCode}
        onChange={onTwoFactorInputChange}
        variant="outlined"
        margin="normal"
        fullWidth
        autoComplete="one-time-code"
        inputMode={useRecoveryCode ? "text" : "numeric"}
        placeholder={useRecoveryCode ? "XXXX-XXXX" : "123456"}
        disabled={isVerifying}
      />

      {twoFactorError && (
        <Typography className={classes.errorText}>{twoFactorError}</Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        className={classes.submitButton}
        disabled={isVerifying || !twoFactorCode}
      >
        {isVerifying ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          t("login.twoFactor.verify")
        )}
      </Button>

      <MuiLink
        component="button"
        type="button"
        underline="hover"
        className={classes.toggleLink}
        onClick={onRecoveryToggle}
      >
        {useRecoveryCode
          ? t("login.twoFactor.useAuthenticatorApp")
          : t("login.twoFactor.useRecoveryCode")}
      </MuiLink>
    </form>
  );

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={
            loginState.step === "twoFactor" ? classes.twoFactorTitle : undefined
          }
        >
          {loginState.step === "credentials"
            ? t("login.title")
            : t("login.twoFactor.title")}
        </Typography>

        {loginState.step === "credentials"
          ? renderCredentialsForm()
          : renderTwoFactorForm()}

        {loginState.step === "credentials" && <GoogleSignInButton />}
      </Box>
    </Root>
  );
}
