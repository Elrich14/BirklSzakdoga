/**
 * Most colors here have been migrated into the MUI theme palette
 * (see frontend/kerian/theme.ts). Only `snackbar_success` and `googleBrand`
 * remain in active use:
 *   - snackbar_success: identical in both color schemes by spec
 *   - googleBrand: follows Google brand guidelines, do not theme
 *
 * Other keys are kept as a transitional safety net but should not be
 * imported in new code. Use theme.palette.kerian.* and theme.palette.admin.*
 * via the styled callback's ({ theme }) => ({...}) form.
 */
export const colors = {
  kerian_main: "#039c82",
  kerian_main_button_hover: "#00cfac",
  kerian_main_bg: "rgba(3, 156, 130, 0.12)",
  kerian_navbar: "#3d3d3d",
  admin_surface: "#1a1a1a",
  admin_input: "#222",
  admin_border: "#333",
  admin_border_light: "#444",
  admin_text_muted: "#888",
  admin_text_secondary: "#999",
  admin_text_light: "#ccc",
  admin_accent_purple: "#6366f1",
  danger: "#f44336",
  danger_bg: "rgba(244, 67, 54, 0.08)",
  danger_border: "rgba(244, 67, 54, 0.3)",
  warning_text: "#ffb74d",
  warning_bg: "rgba(255, 152, 0, 0.08)",
  warning_border: "rgba(255, 152, 0, 0.3)",
  overlay_muted: "rgba(136, 136, 136, 0.15)",
  overlay_hover_light: "rgba(255, 255, 255, 0.03)",
  snackbar_success: "#0f9d58",
  admin_checkbox_inactive: "#666",
  admin_overlay: "rgba(0, 0, 0, 0.7)",
  admin_overlay_hover: "rgba(0, 0, 0, 0.9)",
  white: "#f9f6ee", // Warm, yellowish off-white (ivory/eggshell) to reduce eye strain
};

export const boxShadows = {
  kerian_main_button_hover_shadow: "0 4px 8px rgba(0, 207, 172, 0.3)",
};

export const googleBrand = {
  buttonBackground: "#131314",
  buttonText: "#ffffff",
  buttonBorder: "#747775",
  buttonBackgroundHover: "#2d2d2d",
};
