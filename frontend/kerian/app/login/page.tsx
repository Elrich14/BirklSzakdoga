"use client";
import {
  Alert,
  Box,
  Button,
  FormGroup,
  styled,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { boxShadows, colors } from "../../constants/colors";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api";
import { jwtDecode } from "jwt-decode";
import { useLanguage } from "../providers/languageProvider";

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
    minWidth: 400,
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    padding: "30px",
    boxShadow: boxShadows.kerian_main_button_hover_shadow,
    borderRadius: 4,
  },
}));

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>();
  const [success, setSuccess] = useState(false);

  const onLanguageChange = (event: SelectChangeEvent) => {
    changeLanguage(event.target.value);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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

      setSuccess(true);
      setFormData({ email: "", password: "" });
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An error occurred while logging in.");
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t("common.language")}</InputLabel>
          <Select
            value={language}
            onChange={onLanguageChange}
            label={t("common.language")}
          >
            <MenuItem value="en">{t("common.english")}</MenuItem>
            <MenuItem value="hu">{t("common.hungarian")}</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="h4" component="h1" gutterBottom>
          {t("login.title")}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("login.loginSuccessful", "Login successful!")}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
              sx={{ mt: 2 }}
            >
              {t("login.submit")}
            </Button>
          </FormGroup>
        </form>
      </Box>
    </Root>
  );
}
