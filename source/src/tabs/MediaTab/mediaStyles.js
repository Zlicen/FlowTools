export const mediaStyles = {
  page: {
    height: "100%",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#999",
    fontSize: "13px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: "999px",
    padding: "8px 11px",
    color: "#ccc",
    fontSize: "12px",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#63e36b",
  },

  primaryButton: {
    backgroundColor: "#5b35ff",
    color: "white",
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#2a2a2a",
    color: "white",
    border: "1px solid #444",
    borderRadius: "9px",
    padding: "8px 11px",
    cursor: "pointer",
  },

  dangerButton: {
    backgroundColor: "#351818",
    color: "#ffb7b7",
    border: "1px solid #633",
    borderRadius: "9px",
    padding: "8px 11px",
    cursor: "pointer",
  },

  browser: {
    display: "grid",
    gridTemplateColumns: "340px minmax(0, 1fr)",
    gap: "12px",
    minHeight: 0,
    flex: 1,
  },

  sidebar: {
    backgroundColor: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "12px",
    overflow: "auto",
    minHeight: 0,
  },

  createBox: {
    backgroundColor: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
  },

  createTitle: {
    color: "#aaa",
    fontSize: "12px",
    marginBottom: "7px",
  },

  createRow: {
    display: "flex",
    gap: "7px",
  },

  input: {
    minWidth: 0,
    flex: 1,
    backgroundColor: "#0d0d0d",
    color: "white",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "8px 9px",
    outline: "none",
  },

  treeSection: {
    display: "grid",
    gap: "12px",
    marginTop: "12px",
  },

  treeGroup: {
  display: "grid",
  gap: "5px",
  position: "relative",
},

  treeTitle: {
    margin: "0 0 4px",
    color: "#ccc",
    fontSize: "13px",
  },

  treeEmpty: {
    color: "#666",
    fontSize: "12px",
    padding: "8px",
  },

  treeNode: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid #383838",
    borderRadius: "8px",
    padding: "7px 7px",
    cursor: "grab",
    marginBottom: "5px",
    transition: "background-color 120ms ease, border-color 120ms ease, opacity 120ms ease, transform 120ms ease",
  },

  dropLine: {
    height: "3px",
    backgroundColor: "#7357ff",
    borderRadius: "999px",
    margin: "3px 0 8px",
    boxShadow: "0 0 12px rgba(115, 87, 255, 0.8)",
  },

  treeIcon: {
    width: "18px",
  },

  treeName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "13px",
  },

  treeActions: {
    marginLeft: "auto",
    display: "flex",
    gap: "4px",
    transition: "opacity 120ms ease",
  },

  treeRenameInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#111",
    color: "white",
    border: "1px solid #555",
    borderRadius: "7px",
    padding: "5px 7px",
    outline: "none",
  },

  treeMiniButton: {
    backgroundColor: "#242424",
    color: "#ddd",
    border: "1px solid #3a3a3a",
    borderRadius: "6px",
    padding: "3px 6px",
    cursor: "pointer",
    fontSize: "11px",
  },

  treeActionButton: {
    fontSize: "12px",
    borderRadius: "7px",
  },

  treeDangerButton: {
    backgroundColor: "#351818",
    color: "#ffb7b7",
    border: "1px solid #633",
    borderRadius: "6px",
    padding: "3px 6px",
    cursor: "pointer",
    fontSize: "11px",
  },

  content: {
    backgroundColor: "#181818",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "14px",
    overflow: "auto",
    minHeight: 0,
  },

  details: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    height: "100%",
  },

  detailsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  detailsLabel: {
    color: "#888",
    fontSize: "12px",
    marginBottom: "4px",
  },

  detailsTitleInput: {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid transparent",
    borderRadius: "8px",
    padding: "6px 0",
    fontSize: "24px",
    fontWeight: "bold",
    outline: "none",
  },

  detailsActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  filesPanel: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "14px",
  },

  filesHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },

  filesTitle: {
    margin: 0,
    fontSize: "18px",
  },

  filesSubtitle: {
    margin: "4px 0 0",
    color: "#777",
    fontSize: "12px",
  },

  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "8px",
  },

  mediaCardWrap: {
    position: "relative",
    minWidth: 0,
  },

  mediaDropLineBefore: {
    position: "absolute",
    top: 0,
    left: "-5px",
    width: "3px",
    height: "100%",
    backgroundColor: "#7357ff",
    borderRadius: "999px",
    boxShadow: "0 0 12px rgba(115, 87, 255, 0.8)",
    zIndex: 3,
  },

  mediaDropLineAfter: {
    position: "absolute",
    top: 0,
    right: "-5px",
    width: "3px",
    height: "100%",
    backgroundColor: "#7357ff",
    borderRadius: "999px",
    boxShadow: "0 0 12px rgba(115, 87, 255, 0.8)",
    zIndex: 3,
  },

  mediaCard: {
    backgroundColor: "#181818",
    border: "1px solid #333",
    borderRadius: "9px",
    padding: "8px",
    minWidth: 0,
    cursor: "grab",
    transition: "background-color 120ms ease, opacity 120ms ease, transform 120ms ease",
  },

  mediaCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "5px",
  },

  mediaIcon: {
    fontSize: "18px",
  },

  mediaDeleteButton: {
    backgroundColor: "#351818",
    color: "#ffb7b7",
    border: "1px solid #633",
    borderRadius: "6px",
    padding: "2px 6px",
    cursor: "pointer",
    fontSize: "10px",
    transition: "opacity 120ms ease",
  },

  mediaName: {
    fontWeight: "bold",
    fontSize: "11px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  mediaPath: {
    marginTop: "3px",
    color: "#777",
    fontSize: "9px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  fileGridPlaceholder: {
    minHeight: "220px",
    border: "1px dashed #333",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    color: "#777",
    padding: "20px",
  },

  emptyState: {
    height: "100%",
    minHeight: "360px",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    color: "#777",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "6px",
  },

  emptyTitle: {
    margin: 0,
    color: "#ccc",
  },

  emptyText: {
    margin: "6px 0 0",
    color: "#777",
    maxWidth: "420px",
    lineHeight: 1.4,
  },

  treeNodeOuter: {
  position: "relative",
},

folderDropLine: {
  position: "fixed",
  height: "2px",
  borderRadius: "999px",
  backgroundColor: "#7357ff",
  boxShadow: "0 0 12px rgba(115, 87, 255, 0.85)",
  pointerEvents: "none",
  zIndex: 99999,
},

expandButton: {
  width: "18px",
  height: "18px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "#ccc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  flexShrink: 0,
},

resolveWarning: {
  color: "#ff6b6b",
  backgroundColor: "rgba(255, 75, 75, 0.08)",
  border: "1px solid rgba(255, 75, 75, 0.25)",
  borderRadius: "9px",
  padding: "8px 10px",
  fontSize: "12px",
  lineHeight: 1.35,
  fontWeight: "600",
},
};


