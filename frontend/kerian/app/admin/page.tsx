"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { getUserRole } from "../utils/auth";
import SideNavbar from "../components/sideNavbar/sideNavbar";
import AnalyticsDashboard from "./components/analyticsDashboard";
import ProductManagement from "./components/productManagement";

const PREFIX = "AdminPage";
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    minHeight: "calc(100vh - 60px)",
  },
  [`& .${classes.content}`]: {
    flex: 1,
    padding: "32px",
    overflow: "auto",
  },
}));

export default function AdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");

  useEffect(() => {
    if (getUserRole() !== "admin") {
      router.push("/");
    }
  }, [router]);

  const tabs = [
    { key: "analytics", label: t("admin.analytics") },
    { key: "products", label: t("admin.productManagement") },
  ];

  const onTabChange = (key: string) => {
    setActiveTab(key);
  };

  if (getUserRole() !== "admin") {
    return null;
  }

  return (
    <Root className={classes.root}>
      <SideNavbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        title={t("admin.title")}
      />
      <Box className={classes.content}>
        {activeTab === "analytics" && <AnalyticsDashboard />}
        {activeTab === "products" && <ProductManagement />}
      </Box>
    </Root>
  );
}
