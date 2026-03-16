"use client";

import { styled } from "@mui/system";
import { List, ListItemButton, ListItemText, Box } from "@mui/material";
import { colors } from "@/constants/colors";

interface SideNavbarTab {
  key: string;
  label: string;
}

interface SideNavbarProps {
  tabs: SideNavbarTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  title?: string;
}

const PREFIX = "SideNavbar";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  list: `${PREFIX}-list`,
  listItem: `${PREFIX}-listItem`,
  activeItem: `${PREFIX}-activeItem`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    width: "260px",
    minHeight: "calc(100vh - 60px)",
    backgroundColor: "#111111",
    borderRight: `1px solid ${colors.admin_border}`,
    display: "flex",
    flexDirection: "column",
    paddingTop: "16px",
  },
  [`& .${classes.title}`]: {
    color: colors.kerian_main,
    fontSize: "20px",
    fontWeight: 700,
    padding: "8px 24px 16px",
    letterSpacing: "0.5px",
  },
  [`& .${classes.list}`]: {
    padding: "0 8px",
  },
  [`& .${classes.listItem}`]: {
    borderRadius: "8px",
    marginBottom: "4px",
    color: colors.admin_text_light,
    "&:hover": {
      backgroundColor: colors.admin_surface,
      color: "#fff",
    },
  },
  [`& .${classes.activeItem}`]: {
    borderRadius: "8px",
    marginBottom: "4px",
    backgroundColor: `${colors.kerian_main}22`,
    color: colors.kerian_main,
    "&:hover": {
      backgroundColor: `${colors.kerian_main}33`,
    },
  },
}));

export default function SideNavbar({
  tabs,
  activeTab,
  onTabChange,
  title,
}: SideNavbarProps) {
  return (
    <Root className={classes.root}>
      {title && <Box className={classes.title}>{title}</Box>}
      <List className={classes.list}>
        {tabs.map((tab) => (
          <ListItemButton
            key={tab.key}
            className={
              activeTab === tab.key ? classes.activeItem : classes.listItem
            }
            onClick={() => onTabChange(tab.key)}
          >
            <ListItemText primary={tab.label} />
          </ListItemButton>
        ))}
      </List>
    </Root>
  );
}
