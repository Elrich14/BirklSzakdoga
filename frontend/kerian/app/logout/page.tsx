"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../providers/snackbarProvider";

export default function Logout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userChanged"));
    showSnackbar(t("snackbar.logoutSuccess"), "success");
    router.replace("/login");
  }, [router, t, showSnackbar]);

  return null;
}
