/**
 * Robinhood Color Palette
 * Modern fintech aesthetic with clean black/white base and vibrant accents
 *
 * This app uses Robinhood's color system for a professional trading app feel
 */

export const RobinhoodPalette = {
  // Primary colors
  black: "#000000",
  white: "#FFFFFF",

  // Accent and functional colors
  brightGreen: "#5ac53a",
  redOrange: "#eb5d2a",
  robinNeon: "#c3f53c",
  lightYellow: "#f6c86a",

  // Dark theme greys
  darkGrey: "#0f1011",
  mediumGrey: "#2d2f31",
  lightGrey: "#3a3c3e",
  mutedGrey: "#6b6e72",

  // Light theme greys
  lightBackground: "#f8f9fa",
  lightSurface: "#ffffff",
  lightBorder: "#e1e4e8",
  lightDivider: "#eaedef",
  darkText: "#1a1a1a",
  mutedText: "#6e7781",
} as const;

/**
 * Dark Theme (Default)
 */
export const DarkTheme = {
  background: RobinhoodPalette.black,
  backgroundDark: RobinhoodPalette.darkGrey,
  surface: RobinhoodPalette.darkGrey,
  surfaceHighlight: RobinhoodPalette.mediumGrey,

  text: RobinhoodPalette.white,
  textSecondary: RobinhoodPalette.mutedGrey,
  textTertiary: RobinhoodPalette.mutedGrey,

  budgetRemaining: RobinhoodPalette.brightGreen,
  budgetExpected: RobinhoodPalette.mutedGrey,
  budgetSpent: RobinhoodPalette.white,
  budgetExceeded: RobinhoodPalette.redOrange,
  income: RobinhoodPalette.brightGreen,
  expense: RobinhoodPalette.redOrange,

  chartGreen: RobinhoodPalette.brightGreen,
  chartRed: RobinhoodPalette.redOrange,
  chartYellow: RobinhoodPalette.lightYellow,
  chartNeon: RobinhoodPalette.robinNeon,

  primary: RobinhoodPalette.brightGreen,
  secondary: RobinhoodPalette.lightYellow,
  accent: RobinhoodPalette.robinNeon,
  success: RobinhoodPalette.brightGreen,
  warning: RobinhoodPalette.lightYellow,
  error: RobinhoodPalette.redOrange,

  tabIconDefault: RobinhoodPalette.mutedGrey,
  tabIconSelected: RobinhoodPalette.robinNeon,
  tabBar: RobinhoodPalette.black,

  border: RobinhoodPalette.lightGrey,
  divider: RobinhoodPalette.mediumGrey,
  shadow: "rgba(0, 0, 0, 0.5)",

  indicatorGreen: RobinhoodPalette.brightGreen,
  indicatorRed: RobinhoodPalette.redOrange,

  blurTint: "dark" as "light" | "dark" | "default",
} as const;

/**
 * Light Theme
 */
export const LightTheme = {
  background: RobinhoodPalette.lightBackground,
  backgroundDark: RobinhoodPalette.lightSurface,
  surface: RobinhoodPalette.lightSurface,
  surfaceHighlight: RobinhoodPalette.lightBackground,

  text: RobinhoodPalette.darkText,
  textSecondary: RobinhoodPalette.mutedText,
  textTertiary: RobinhoodPalette.mutedGrey,

  budgetRemaining: RobinhoodPalette.brightGreen,
  budgetExpected: RobinhoodPalette.mutedText,
  budgetSpent: RobinhoodPalette.darkText,
  budgetExceeded: RobinhoodPalette.redOrange,
  income: RobinhoodPalette.brightGreen,
  expense: RobinhoodPalette.redOrange,

  chartGreen: RobinhoodPalette.brightGreen,
  chartRed: RobinhoodPalette.redOrange,
  chartYellow: RobinhoodPalette.lightYellow,
  chartNeon: RobinhoodPalette.robinNeon,

  primary: RobinhoodPalette.brightGreen,
  secondary: RobinhoodPalette.lightYellow,
  accent: RobinhoodPalette.robinNeon,
  success: RobinhoodPalette.brightGreen,
  warning: RobinhoodPalette.lightYellow,
  error: RobinhoodPalette.redOrange,

  tabIconDefault: RobinhoodPalette.mutedText,
  tabIconSelected: RobinhoodPalette.robinNeon,
  tabBar: RobinhoodPalette.lightSurface,

  border: "#d1d5db", // Darker border for better visibility on light background
  divider: "#d1d5db", // Darker divider for better visibility on light background
  shadow: "rgba(0, 0, 0, 0.1)",

  indicatorGreen: RobinhoodPalette.brightGreen,
  indicatorRed: RobinhoodPalette.redOrange,

  blurTint: "light" as "light" | "dark" | "default",
} as const;

// Export AppColors as default dark theme (can be swapped dynamically)
export let AppColors = DarkTheme;

// Export for backward compatibility with existing code
export default {
  light: AppColors, // iOS-first, using dark theme as primary
  dark: AppColors,
};
