"use client";

import { styled } from "@mui/material/styles";
import { Box, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import GoogleIcon from "@mui/icons-material/Google";
import { googleBrand } from "@/constants/colors";

const PREFIX = "GoogleSignInButton";

const classes = {
  root: `${PREFIX}-root`,
  divider: `${PREFIX}-divider`,
  button: `${PREFIX}-button`,
  icon: `${PREFIX}-icon`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    marginTop: "16px",
    marginBottom: "8px",
  },
  [`& .${classes.divider}`]: {
    margin: "16px 0",
    color: theme.palette.text.secondary,
    fontSize: "13px",
  },
  [`&& .${classes.button}`]: {
    width: "100%",
    textTransform: "none",
    backgroundColor: googleBrand.buttonBackground,
    color: googleBrand.buttonText,
    border: `1px solid ${googleBrand.buttonBorder}`,
    boxShadow: "none",
    "&:hover": {
      backgroundColor: googleBrand.buttonBackgroundHover,
      boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    },
  },
  [`& .${classes.icon}`]: {
    marginRight: "8px",
    fontSize: "20px",
    display: "inline-flex",
    alignItems: "center",
  },
}));

export default function GoogleSignInButton() {
  const { t } = useTranslation();

  const onClick = () => {
    const backend =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    window.location.href = `${backend}/auth/google`;
  };

  return (
    <Root className={classes.root}>
      <Divider className={classes.divider}>{t("login.google.or")}</Divider>
      <Button
        type="button"
        variant="contained"
        className={classes.button}
        onClick={onClick}
      >
        <Box component="span" className={classes.icon}>
          <GoogleIcon fontSize="inherit" />
        </Box>
        {t("login.google.signInWithGoogle")}
      </Button>
    </Root>
  );
}
