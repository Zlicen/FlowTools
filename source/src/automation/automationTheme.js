export const automationTheme = {
  backgroundColor: "#111111",

  panelColor: "#181818",
  borderColor: "#2a2a2a",

  blockColor: "#26231d",

  // Objects
  objectColor: "#1f6f3f",
  targetColor: "#1f6f3f", // keep temporarily for compatibility

  // Actions
  actionColor: "#5a2626",

  // Keep temporarily
  conditionColor: "#3a3115",

  moduleColor: "#333333",

  accentColor: "#7357ff",

  categoryColors: {
    objects: "#1f6f3f",
    targets: "#1f6f3f",      // compatibility
    conditions: "#3a3115",   // compatibility
    actions: "#5a2626",
  },
};

export function getReadableTextColor(backgroundColor) {
  const safeColor =
    typeof backgroundColor === "string" &&
    backgroundColor.trim()
      ? backgroundColor
      : "#333333";

  const hex =
    safeColor.replace("#", "");

  if (hex.length !== 6)
    return "white";

  const r = parseInt(
    hex.slice(0, 2),
    16
  );

  const g = parseInt(
    hex.slice(2, 4),
    16
  );

  const b = parseInt(
    hex.slice(4, 6),
    16
  );

  const brightness =
    (r * 299 +
      g * 587 +
      b * 114) /
    1000;

  return brightness > 150
    ? "#111"
    : "white";
}