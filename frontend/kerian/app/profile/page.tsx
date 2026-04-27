"use client";

import { Box } from "@mui/material";
import { styled } from "@mui/material";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import SideNavbar from "../components/sideNavbar/sideNavbar";
import { getUserRole } from "../utils/auth";
import AccountInfoTab from "./components/accountInfoTab";
import MyOrdersTab from "./components/myOrdersTab";
import SettingsTab from "./components/settingsTab";

const PREFIX = "ProfilePage";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "row",
    minHeight: "calc(100vh - 60px)",
  },
  [`& .${classes.content}`]: {
    flex: 1,
    overflow: "auto",
    padding: "24px",
  },
}));

type TabKey = "account" | "orders" | "settings";
const VALID_TABS: TabKey[] = ["account", "orders", "settings"];

function ProfileContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab: TabKey =
    rawTab && VALID_TABS.includes(rawTab as TabKey)
      ? (rawTab as TabKey)
      : "account";

  useEffect(() => {
    if (getUserRole() === "guest") {
      router.push("/login");
    }
  }, [router]);

  if (getUserRole() === "guest") {
    return null;
  }

  const onTabChange = (key: string) => {
    router.push(`/profile?tab=${key}`);
  };

  const tabs = [
    { key: "account", label: t("profile.tabs.account") },
    { key: "orders", label: t("profile.tabs.orders") },
    { key: "settings", label: t("profile.tabs.settings") },
  ];

  return (
    <Root className={classes.root}>
      <SideNavbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        title={t("profile.title")}
      />
      <Box className={classes.content}>
        {activeTab === "account" && <AccountInfoTab />}
        {activeTab === "orders" && <MyOrdersTab />}
        {activeTab === "settings" && <SettingsTab />}
      </Box>
    </Root>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
