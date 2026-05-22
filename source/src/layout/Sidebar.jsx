import { IconButton } from "../components/ui";
import { getDragPreviewStyle } from "../hooks/useDragPreview";
import { reorderItems, useReorderDrag } from "../hooks/useReorderDrag";

function Sidebar({
  editMode,
  setEditMode,
  activeTab,
  setActiveTab,
  tabs,
  dragTabId,
  tabDropTarget,
  isDraggingSidebar,
  onSidebarMouseDown,
  setTabDropTarget,
  setTabs,
  startTabDrag,
  clearTabDrag,
  onSettingsClick,
  onDebugClick,
}) {
  const draggedTab = dragTabId ? { id: dragTabId } : null;

  function stopSidebarDrag(event) {
    event.stopPropagation();
  }

  function toggleEditMode(event) {
    event.stopPropagation();
    event.preventDefault();

    setEditMode(!editMode);
  }

  return (
    <aside
      onMouseDown={onSidebarMouseDown}
      style={{
        ...styles.sidebar,
        cursor: editMode ? "grab" : "default",
        opacity: isDraggingSidebar ? 0.75 : 1,
        transform: isDraggingSidebar ? "scale(0.985)" : "scale(1)",
      }}
    >
      <div style={styles.sidebarTop}>
        <div style={styles.logoRow}>
          <div style={styles.logo}>FlowTools</div>

          <IconButton
            size={32}
            variant="sync"
            title="Debug media pool"
            onMouseDown={stopSidebarDrag}
            onClick={(event) => {
              event.stopPropagation();
              onDebugClick?.();
            }}
          >
            🐞
          </IconButton>

          <IconButton
            size={32}
            variant="edit"
            active={editMode}
            title={editMode ? "Turn off edit mode" : "Turn on edit mode"}
            onMouseDown={stopSidebarDrag}
            onClick={toggleEditMode}
          >
            ✎
          </IconButton>

          <IconButton
            size={32}
            variant="default"
            title="Settings"
            onMouseDown={stopSidebarDrag}
            onClick={(event) => {
              event.stopPropagation();
              onSettingsClick?.();
            }}
          >
            ⚙
          </IconButton>
        </div>

        {editMode && (
          <div style={styles.editHint}>
            Edit mode on — drag empty sidebar space left/right or drag tabs to
            reorder.
          </div>
        )}
      </div>

      <nav style={styles.tabList}>
        {tabs.map((tab) => (
          <SidebarTab
            key={tab.id}
            tab={tab}
            editMode={editMode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            draggedTab={draggedTab}
            tabDropTarget={tabDropTarget}
            startTabDrag={startTabDrag}
            clearTabDrag={clearTabDrag}
            setTabDropTarget={setTabDropTarget}
            setTabs={setTabs}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarTab({
  tab,
  editMode,
  activeTab,
  setActiveTab,
  draggedTab,
  tabDropTarget,
  startTabDrag,
  clearTabDrag,
  setTabDropTarget,
  setTabs,
}) {
  const isActive = activeTab === tab.id;
  const isBeta = tab.status === "beta";
  const isComingSoon = tab.status === "coming-soon";

  const { isDragging, dragProps } = useReorderDrag({
    id: tab.id,
    type: "tab",
    disabled: !editMode,
    mode: "vertical",
    group: "sidebar-tabs",
    draggedItem: draggedTab,
    setDraggedItem: (nextTab) => {
      if (nextTab?.id) startTabDrag?.(nextTab.id);
      else clearTabDrag?.();
    },
    dropTarget: tabDropTarget,
    setDropTarget: setTabDropTarget,
    getDragPayload: () => ({ id: tab.id }),
    onReorderPreview: (dragItem, targetId, position) => {
      setTabs((currentTabs) =>
        reorderItems(currentTabs, dragItem.id, targetId, position)
      );
    },
  });

  function handleClick(event) {
    event.stopPropagation();

    if (editMode) return;
    if (isComingSoon) return;

    setActiveTab(tab.id);
  }

  return (
    <div style={styles.tabWrap}>
      <button
        {...dragProps}
        type="button"
        disabled={isComingSoon && !editMode}
        title={isComingSoon ? "Coming soon" : undefined}
        style={{
          ...styles.tabButton,
          ...(isActive ? styles.activeTabButton : {}),
          ...(isComingSoon ? styles.comingSoonTabButton : {}),
          cursor: editMode ? "grab" : isComingSoon ? "not-allowed" : "pointer",
          ...getDragPreviewStyle(isDragging),
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleClick}
      >
        {editMode && <span style={styles.tabDragIcon}>☰</span>}

        <span style={styles.tabLabel}>
          {isComingSoon && <span style={styles.lockIcon}>🔒</span>}
          {tab.label}
        </span>

        {isBeta && <span style={styles.betaBadge}>Beta</span>}
        {isComingSoon && <span style={styles.comingSoonBadge}>Soon</span>}
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    height: "100%",
    backgroundColor: "#181818",
    borderRight: "1px solid #2a2a2a",
    borderLeft: "1px solid #2a2a2a",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    flexShrink: 0,
    userSelect: "none",
    WebkitUserSelect: "none",
    transition: "transform 0.22s ease, opacity 0.22s ease",
  },

  sidebarTop: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logo: {
    flex: 1,
    fontSize: "22px",
    fontWeight: "bold",
  },

  editHint: {
    backgroundColor: "#242424",
    border: "1px dashed #555",
    borderRadius: "8px",
    padding: "10px",
    color: "#aaa",
    fontSize: "12px",
  },

  tabList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  tabWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  tabButton: {
    position: "relative",
    width: "100%",
    minHeight: "46px",
    backgroundColor: "#242424",
    color: "#aaa",
    border: "1px solid #303030",
    padding: "12px",
    paddingRight: "58px",
    borderRadius: "10px",
    textAlign: "left",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition:
      "background-color .15s ease, border-color .15s ease, opacity .15s ease, transform .15s ease",
    userSelect: "none",
    WebkitUserSelect: "none",
  },

  activeTabButton: {
    backgroundColor: "#303030",
    borderColor: "#444",
    color: "white",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
  },

  comingSoonTabButton: {
    backgroundColor: "#1b1b1b",
    borderColor: "#292929",
    color: "#666",
    opacity: 0.65,
  },

  tabLabel: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    minWidth: 0,
  },

  lockIcon: {
    fontSize: "12px",
    opacity: 0.85,
  },

  betaBadge: {
    position: "absolute",
    top: "6px",
    right: "8px",
    backgroundColor: "#5b35ff",
    color: "white",
    borderRadius: "999px",
    padding: "2px 6px",
    fontSize: "9px",
    lineHeight: 1,
    fontWeight: "800",
    letterSpacing: "0.02em",
  },

  comingSoonBadge: {
    position: "absolute",
    top: "6px",
    right: "8px",
    backgroundColor: "#333",
    color: "#aaa",
    border: "1px solid #444",
    borderRadius: "999px",
    padding: "2px 6px",
    fontSize: "9px",
    lineHeight: 1,
    fontWeight: "800",
    letterSpacing: "0.02em",
  },

  tabDragIcon: {
    color: "#777",
    fontSize: "13px",
  },
};

export default Sidebar;