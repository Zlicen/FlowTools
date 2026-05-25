import { automationTheme } from "../automationTheme";

export const styles = {
  editorShell: {
    display: "grid",
    gap: 0,
    minHeight: 0,
    height: "100%",
    minWidth: 0,
    overflow: "hidden",
  },

  libraryPanel: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden auto",
  },

  libraryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    minWidth: 0,
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
  },

  panelSubtitle: {
    color: "#999",
    fontSize: "12px",
    marginTop: "4px",
  },

  categoryList: {
    display: "grid",
    gap: "10px",
    minWidth: 0,
  },

  categoryCard: {
    backgroundColor: "#161616",
    border: "1px solid #2b2b2b",
    borderRadius: "12px",
    overflow: "hidden",
    minWidth: 0,
  },

  categoryHeader: {
    width: "100%",
    border: "none",
    backgroundColor: "#202020",
    color: "white",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    textAlign: "left",
    minWidth: 0,
  },

  categoryHeaderName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  libraryModuleList: {
    display: "grid",
    gap: "7px",
    padding: "8px",
    minWidth: 0,
  },

  libraryModule: {
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: "bold",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    textAlign: "left",
    minWidth: 0,
  },

  libraryModuleName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  workspace: {
    minHeight: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflow: "hidden",
  },

  workspaceTop: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  workspaceTitle: {
    margin: 0,
    fontSize: "22px",
  },

  workspaceSubtitle: {
    color: "#999",
    fontSize: "12px",
    marginTop: "4px",
  },

  addBlockButton: {
    backgroundColor: automationTheme.accentColor,
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "9px 12px",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  blockList: {
    minHeight: 0,
    minWidth: 0,
    overflowY: "auto",
    overflowX: "hidden",
    display: "grid",
    gap: "12px",
    paddingRight: "4px",
  },

  emptyDrop: {
    border: "1px dashed #444",
    borderRadius: "14px",
    padding: "30px",
    color: "#888",
    textAlign: "center",
  },

  blockCard: {
    position: "relative",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    minWidth: 0,
    overflow: "hidden",
  },

  blockHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    minWidth: 0,
  },

  blockTitleArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  blockMoveButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flexShrink: 0,
  },

  blockMoveButton: {
    width: "22px",
    height: "18px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontSize: "10px",
    lineHeight: 1,
  },

  disabledBlockMoveButton: {
    opacity: 0.3,
    cursor: "not-allowed",
  },

  blockNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,.12)",
    display: "grid",
    placeItems: "center",
    fontWeight: "bold",
    flexShrink: 0,
  },

  blockNameButton: {
    border: "none",
    background: "transparent",
    color: "inherit",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
    maxWidth: "220px",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },

  blockNameInput: {
    width: "220px",
    maxWidth: "220px",
    backgroundColor: "rgba(0,0,0,.2)",
    color: "inherit",
    border: "1px solid rgba(255,255,255,.25)",
    borderRadius: "8px",
    padding: "6px 8px",
    fontWeight: "bold",
    outline: "none",
  },

  blockStats: {
    justifySelf: "center",
    color: "#ddd",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 0,
  },

  blockButtons: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
  },

  renameButton: {
    border: "none",
    borderRadius: "8px",
    padding: "7px 9px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  runBlockButton: {
  border: "none",
  borderRadius: "8px",
  padding: "7px 10px",
  backgroundColor: "#15803d",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  whiteSpace: "nowrap",
},

  iconButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  iconDeleteButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,60,60,.18)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  expandButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  blockBody: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    minWidth: 0,
  },

  blockLane: {
    minHeight: "120px",
    backgroundColor: "rgba(0,0,0,.16)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "12px",
    padding: "10px",
    minWidth: 0,
  },

  availableDropSection: {
    borderColor: "rgba(115,87,255,.55)",
  },

  activeDropSection: {
    boxShadow: "0 0 0 1px rgba(115,87,255,.55)",
  },

  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  laneTitle: {
    margin: 0,
    fontSize: "13px",
  },

  pillList: {
    display: "grid",
    gap: "7px",
    minWidth: 0,
  },

  dropZone: {
    minHeight: "40px",
    border: "1px dashed rgba(255,255,255,.14)",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,.55)",
    fontSize: "12px",
  },

  availableDropZone: {
    borderColor: "rgba(115,87,255,.6)",
    color: "#d8d0ff",
  },

  moduleWrap: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  moduleDropLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "3px",
    borderRadius: "999px",
    backgroundColor: "#7357ff",
    boxShadow: "0 0 10px rgba(115,87,255,.75)",
    pointerEvents: "none",
    zIndex: 20,
  },

  modulePill: {
    border: "none",
    borderRadius: "10px",
    padding: "9px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "grab",
    fontWeight: "bold",
    minWidth: 0,
  },

  selectedModulePill: {
    boxShadow: "0 0 0 2px rgba(255,255,255,.55)",
  },

  warningModulePill: {
    boxShadow: "0 0 0 2px rgba(255,60,60,.5)",
  },

  draggingItem: {
    opacity: 0.45,
  },

  pillName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
  },

  pillButtons: {
    display: "flex",
    gap: "4px",
    flexShrink: 0,
  },

  pillMiniButton: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "rgba(0,0,0,.2)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  pillMiniDeleteButton: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "rgba(255,0,0,.2)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  infoWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f2f2f2",
  },

  infoIcon: {
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    display: "inline-grid",
    placeItems: "center",
    backgroundColor: "rgba(255,255,255,.25)",
    fontSize: "11px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  warningIconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  warningIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    display: "inline-grid",
    placeItems: "center",
    backgroundColor: "#ff3b3b",
    color: "white",
    fontSize: "12px",
    fontWeight: "900",
    flexShrink: 0,
  },

  smartTooltip: {
    position: "fixed",
    width: "260px",
    backgroundColor: "#080808",
    border: "1px solid #555",
    borderRadius: "8px",
    padding: "10px",
    color: "#f2f2f2",
    fontSize: "12px",
    fontWeight: 400,
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.45,
    zIndex: 999999,
    boxShadow: "0 10px 32px rgba(0,0,0,.75)",
    pointerEvents: "none",
    whiteSpace: "normal",
    textTransform: "none",
  },

  smartWarningTooltip: {
    borderColor: "#ff3b3b",
  },

  settingsPanel: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden auto",
  },

  settingsTitle: {
    margin: "0 0 12px",
    fontSize: "18px",
  },

  settingsEmpty: {
    color: "#888",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  settingsModuleTopRow: {
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #333",
  },

  settingsModuleName: {
    margin: 0,
    fontSize: "16px",
  },

  settingsModuleBlock: {
    marginTop: "4px",
    color: "#999",
    fontSize: "12px",
  },

  floatingDrag: {
    position: "fixed",
    zIndex: 10000,
    backgroundColor: "#111",
    border: "1px solid #555",
    borderRadius: "10px",
    color: "white",
    padding: "10px 12px",
    pointerEvents: "none",
    boxShadow: "0 12px 30px rgba(0,0,0,.45)",
  },

  blockDropLine: {
    height: "3px",
    borderRadius: "999px",
    backgroundColor: "#7357ff",
    boxShadow: "0 0 10px rgba(115,87,255,.65)",
    margin: "6px 0",
  },

  runResult: {
    margin: 0,
    border: "1px solid",
    borderRadius: "12px",
    padding: "12px",
    backgroundColor: "#101010",
    overflow: "auto",
  },
};