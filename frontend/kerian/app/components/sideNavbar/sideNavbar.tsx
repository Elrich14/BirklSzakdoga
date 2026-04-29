"use client";

import { styled } from "@mui/material";
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
    borderRight: `1px solid ${theme.vars?.palette.admin.border}`,
    display: "flex",
    flexDirection: "column",
    paddingTop: "16px",
    backgroundColor: (theme.vars || theme).palette.background.paper,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      minHeight: "auto",
      borderRight: "none",
      borderBottom: `1px solid ${theme.vars?.palette.admin.border}`,
      paddingTop: "8px",
    },
  },
  [`& .${classes.title}`]: {
    color: theme.vars?.palette.kerian.main,
    fontSize: "20px",
    fontWeight: 700,
    padding: "8px 24px 16px",
    letterSpacing: "0.5px",
    [theme.breakpoints.down("md")]: {
      fontSize: "16px",
      padding: "4px 16px 8px",
    },
  },
  [`& .${classes.list}`]: {
    padding: "0 8px",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      padding: "0 8px 8px",
      gap: "4px",
    },
  },
  [`& .${classes.listItem}`]: {
    borderRadius: "8px",
    marginBottom: "4px",
    [theme.breakpoints.down("md")]: {
      marginBottom: 0,
      flexShrink: 0,
      whiteSpace: "nowrap",
    },
  },
  [`& .${classes.activeItem}`]: {
    borderRadius: "8px",
    marginBottom: "4px",
    backgroundColor: theme.vars?.palette.kerian.bg,
    color: theme.vars?.palette.kerian.main,
    [theme.breakpoints.down("md")]: {
      marginBottom: 0,
      flexShrink: 0,
      whiteSpace: "nowrap",
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
