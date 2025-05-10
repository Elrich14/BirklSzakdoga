"use client";
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
import { boxShadows, colors } from "../../constants/colors";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api";

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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>();
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const user = await loginUser(formData);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username,
          role: user.role,
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
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Login successful!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              type="email"
              fullWidth
              required
            />

            <TextField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              Login
            </Button>
          </FormGroup>
        </form>
      </Box>
    </Root>
  );
}
