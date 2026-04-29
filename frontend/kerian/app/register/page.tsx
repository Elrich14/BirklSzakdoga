"use client";

import { colors } from "@/constants/colors";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { registerUser } from "@/api";
import { useSnackbar } from "../providers/snackbarProvider";
import GoogleSignInButton from "../components/auth/googleSignInButton";

const PREFIX = "RegisterPage";

const classes = {
  root: `${PREFIX}-root`,
  box: `${PREFIX}-box`,
  submitButton: `${PREFIX}-submitButton`,
  strengthBar: `${PREFIX}-strengthBar`,
  passwordRow: `${PREFIX}-passwordRow`,
  toggleButton: `${PREFIX}-toggleButton`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100px",
    padding: "0 16px",

    "& .MuiTypography-root": {
      fontSize: "clamp(32px, 7vw, 50px)",
      display: "flex",
      justifyContent: "center",
      fontFamily: "serif",
    },
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
  [`& .${classes.strengthBar}`]: {
    height: "4px",
    borderRadius: "2px",
    marginTop: "4px",
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

const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 25;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
};

const getStrengthColor = (strength: number): string => {
  if (strength < 30) return "#f44336";
  if (strength < 60) return "#ff9800";
  return colors.kerian_main;
};

export default function Register() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    displayName: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    displayName: Yup.string().required(t("common.validation.required")),
    email: Yup.string()
      .email(t("common.validation.invalidEmail"))
      .required(t("common.validation.required")),
    password: Yup.string()
      .min(6, t("common.validation.passwordMin"))
      .required(t("common.validation.required")),
  });

  const onSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await registerUser({
        username: values.displayName,
        email: values.email,
        password: values.password,
      });
      showSnackbar(t("snackbar.registerSuccess"), "success");
      resetForm();
    } catch {
      showSnackbar(t("snackbar.registerError"), "error");
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("register.title")}
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
          }) => {
            const passwordStrength = getPasswordStrength(values.password);

            return (
              <Form>
                <TextField
                  label={t("register.username")}
                  name="displayName"
                  value={values.displayName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.displayName && Boolean(errors.displayName)}
                  helperText={touched.displayName && errors.displayName}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />

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
                {values.password.length > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    className={classes.strengthBar}
                    sx={{
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: getStrengthColor(passwordStrength),
                      },
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                  />
                )}

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
                    t("register.submit")
                  )}
                </Button>
              </Form>
            );
          }}
        </Formik>

        <GoogleSignInButton />
      </Box>
    </Root>
  );
}
