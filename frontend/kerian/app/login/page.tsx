"use client";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { boxShadows, colors } from "../../constants/colors";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "../providers/snackbarProvider";

type TokenPayload = {
  id: string;
  email: string;
  role: "admin" | "user";
  username?: string;
  exp: number;
};

const PREFIX = "LoginPage";

const classes = {
  root: `${PREFIX}-root`,
  box: `${PREFIX}-box`,
  submitButton: `${PREFIX}-submitButton`,
  passwordRow: `${PREFIX}-passwordRow`,
  toggleButton: `${PREFIX}-toggleButton`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100px",

    "& .MuiTypography-root": {
      fontSize: "50px",
      display: "flex",
      justifyContent: "center",
      fontFamily: "serif",
    },
    "& .MuiButtonBase-root.MuiButton-root": {
      backgroundColor: colors.kerian_main,
    },
    "& .MuiButtonBase-root.MuiButton-root:hover": {
      backgroundColor: colors.kerian_main_button_hover,
      boxShadow: boxShadows.kerian_main_button_hover_shadow,
    },

    "& .MuiInputBase-root.Mui-focused": {
      "--mui-palette-primary-main": colors.kerian_main,
    },
    "& .MuiFormLabel-root.Mui-focused": {
      "--mui-palette-primary-main": colors.kerian_main,
    },
  },
  [`& .${classes.box}`]: {
    minWidth: "400px",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    padding: "30px",
    boxShadow: boxShadows.kerian_main_button_hover_shadow,
    borderRadius: "4px",
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
}));

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

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

  const onSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const { token } = await loginUser(values);
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
      showSnackbar(t("snackbar.loginSuccess"), "success");
      resetForm();
    } catch {
      showSnackbar(t("snackbar.loginError"), "error");
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("login.title")}
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
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
      </Box>
    </Root>
  );
}
