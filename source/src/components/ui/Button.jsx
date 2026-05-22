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
    backgroundColor: "#353535",
    color: "white",
  },
  darkHover: {
    backgroundColor: "#424242",
  },
  purple: {
    backgroundColor: "#5b35ff",
    color: "white",
  },
  purpleHover: {
    backgroundColor: "#6845ff",
  },
  green: {
    backgroundColor: "#2f8f46",
    color: "white",
  },
  greenHover: {
    backgroundColor: "#36a852",
  },
  red: {
    backgroundColor: "#5a1f1f",
    color: "white",
  },
  redHover: {
    backgroundColor: "#702828",
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
    create: shared.dark,
    add: shared.dark,
    import: shared.purple,
    sync: shared.purple,
    rename: shared.dark,
    cancel: shared.dark,
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
    create: shared.darkHover,
    add: shared.darkHover,
    import: shared.purpleHover,
    sync: shared.purpleHover,
    rename: shared.darkHover,
    cancel: shared.darkHover,
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
