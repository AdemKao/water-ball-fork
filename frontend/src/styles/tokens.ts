export const colors = {
  primary: {
    DEFAULT: "#F17500",
    hover: "#D96A00",
    light: "#FFF3E6",
  },
  heading: "#1B1B1F",
  paragraph: "#4B5563",
  background: {
    DEFAULT: "#FFFFFF",
    secondary: "#F9FAFB",
    tertiary: "#F3F4F6",
  },
  border: "#E5E7EB",
  white: "#FFFFFF",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const spacing = {
  container: "1280px",
  containerPadding: "1rem",
} as const;

export const borderRadius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const boxShadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

export const breakpoints = {
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, #F17500 0%, #FF9A3C 100%)",
  hero: "linear-gradient(180deg, #FFF3E6 0%, #FFFFFF 100%)",
} as const;

export const tokens = {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  boxShadow,
  breakpoints,
  gradients,
} as const;

export default tokens;
