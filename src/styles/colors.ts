/**
 * Sistema de colores para la aplicación
 * Este archivo proporciona autocompletado y consistencia en el uso de colores
 */

export const colors = {
  primary: {
    50: "#f8f9fa",
    100: "#f1f3f4",
    200: "#e8eaed",
    300: "#dadce0",
    400: "#bdc1c6",
    500: "#9aa0a6",
    600: "#80868b",
    700: "#5f6368",
    800: "#3c4043",
    900: "#231f20",
    950: "#1a1a1a",
  },
  secondary: {
    50: "#fef7f9",
    100: "#fceef2",
    200: "#f9dce6",
    300: "#f5c2d4",
    400: "#f7b5cd",
    500: "#f19bb8",
    600: "#e87ba0",
    700: "#dc5a85",
    800: "#c94a6f",
    900: "#a63d5a",
    950: "#8a2f4a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
} as const;

/**
 * Tipos TypeScript para autocompletado
 */
export type ColorScale = keyof typeof colors.primary;
export type ColorName = keyof typeof colors;

/**
 * Utilidades para obtener colores
 */
export const getColor = (colorName: ColorName, scale: ColorScale = 500) => {
  return colors[colorName][scale];
};

/**
 * Clases de Tailwind CSS predefinidas para uso común
 */
export const colorClasses = {
  // Backgrounds
  bgPrimary: "bg-primary-500",
  bgPrimaryLight: "bg-primary-100",
  bgPrimaryDark: "bg-primary-900",
  bgSecondary: "bg-secondary-500",
  bgSecondaryLight: "bg-secondary-100",
  bgSecondaryDark: "bg-secondary-900",

  // Text colors
  textPrimary: "text-primary-900",
  textPrimaryLight: "text-primary-600",
  textSecondary: "text-secondary-700",
  textSecondaryLight: "text-secondary-500",

  // Border colors
  borderPrimary: "border-primary-300",
  borderSecondary: "border-secondary-300",

  // State colors
  bgSuccess: "bg-success-500",
  bgWarning: "bg-warning-500",
  bgError: "bg-error-500",
  textSuccess: "text-success-700",
  textWarning: "text-warning-700",
  textError: "text-error-700",
} as const;

/**
 * Ejemplos de uso:
 *
 * // En JSX con clases de Tailwind:
 * <div className="bg-primary-500 text-white">Contenido</div>
 * <button className="bg-secondary-400 hover:bg-secondary-500">Botón</button>
 *
 * // En JavaScript/TypeScript:
 * const primaryColor = getColor('primary', 500);
 * const secondaryColor = colors.secondary[400];
 *
 * // Con clases predefinidas:
 * <div className={colorClasses.bgPrimary}>Contenido</div>
 */
