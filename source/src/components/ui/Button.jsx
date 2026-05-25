import { useState } from "react";

function Button({
  children,
  variant = "default",
  size = "md",
  fullWidth = false,
  disabled = false,
  title,
  onClick,
  onMouseDown,
  style,
  type = "button",
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false);

  const variantStyle = styles.variants[variant] || styles.variants.default;
  const hoverStyle = styles.hover[variant] || styles.hover.default;
  const sizeStyle = styles.sizes[size] || styles.sizes.md;

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
        ...variantStyle,
        ...(isHovering && !disabled ? hoverStyle : {}),
        ...sizeStyle,
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const shared = {
  dark: {
    backgroundColor: "#525252",
    color: "white",
  },

  darkHover: {
    backgroundColor: "#666666",
  },

  purple: {
    backgroundColor: "#5b35ff",
    color: "white",
  },

  purpleHover: {
    backgroundColor: "#6f50ff",
  },

  green: {
    backgroundColor: "#15803d",
    color: "white",
  },

  greenHover: {
    backgroundColor: "#16a34a",
  },

  amber: {
    backgroundColor: "#a16207",
    color: "white",
  },

  amberHover: {
    backgroundColor: "#c27a0a",
  },

  blue: {
    backgroundColor: "#1d4ed8",
    color: "white",
  },

  blueHover: {
    backgroundColor: "#2563eb",
  },

  red: {
    backgroundColor: "#991b1b",
    color: "white",
  },

  redHover: {
    backgroundColor: "#b91c1c",
  },
};

const styles = {
  base: {
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    userSelect: "none",
    whiteSpace: "nowrap",
    transition:
      "background-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease",
  },

  variants: {
    default: shared.dark,
    ghost: shared.dark,
    subtle: shared.dark,

    primary: shared.purple,
    success: shared.green,
    danger: shared.red,

    // Semantic action variants. Use these everywhere so the same action
    // always looks the same across Automation, Media, Sidebar, etc.
    edit: shared.purple,
    run: shared.green,
    save: shared.green,
    create: shared.green,
    add: shared.green,
    import: shared.blue,
    export: shared.blue,
    sync: shared.amber,
    keybind: shared.amber,
    rename: shared.dark,
    delete: shared.red,
  },

  hover: {
    default: shared.darkHover,
    ghost: shared.darkHover,
    subtle: shared.darkHover,

    primary: shared.purpleHover,
    success: shared.greenHover,
    danger: shared.redHover,

    edit: shared.purpleHover,
    run: shared.greenHover,
    save: shared.greenHover,
    create: shared.greenHover,
    add: shared.greenHover,
    import: shared.blueHover,
    export: shared.blueHover,
    sync: shared.amberHover,
    keybind: shared.amberHover,
    rename: shared.darkHover,
    delete: shared.redHover,
  },

  sizes: {
    xs: {
      minHeight: "26px",
      padding: "6px 9px",
      fontSize: "11px",
      borderRadius: "8px",
    },

    sm: {
      minHeight: "34px",
      padding: "9px 14px",
      fontSize: "13px",
    },

    md: {
      minHeight: "40px",
      padding: "12px 16px",
      fontSize: "14px",
    },

    lg: {
      minHeight: "46px",
      padding: "14px 20px",
      fontSize: "15px",
    },
  },
};

export default Button;
