"use client";
import {
  Box,
  Button,
  FormGroup,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { showSnackbar } = useSnackbar();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { token } = await loginUser(formData);
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
      setFormData({ email: "", password: "" });
      router.push("/");
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

        <form onSubmit={onSubmit}>
          <FormGroup>
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
              {t("login.submit")}
            </Button>
          </FormGroup>
        </form>
      </Box>
    </Root>
  );
}
