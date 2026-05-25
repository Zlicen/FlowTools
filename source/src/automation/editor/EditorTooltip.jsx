import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { styles } from "./automationEditorStyles";

function InfoIcon({ text }) {
  if (!text) return null;

  return (
    <SmartTooltip content={text}>
      <span style={styles.infoIcon}>i</span>
    </SmartTooltip>
  );
}

function WarningIcon({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <SmartTooltip content={warnings.join("\n")} variant="warning">
      <span style={styles.warningIcon}>!</span>
    </SmartTooltip>
  );
}

function SmartTooltip({ children, content, variant = "info" }) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const anchorRef = useRef(null);

  function showTooltip(event) {
    event.stopPropagation();

    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const tooltipWidth = 260;
    const spacing = 10;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const top = rect.bottom + spacing;

    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

    setPosition({ top, left });
    setIsHovering(true);
  }

  function hideTooltip(event) {
    event.stopPropagation();
    setIsHovering(false);
  }

  return (
    <span
      ref={anchorRef}
      style={variant === "warning" ? styles.warningIconWrap : styles.infoWrap}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {children}

      {isHovering &&
        createPortal(
          <div
            style={{
              ...styles.smartTooltip,
              ...(variant === "warning" ? styles.smartWarningTooltip : {}),
              top: position.top,
              left: position.left,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}

export { InfoIcon, WarningIcon, SmartTooltip };