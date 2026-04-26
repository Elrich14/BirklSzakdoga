"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";
import {
  disableTwoFactor,
  enableTwoFactor,
  fetchTwoFactorStatus,
  regenerateRecoveryCodes,
  setupTwoFactor,
  TwoFactorSetupResponse,
} from "@/api";
import { useSnackbar } from "../../providers/snackbarProvider";

const PREFIX = "TwoFactorSettings";

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  subtitle: `${PREFIX}-subtitle`,
  card: `${PREFIX}-card`,
  statusRow: `${PREFIX}-statusRow`,
  statusLabel: `${PREFIX}-statusLabel`,
  statusPill: `${PREFIX}-statusPill`,
  statusPillOn: `${PREFIX}-statusPillOn`,
  statusPillOff: `${PREFIX}-statusPillOff`,
  statusDot: `${PREFIX}-statusDot`,
  actionRow: `${PREFIX}-actionRow`,
  primaryButton: `${PREFIX}-primaryButton`,
  secondaryButton: `${PREFIX}-secondaryButton`,
  dangerButton: `${PREFIX}-dangerButton`,
  sectionLabel: `${PREFIX}-sectionLabel`,
  sectionBody: `${PREFIX}-sectionBody`,
  qrWrap: `${PREFIX}-qrWrap`,
  manualKey: `${PREFIX}-manualKey`,
  codeInput: `${PREFIX}-codeInput`,
  codeGrid: `${PREFIX}-codeGrid`,
  recoveryCode: `${PREFIX}-recoveryCode`,
  warningBanner: `${PREFIX}-warningBanner`,
  lowCodesBanner: `${PREFIX}-lowCodesBanner`,
  errorText: `${PREFIX}-errorText`,
  confirmCheckboxRow: `${PREFIX}-confirmCheckboxRow`,
  checkbox: `${PREFIX}-checkbox`,
  passwordRow: `${PREFIX}-passwordRow`,
  toggleButton: `${PREFIX}-toggleButton`,
  dialogBody: `${PREFIX}-dialogBody`,
  dialogField: `${PREFIX}-dialogField`,
  dialogHint: `${PREFIX}-dialogHint`,
  dialogPaper: `${PREFIX}-dialogPaper`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  dialogActions: `${PREFIX}-dialogActions`,
  manualKeySpacer: `${PREFIX}-manualKeySpacer`,
  codeInputWrap: `${PREFIX}-codeInputWrap`,
  loadingSpinner: `${PREFIX}-loadingSpinner`,
};

const MONO_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "640px",
  },
  [`& .${classes.header}`]: {
    fontSize: "20px",
    fontWeight: 600,
    color: theme.palette.text.primary,
    margin: 0,
  },
  [`& .${classes.subtitle}`]: {
    fontSize: "13px",
    color: theme.palette.admin.textMuted,
    marginTop: "-8px",
  },
  [`& .${classes.card}`]: {
    backgroundColor: theme.palette.admin.surface,
    border: `1px solid ${theme.palette.admin.border}`,
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  [`& .${classes.statusRow}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.statusLabel}`]: {
    fontSize: "14px",
    color: theme.palette.admin.textLight,
  },
  [`& .${classes.statusPill}`]: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  [`& .${classes.statusPillOn}`]: {
    backgroundColor: theme.palette.kerian.bg,
    color: theme.palette.kerian.main,
  },
  [`& .${classes.statusPillOff}`]: {
    backgroundColor: theme.palette.kerian.overlayMuted,
    color: theme.palette.admin.textMuted,
  },
  [`& .${classes.statusDot}`]: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  [`& .${classes.actionRow}`]: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  [`& .${classes.primaryButton}`]: {
    backgroundColor: theme.palette.kerian.main,
    color: "#ffffff",
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: theme.palette.kerian.hover,
      boxShadow: "none",
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.admin.border,
      color: theme.palette.admin.textMuted,
    },
  },
  [`& .${classes.secondaryButton}`]: {
    borderColor: theme.palette.admin.borderLight,
    color: theme.palette.admin.textLight,
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    "&:hover": {
      borderColor: theme.palette.kerian.main,
      backgroundColor: theme.palette.kerian.bg,
    },
  },
  [`& .${classes.dangerButton}`]: {
    borderColor: theme.palette.kerian.dangerBorder,
    color: theme.palette.error.main,
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    "&:hover": {
      borderColor: theme.palette.error.main,
      backgroundColor: theme.palette.kerian.dangerBg,
    },
  },
  [`& .${classes.sectionLabel}`]: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: theme.palette.admin.textMuted,
  },
  [`& .${classes.sectionBody}`]: {
    fontSize: "13px",
    color: theme.palette.admin.textLight,
    lineHeight: 1.6,
  },
  [`& .${classes.qrWrap}`]: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "8px",
    width: "fit-content",
    lineHeight: 0,
  },
  [`& .${classes.manualKey}`]: {
    fontFamily: MONO_STACK,
    fontSize: "13px",
    letterSpacing: "1.5px",
    wordBreak: "break-all",
    padding: "10px 12px",
    backgroundColor: theme.palette.admin.input,
    border: `1px solid ${theme.palette.admin.border}`,
    borderRadius: "6px",
    color: theme.palette.text.primary,
    textAlign: "center",
  },
  [`& .${classes.codeInput}`]: {
    maxWidth: "240px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.admin.input,
    },
    "& input": {
      fontFamily: MONO_STACK,
      fontSize: "20px",
      letterSpacing: "8px",
      textAlign: "center",
      padding: "12px",
      color: theme.palette.text.primary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.borderLight,
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.kerian.main,
    },
  },
  [`& .${classes.codeGrid}`]: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "6px",
    padding: "12px",
    backgroundColor: theme.palette.admin.input,
    border: `1px solid ${theme.palette.admin.border}`,
    borderRadius: "8px",
  },
  [`& .${classes.recoveryCode}`]: {
    fontFamily: MONO_STACK,
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 6px",
    textAlign: "center",
    letterSpacing: "2px",
    color: theme.palette.text.primary,
    borderRadius: "4px",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: theme.palette.kerian.overlayHoverLight,
    },
  },
  [`& .${classes.warningBanner}`]: {
    padding: "10px 14px",
    backgroundColor: theme.palette.kerian.dangerBg,
    border: `1px solid ${theme.palette.kerian.dangerBorder}`,
    borderRadius: "8px",
    fontSize: "12px",
    color: theme.palette.admin.textLight,
    lineHeight: 1.6,
  },
  [`& .${classes.lowCodesBanner}`]: {
    padding: "10px 14px",
    backgroundColor: theme.palette.kerian.warningBg,
    border: `1px solid ${theme.palette.kerian.warningBorder}`,
    borderRadius: "8px",
    fontSize: "12px",
    color: theme.palette.warning.main,
    lineHeight: 1.6,
  },
  [`& .${classes.errorText}`]: {
    color: theme.palette.error.main,
    fontSize: "12px",
    marginTop: "4px",
  },
  [`& .${classes.confirmCheckboxRow}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: theme.palette.admin.textLight,
    cursor: "pointer",
    userSelect: "none",
  },
  [`& .${classes.checkbox}`]: {
    accentColor: theme.palette.kerian.main,
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  [`& .${classes.passwordRow}`]: {
    position: "relative",
  },
  [`& .${classes.toggleButton}`]: {
    position: "absolute",
    right: "8px",
    top: "55%",
    transform: "translateY(-50%)",
    color: theme.palette.admin.textMuted,
  },
  [`& .${classes.dialogBody}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "8px",
  },
  [`& .${classes.dialogField}`]: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.admin.input,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.borderLight,
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.kerian.main,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.kerian.main,
    },
  },
  [`& .${classes.dialogHint}`]: {
    fontSize: "13px",
    color: theme.palette.admin.textLight,
    lineHeight: 1.6,
  },
  [`& .${classes.manualKeySpacer}`]: {
    marginTop: "6px",
  },
  [`& .${classes.codeInputWrap}`]: {
    marginTop: "8px",
  },
  [`& .${classes.loadingSpinner}`]: {
    color: theme.palette.kerian.main,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.dialogPaper}`]: {
    backgroundColor: theme.palette.admin.surface,
    border: `1px solid ${theme.palette.admin.border}`,
    borderRadius: "12px",
    color: theme.palette.text.primary,
  },
  [`& .${classes.dialogTitle}`]: {
    fontSize: "16px",
    fontWeight: 600,
  },
  [`& .${classes.dialogBody}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "8px",
  },
  [`& .${classes.dialogHint}`]: {
    fontSize: "13px",
    color: theme.palette.admin.textLight,
    lineHeight: 1.6,
  },
  [`& .${classes.dialogActions}`]: {
    padding: "12px 20px 16px",
  },
  [`& .${classes.dialogField}`]: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.admin.input,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.admin.borderLight,
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.kerian.main,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.kerian.main,
    },
  },
  [`& .${classes.errorText}`]: {
    color: theme.palette.error.main,
    fontSize: "12px",
    marginTop: "4px",
  },
  [`& .${classes.passwordRow}`]: {
    position: "relative",
  },
  [`& .${classes.toggleButton}`]: {
    position: "absolute",
    right: "8px",
    top: "55%",
    transform: "translateY(-50%)",
    color: theme.palette.admin.textMuted,
  },
  [`& .${classes.primaryButton}`]: {
    backgroundColor: theme.palette.kerian.main,
    color: "#ffffff",
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: theme.palette.kerian.hover,
      boxShadow: "none",
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.admin.border,
      color: theme.palette.admin.textMuted,
    },
  },
  [`& .${classes.secondaryButton}`]: {
    borderColor: theme.palette.admin.borderLight,
    color: theme.palette.admin.textLight,
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    "&:hover": {
      borderColor: theme.palette.kerian.main,
      backgroundColor: theme.palette.kerian.bg,
    },
  },
  [`& .${classes.dangerButton}`]: {
    borderColor: theme.palette.kerian.dangerBorder,
    color: theme.palette.error.main,
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 18px",
    "&:hover": {
      borderColor: theme.palette.error.main,
      backgroundColor: theme.palette.kerian.dangerBg,
    },
  },
}));

type EnrollState =
  | { step: "idle" }
  | { step: "setup"; setupData: TwoFactorSetupResponse }
  | { step: "recoveryCodes"; codes: string[] };

type DisableDialogState =
  | { open: false }
  | {
      open: true;
      password: string;
      code: string;
      showPassword: boolean;
      error: string;
      busy: boolean;
    };

type RegenerateDialogState =
  | { open: false }
  | { open: true; code: string; error: string; busy: boolean };

export default function TwoFactorSettings() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["twoFactorStatus"],
    queryFn: fetchTwoFactorStatus,
  });

  const [enrollState, setEnrollState] = useState<EnrollState>({ step: "idle" });
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupBusy, setSetupBusy] = useState(false);
  const [codesSavedChecked, setCodesSavedChecked] = useState(false);
  const [disableDialog, setDisableDialog] = useState<DisableDialogState>({
    open: false,
  });
  const [regenerateDialog, setRegenerateDialog] =
    useState<RegenerateDialogState>({ open: false });

  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
  };

  const onStartSetup = async () => {
    setSetupError("");
    setSetupBusy(true);
    try {
      const setupData = await setupTwoFactor();
      setEnrollState({ step: "setup", setupData });
      setSetupCode("");
    } catch {
      showSnackbar(t("admin.security.errorStartSetup"), "error");
    } finally {
      setSetupBusy(false);
    }
  };

  const onConfirmEnable = async () => {
    if (enrollState.step !== "setup") return;
    setSetupError("");
    setSetupBusy(true);
    try {
      const { recoveryCodes } = await enableTwoFactor(setupCode);
      setEnrollState({ step: "recoveryCodes", codes: recoveryCodes });
      setCodesSavedChecked(false);
      refreshStatus();
      showSnackbar(t("admin.security.enableSuccess"), "success");
    } catch (err) {
      setSetupError((err as Error).message || t("admin.security.invalidCode"));
    } finally {
      setSetupBusy(false);
    }
  };

  const onCancelSetup = () => {
    setEnrollState({ step: "idle" });
    setSetupCode("");
    setSetupError("");
  };

  const onFinishRecoveryCodes = () => {
    setEnrollState({ step: "idle" });
    setCodesSavedChecked(false);
  };

  const onCopyCodes = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join("\n"));
    showSnackbar(t("admin.security.codesCopied"), "success");
  };

  const onDownloadCodes = (codes: string[]) => {
    const content = `Kerian 2FA Recovery Codes\n\n${codes.join("\n")}\n\nKeep these codes safe. Each code can be used only once.\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kerian-recovery-codes.txt";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const openDisableDialog = () => {
    setDisableDialog({
      open: true,
      password: "",
      code: "",
      showPassword: false,
      error: "",
      busy: false,
    });
  };

  const onDisableSubmit = async () => {
    if (!disableDialog.open) return;
    setDisableDialog({ ...disableDialog, error: "", busy: true });
    try {
      await disableTwoFactor(disableDialog.password, disableDialog.code);
      setDisableDialog({ open: false });
      refreshStatus();
      showSnackbar(t("admin.security.disableSuccess"), "success");
    } catch (err) {
      setDisableDialog({
        ...disableDialog,
        error: (err as Error).message || t("admin.security.invalidCode"),
        busy: false,
      });
    }
  };

  const openRegenerateDialog = () => {
    setRegenerateDialog({
      open: true,
      code: "",
      error: "",
      busy: false,
    });
  };

  const onRegenerateSubmit = async () => {
    if (!regenerateDialog.open) return;
    setRegenerateDialog({ ...regenerateDialog, error: "", busy: true });
    try {
      const { recoveryCodes } = await regenerateRecoveryCodes(
        regenerateDialog.code
      );
      setRegenerateDialog({ open: false });
      setEnrollState({ step: "recoveryCodes", codes: recoveryCodes });
      setCodesSavedChecked(false);
      refreshStatus();
      showSnackbar(t("admin.security.regenerateSuccess"), "success");
    } catch (err) {
      setRegenerateDialog({
        ...regenerateDialog,
        error: (err as Error).message || t("admin.security.invalidCode"),
        busy: false,
      });
    }
  };

  const renderIdleState = () => {
    if (!statusQuery.data) return null;
    const { enabled, remainingRecoveryCodes } = statusQuery.data;

    return (
      <>
        <Box className={classes.card}>
          <Box className={classes.statusRow}>
            <Typography className={classes.statusLabel}>
              {t("admin.security.status")}
            </Typography>
            <Box
              className={`${classes.statusPill} ${
                enabled ? classes.statusPillOn : classes.statusPillOff
              }`}
            >
              <Box className={classes.statusDot} />
              {enabled
                ? t("admin.security.enabled")
                : t("admin.security.disabled")}
            </Box>
          </Box>

          <Box className={classes.actionRow}>
            {!enabled && (
              <Button
                variant="contained"
                onClick={onStartSetup}
                disabled={setupBusy}
                className={classes.primaryButton}
              >
                {setupBusy ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  t("admin.security.enable")
                )}
              </Button>
            )}
            {enabled && (
              <>
                <Button
                  variant="outlined"
                  onClick={openDisableDialog}
                  className={classes.dangerButton}
                >
                  {t("admin.security.disable")}
                </Button>
                <Button
                  variant="outlined"
                  onClick={openRegenerateDialog}
                  className={classes.secondaryButton}
                >
                  {t("admin.security.regenerate")}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {enabled && remainingRecoveryCodes <= 2 && (
          <Typography className={classes.lowCodesBanner}>
            {t("admin.security.lowRecoveryCodes", {
              count: remainingRecoveryCodes,
            })}
          </Typography>
        )}
      </>
    );
  };

  const renderSetupState = () => {
    if (enrollState.step !== "setup") return null;
    const { qrCodeDataUrl, manualEntryKey } = enrollState.setupData;

    return (
      <Box className={classes.card}>
        <Box>
          <Typography className={classes.sectionLabel}>
            {t("admin.security.scanQr")}
          </Typography>
        </Box>

        <Box className={classes.qrWrap}>
          <Image
            src={qrCodeDataUrl}
            alt="2FA QR code"
            width={180}
            height={180}
            unoptimized
          />
        </Box>

        <Box>
          <Typography className={classes.sectionLabel}>
            {t("admin.security.manualEntry")}
          </Typography>
          <Typography
            className={`${classes.manualKey} ${classes.manualKeySpacer}`}
          >
            {manualEntryKey}
          </Typography>
        </Box>

        <Box>
          <Typography className={classes.sectionLabel}>
            {t("admin.security.enterCode")}
          </Typography>
          <Box className={classes.codeInputWrap}>
            <TextField
              value={setupCode}
              onChange={(event) =>
                setSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              variant="outlined"
              placeholder="••••••"
              className={classes.codeInput}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </Box>
          {setupError && (
            <Typography className={classes.errorText}>{setupError}</Typography>
          )}
        </Box>

        <Box className={classes.actionRow}>
          <Button
            variant="contained"
            onClick={onConfirmEnable}
            disabled={setupCode.length !== 6 || setupBusy}
            className={classes.primaryButton}
          >
            {setupBusy ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              t("admin.security.verify")
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancelSetup}
            className={classes.secondaryButton}
          >
            {t("common.cancel")}
          </Button>
        </Box>
      </Box>
    );
  };

  const renderRecoveryCodesState = () => {
    if (enrollState.step !== "recoveryCodes") return null;
    const { codes } = enrollState;

    return (
      <Box className={classes.card}>
        <Typography className={classes.warningBanner}>
          {t("admin.security.saveCodesWarning")}
        </Typography>

        <Box className={classes.codeGrid}>
          {codes.map((code) => (
            <Typography key={code} className={classes.recoveryCode}>
              {code}
            </Typography>
          ))}
        </Box>

        <Box className={classes.actionRow}>
          <Button
            variant="outlined"
            onClick={() => onCopyCodes(codes)}
            className={classes.secondaryButton}
          >
            {t("admin.security.copyAll")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => onDownloadCodes(codes)}
            className={classes.secondaryButton}
          >
            {t("admin.security.downloadCodes")}
          </Button>
        </Box>

        <Box
          component="label"
          htmlFor="codes-saved"
          className={classes.confirmCheckboxRow}
        >
          <input
            type="checkbox"
            id="codes-saved"
            checked={codesSavedChecked}
            onChange={(event) => setCodesSavedChecked(event.target.checked)}
            className={classes.checkbox}
          />
          {t("admin.security.savedConfirmation")}
        </Box>

        <Box className={classes.actionRow}>
          <Button
            variant="contained"
            onClick={onFinishRecoveryCodes}
            disabled={!codesSavedChecked}
            className={classes.primaryButton}
          >
            {t("admin.security.done")}
          </Button>
        </Box>
      </Box>
    );
  };

  if (statusQuery.isLoading) {
    return (
      <Root className={classes.root}>
        <CircularProgress size={24} className={classes.loadingSpinner} />
      </Root>
    );
  }

  return (
    <Root className={classes.root}>
      <Typography className={classes.header}>
        {t("admin.security.title")}
      </Typography>

      {enrollState.step === "idle" && renderIdleState()}
      {enrollState.step === "setup" && renderSetupState()}
      {enrollState.step === "recoveryCodes" && renderRecoveryCodesState()}

      <StyledDialog
        open={disableDialog.open}
        onClose={() =>
          disableDialog.open &&
          !disableDialog.busy &&
          setDisableDialog({ open: false })
        }
        slotProps={{ paper: { className: classes.dialogPaper } }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {t("admin.security.disableDialogTitle")}
        </DialogTitle>
        <DialogContent className={classes.dialogBody}>
          {disableDialog.open && (
            <>
              <Box className={classes.passwordRow}>
                <TextField
                  label={t("common.password")}
                  value={disableDialog.password}
                  onChange={(event) =>
                    setDisableDialog({
                      ...disableDialog,
                      password: event.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                  type={disableDialog.showPassword ? "text" : "password"}
                  fullWidth
                  className={classes.dialogField}
                />
                <IconButton
                  onClick={() =>
                    setDisableDialog({
                      ...disableDialog,
                      showPassword: !disableDialog.showPassword,
                    })
                  }
                  size="small"
                  disableRipple
                  className={classes.toggleButton}
                >
                  {disableDialog.showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </Box>

              <TextField
                label={t("admin.security.codeOrRecovery")}
                value={disableDialog.code}
                onChange={(event) =>
                  setDisableDialog({
                    ...disableDialog,
                    code: event.target.value.toUpperCase(),
                  })
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="123456 / XXXX-XXXX"
                className={classes.dialogField}
              />
              {disableDialog.error && (
                <Typography className={classes.errorText}>
                  {disableDialog.error}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={() => setDisableDialog({ open: false })}
            disabled={disableDialog.open && disableDialog.busy}
            className={classes.secondaryButton}
            variant="outlined"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onDisableSubmit}
            variant="outlined"
            disabled={
              !disableDialog.open ||
              disableDialog.busy ||
              !disableDialog.password ||
              !disableDialog.code
            }
            className={classes.dangerButton}
          >
            {disableDialog.open && disableDialog.busy ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              t("admin.security.disable")
            )}
          </Button>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        open={regenerateDialog.open}
        onClose={() =>
          regenerateDialog.open &&
          !regenerateDialog.busy &&
          setRegenerateDialog({ open: false })
        }
        slotProps={{ paper: { className: classes.dialogPaper } }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {t("admin.security.regenerateDialogTitle")}
        </DialogTitle>
        <DialogContent className={classes.dialogBody}>
          {regenerateDialog.open && (
            <>
              <Typography className={classes.dialogHint}>
                {t("admin.security.regenerateWarning")}
              </Typography>
              <TextField
                label={t("admin.security.enterCode")}
                value={regenerateDialog.code}
                onChange={(event) =>
                  setRegenerateDialog({
                    ...regenerateDialog,
                    code: event.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="123456"
                inputMode="numeric"
                className={classes.dialogField}
              />
              {regenerateDialog.error && (
                <Typography className={classes.errorText}>
                  {regenerateDialog.error}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={() => setRegenerateDialog({ open: false })}
            disabled={regenerateDialog.open && regenerateDialog.busy}
            className={classes.secondaryButton}
            variant="outlined"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onRegenerateSubmit}
            disabled={
              !regenerateDialog.open ||
              regenerateDialog.busy ||
              regenerateDialog.code.length !== 6
            }
            className={classes.primaryButton}
            variant="contained"
          >
            {regenerateDialog.open && regenerateDialog.busy ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              t("admin.security.regenerate")
            )}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Root>
  );
}
