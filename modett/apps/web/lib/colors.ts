// Color mapping for common color names to hex codes
export const COLOR_MAP: Record<string, string> = {
  "terracotta clay": "#C78869",
  "brushed gold": "#C1AB85",
  "sage green": "#8FA89A",
  "dusty blue": "#9EAFB0",
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  yellow: "#CA8A04",
  purple: "#9333EA",
  pink: "#EC4899",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#6B7280",
  brown: "#92400E",
  beige: "#D4C4A8",
  navy: "#1E3A8A",
  cream: "#F5F5DC",
};

export const getColorHex = (colorName: string | undefined): string => {
  if (!colorName) return "#CCCCCC";
  const normalizedName = colorName.toLowerCase().trim();

  if (colorName.startsWith("#")) return colorName;

  return COLOR_MAP[normalizedName] || "#CCCCCC";
};
