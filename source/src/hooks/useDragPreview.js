export function getDragPreviewStyle(isDragging) {
  return {
    opacity: 1,
    transform: isDragging ? "scale(1.015)" : "scale(1)",
    boxShadow: isDragging ? "0 12px 28px rgba(0, 0, 0, 0.28)" : undefined,
    zIndex: isDragging ? 10 : 1,
    position: "relative",
    transition:
      "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease",
  };
}

export function getReorderDropLineStyle(visible, orientation = "vertical") {
  if (!visible) return { display: "none" };

  if (orientation === "horizontal") {
    return {
      width: "3px",
      alignSelf: "stretch",
      borderRadius: "99px",
      backgroundColor: "#7357ff",
      boxShadow: "0 0 12px rgba(115, 87, 255, 0.75)",
    };
  }

  return {
    height: "3px",
    borderRadius: "99px",
    backgroundColor: "#7357ff",
    boxShadow: "0 0 12px rgba(115, 87, 255, 0.75)",
  };
}
