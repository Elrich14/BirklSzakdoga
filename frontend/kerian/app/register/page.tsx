"use client";
import { boxShadows, colors } from "@/constants/colors";
import {
  Alert,
  Box,
  Button,
  FormGroup,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { registerUser } from "@/api";

const PREFIX = "RegisterPage";

const classes = {
  root: `${PREFIX}-root`,
  box: `${PREFIX}-box`,
  alert: `${PREFIX}-alert`,
  submitButton: `${PREFIX}-submitButton`,
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
    "& .MuiButtonBase-root": {
      backgroundColor: colors.kerian_main,
    },
    "& .MuiButtonBase-root:hover": {
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
  [`& .${classes.alert}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.submitButton}`]: {
    marginTop: "16px",
  },
}));

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await registerUser(formData);
      setSuccess(true);
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.registerError"));
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("register.title")}
        </Typography>

        {success && (
          <Alert severity="success" className={classes.alert}>
            {t("register.registerSuccess")}
          </Alert>
        )}
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <FormGroup>
            <TextField
              label={t("register.username")}
              name="username"
              value={formData.username}
              onChange={onChange}
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />

            <TextField
              label={t("common.email")}
              name="email"
              value={formData.email}
              onChange={onChange}
              variant="outlined"
              margin="normal"
              type="email"
              fullWidth
              required
            />

            <TextField
              label={t("common.password")}
              name="password"
              value={formData.password}
              onChange={onChange}
              variant="outlined"
              margin="normal"
              type="password"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={classes.submitButton}
            >
              {t("register.submit")}
            </Button>
          </FormGroup>
        </form>
      </Box>
    </Root>
  );
}
