import { useSyncExternalStore } from "react";

const defaultTabs = [
  { id: "overview", label: "Overview", status: "ready" },
  { id: "media", label: "Media", status: "beta" },
  { id: "tools", label: "Tools", status: "coming-soon" },
  { id: "automation", label: "Automation", status: "ready" },
];

function getDefaultTab(id) {
  return defaultTabs.find((tab) => tab.id === id);
}

function isTabAvailable(tabId) {
  const tab = getDefaultTab(tabId);
  return tab?.status !== "coming-soon";
}

function sanitizeTab(tab) {
  const defaultTab = getDefaultTab(tab.id);

  if (!defaultTab) return null;

  return {
    ...defaultTab,
    ...tab,
    label: defaultTab.label,
    status: defaultTab.status,
  };
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function readTabs() {
  const savedTabs = readJson("zlice-tabs", null);

  if (Array.isArray(savedTabs) && savedTabs.length > 0) {
    const sanitizedTabs = savedTabs.map(sanitizeTab).filter(Boolean);
    const savedIds = sanitizedTabs.map((tab) => tab.id);

    const missingDefaultTabs = defaultTabs.filter(
      (tab) => !savedIds.includes(tab.id)
    );

    return [...sanitizedTabs, ...missingDefaultTabs];
  }

  return defaultTabs;
}

function readActiveTab() {
  const savedActiveTab = localStorage.getItem("zlice-active-tab") || "overview";

  if (!isTabAvailable(savedActiveTab)) return "overview";

  return savedActiveTab;
}

function readInitialState() {
  return {
    editMode: false,
    settingsOpen: false,

    sidebarSide: localStorage.getItem("zlice-sidebar-side") || "left",
    activeTab: readActiveTab(),
    tabs: readTabs(),

    dragTabId: null,
    tabDropTarget: null,

    isDraggingSidebar: false,
    dockPreviewSide: null,
  };
}

let state = readInitialState();
const listeners = new Set();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(update) {
  const nextState =
    typeof update === "function" ? update(state) : { ...state, ...update };

  state = nextState;

  localStorage.setItem("zlice-sidebar-side", state.sidebarSide);
  localStorage.setItem("zlice-active-tab", state.activeTab);
  localStorage.setItem("zlice-tabs", JSON.stringify(state.tabs));

  emit();
}

export const uiStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  setEditMode(editMode) {
    setState({ editMode });
  },

  openSettings() {
    setState({ settingsOpen: true });
  },

  closeSettings() {
    setState({ settingsOpen: false });
  },

  setSidebarSide(sidebarSide) {
    setState({ sidebarSide });
  },

  setActiveTab(activeTab) {
    if (!isTabAvailable(activeTab)) return;

    setState({ activeTab });
  },

  setTabs(updater) {
    setState((currentState) => ({
      ...currentState,
      tabs:
        typeof updater === "function"
          ? updater(currentState.tabs)
          : updater,
    }));
  },

  startTabDrag(tabId) {
    setState({ dragTabId: tabId });
  },

  setTabDropTarget(tabDropTarget) {
    setState({ tabDropTarget });
  },

  clearTabDrag() {
    setState({
      dragTabId: null,
      tabDropTarget: null,
    });
  },

  startSidebarDrag(sidebarSide) {
    setState({
      isDraggingSidebar: true,
      dockPreviewSide: sidebarSide,
    });
  },

  setDockPreviewSide(dockPreviewSide) {
    setState({ dockPreviewSide });
  },

  finishSidebarDrag(sidebarSide) {
    setState({
      sidebarSide,
      isDraggingSidebar: false,
      dockPreviewSide: null,
    });
  },

  cancelSidebarDrag() {
    setState({
      isDraggingSidebar: false,
      dockPreviewSide: null,
    });
  },
};

export function useUIStore() {
  return useSyncExternalStore(
    uiStore.subscribe,
    uiStore.getSnapshot,
    uiStore.getSnapshot
  );
}