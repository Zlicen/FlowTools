import { useState } from "react";

function Card({ children, selected = false, clickable = false, style, onClick, ...props }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      {...props}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        ...styles.card,
        ...(selected ? styles.selected : {}),
        ...(clickable && isHovering ? styles.hover : {}),
        cursor: clickable ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#181818",
    border: "1px solid #2d2d2d",
    borderRadius: "12px",
    padding: "18px",
    boxSizing: "border-box",
  },

  selected: {
    borderColor: "#5b35ff",
  },

  hover: {
    backgroundColor: "#202020",
    borderColor: "#3a3a3a",
  },
};

export default Card;
