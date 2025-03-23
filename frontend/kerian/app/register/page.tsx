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

const PREFIX = "RegisterPage";

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

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        setSuccess(true);
        setFormData({ username: "", email: "", password: "" });
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred while registering.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An error occurred while registering.");
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful!
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
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />

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
              Register
            </Button>
          </FormGroup>
        </form>
      </Box>
    </Root>
  );
}
