function DockZone({
  side,
  sidebarSide,
  dockPreviewSide,
  editMode,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}) {
  const isActive = sidebarSide === side;
  const isPreview = dockPreviewSide === side;

  return (
    <div
      style={{
        ...styles.dockZone,
        ...(isActive ? styles.activeDockZone : {}),
        ...(isPreview ? styles.previewDockZone : {}),
      }}
      onDragOver={(event) => onDragOver(side, event)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(side, event)}
    >
      {isPreview && !isActive && (
        <div style={styles.dockPreview}>
          Dock sidebar here
        </div>
      )}

      {isActive && children}
    </div>
  );
}

const styles = {
  dockZone: {
    width: "280px",
    height: "100%",
    display: "flex",
    position: "relative",
    transition: "background-color 0.12s ease, outline 0.12s ease",
  },

  activeDockZone: {
    backgroundColor: "#151515",
  },

  previewDockZone: {
    backgroundColor: "rgba(91, 53, 255, 0.16)",
    outline: "2px solid #5b35ff",
    outlineOffset: "-2px",
  },

  dockPreview: {
    position: "absolute",
    inset: "12px",
    border: "2px dashed #5b35ff",
    borderRadius: "14px",
    color: "#cfc7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
    backgroundColor: "rgba(91, 53, 255, 0.08)",
    pointerEvents: "none",
  },
};

export default DockZone;