import { useState } from "react";

function IconButton({
  children,
  active = false,
  danger = false,
  variant = "default",
  disabled = false,
  title,
  onClick,
  onMouseDown,
  style,
  size = 32,
  type = "button",
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false);
  const resolvedVariant = danger ? "delete" : variant;
  const variantStyle = getVariantStyle(resolvedVariant, active, isHovering);

  return (
    <button
      {...props}
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        ...styles.base,
        width: `${size}px`,
        height: `${size}px`,
        ...variantStyle,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function getVariantStyle(variant, active, isHovering) {
  if (active || variant === "edit" || variant === "sync" || variant === "import") {
    return {
      backgroundColor: isHovering ? "#6845ff" : "#5b35ff",
      color: "white",
      borderColor: "#5b35ff",
    };
  }

  if (variant === "run" || variant === "save") {
    return {
      backgroundColor: isHovering ? "#36a852" : "#2f8f46",
      color: "white",
      borderColor: "#2f8f46",
    };
  }

  if (variant === "delete") {
    return {
      backgroundColor: isHovering ? "#702828" : "#5a1f1f",
      color: "white",
      borderColor: "#5a1f1f",
    };
  }

  return {
    backgroundColor: isHovering ? "#424242" : "#353535",
    color: "white",
    borderColor: "#353535",
  };
}

const styles = {
  base: {
    border: "1px solid #353535",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    userSelect: "none",
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.15s ease",
  },
};

export default IconButton;
