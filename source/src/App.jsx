import { useEffect, useRef } from "react";

import { styles } from "./appStyles";
import Sidebar from "./layout/Sidebar";

import OverviewTab from "./tabs/OverviewTab";
import ToolsTab from "./tabs/ToolsTab";
import AutomationTab from "./tabs/AutomationTab";
import SettingsModal from "./components/SettingsModal";
import MediaTab from "./tabs/MediaTab";
import { debugVideoClipUnderPlayhead } from "./api/resolveAPI";
import { uiStore, useUIStore } from "./store";

async function handleDebugVideoClip() {
  try {
    const result = await debugVideoClipUnderPlayhead(1);
    const debugText = JSON.stringify(result, null, 2);

    console.log("Video clip debug:", result);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(debugText);
      alert(`Debug copied to clipboard:\n\n${debugText}`);
      return;
    }

    alert(debugText);
  } catch (error) {
    console.error("Video clip debug failed:", error);
    alert(`Debug failed: ${String(error)}`);
  }
}

function App() {
  const {
    editMode,
    sidebarSide,
    settingsOpen,
    tabs,
    activeTab,
    dragTabId,
    tabDropTarget,
    isDraggingSidebar,
    dockPreviewSide,
  } = useUIStore();

  const latestDockPreviewSide = useRef(sidebarSide);

  const liveSidebarSide =
    isDraggingSidebar && dockPreviewSide ? dockPreviewSide : sidebarSide;

  useEffect(() => {
    latestDockPreviewSide.current = dockPreviewSide;
  }, [dockPreviewSide]);

  useEffect(() => {
    if (!isDraggingSidebar) return;

    function handleMouseMove(event) {
      const screenMiddle = window.innerWidth / 2;
      const nextSide = event.clientX < screenMiddle ? "left" : "right";

      latestDockPreviewSide.current = nextSide;
      uiStore.setDockPreviewSide(nextSide);
    }

    function handleMouseUp() {
      const finalSide = latestDockPreviewSide.current || sidebarSide;
      uiStore.finishSidebarDrag(finalSide);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSidebar, sidebarSide]);

  function startSidebarDrag(event) {
    if (!editMode) return;

    event.preventDefault();

    latestDockPreviewSide.current = sidebarSide;
    uiStore.startSidebarDrag(sidebarSide);
  }

  function renderActiveTab() {
    if (activeTab === "automation") return <AutomationTab />;
    if (activeTab === "tools") return <ToolsTab />;
    if (activeTab === "media") return <MediaTab />;
    return <OverviewTab />;
  }

  return (
    <div
      style={{
        ...styles.app,
        flexDirection: liveSidebarSide === "left" ? "row" : "row-reverse",
        transition: isDraggingSidebar ? "flex-direction 0s" : "all 0.22s ease",
      }}
    >
      <Sidebar
        editMode={editMode}
        setEditMode={uiStore.setEditMode}
        activeTab={activeTab}
        setActiveTab={uiStore.setActiveTab}
        tabs={tabs}
        dragTabId={dragTabId}
        tabDropTarget={tabDropTarget}
        isDraggingSidebar={isDraggingSidebar}
        onSidebarMouseDown={startSidebarDrag}
        setTabDropTarget={uiStore.setTabDropTarget}
        setTabs={uiStore.setTabs}
        startTabDrag={uiStore.startTabDrag}
        clearTabDrag={uiStore.clearTabDrag}
        onSettingsClick={uiStore.openSettings}
        onDebugClick={handleDebugVideoClip}
      />

      <main
        style={{
          ...localStyles.main,
          opacity: isDraggingSidebar ? 0.92 : 1,
        }}
      >
        {renderActiveTab()}
      </main>

      {isDraggingSidebar && (
        <>
          <div
            style={{
              ...localStyles.dockPreview,
              left: "12px",
              opacity: dockPreviewSide === "left" ? 1 : 0.22,
              transform:
                dockPreviewSide === "left" ? "scale(1)" : "scale(0.96)",
            }}
          >
            Dock Left
          </div>

          <div
            style={{
              ...localStyles.dockPreview,
              right: "12px",
              opacity: dockPreviewSide === "right" ? 1 : 0.22,
              transform:
                dockPreviewSide === "right" ? "scale(1)" : "scale(0.96)",
            }}
          >
            Dock Right
          </div>
        </>
      )}

      {settingsOpen && <SettingsModal onClose={uiStore.closeSettings} />}
    </div>
  );
}

const localStyles = {
  main: {
    flex: 1,
    padding: "24px",
    overflow: "auto",
    minWidth: 0,
    transition: "opacity 0.18s ease",
  },

  dockPreview: {
    position: "fixed",
    top: "12px",
    bottom: "12px",
    width: "260px",
    border: "2px dashed #5b35ff",
    backgroundColor: "rgba(91, 53, 255, 0.12)",
    color: "#cfc7ff",
    borderRadius: "14px",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    pointerEvents: "none",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  },
};

export default App;