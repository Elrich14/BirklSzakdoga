"use client";

import { styled } from "@mui/system";
import { List, ListItemButton, ListItemText, Box } from "@mui/material";

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

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "260px",
    minHeight: "calc(100vh - 60px)",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.admin.border}`,
    display: "flex",
    flexDirection: "column",
    paddingTop: "16px",
  },
  [`& .${classes.title}`]: {
    color: theme.palette.kerian.main,
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
    color: theme.palette.admin.textLight,
    "&:hover": {
      backgroundColor: theme.palette.admin.surface,
      color: theme.palette.text.primary,
    },
  },
  [`& .${classes.activeItem}`]: {
    borderRadius: "8px",
    marginBottom: "4px",
    backgroundColor: theme.palette.kerian.bg,
    color: theme.palette.kerian.main,
    "&:hover": {
      backgroundColor: theme.palette.kerian.bg,
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
