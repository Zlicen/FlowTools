import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as mediaAPI from "../api/mediaAPI";
import { findNodeById, getFolderType } from "../tabs/MediaTab/mediaTreeHelpers";

const MediaStoreContext = createContext(null);

export function MediaStoreProvider({ children }) {
  const [bins, setBins] = useState([]);
  const [syncStatus, setSyncStatus] = useState("Not synced");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [binName, setBinName] = useState("");

  const [draggedFolder, setDraggedFolder] = useState(null);
  const [folderDropTarget, setFolderDropTarget] = useState(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState({});

  const [draggedMedia, setDraggedMedia] = useState(null);
  const [mediaDropTarget, setMediaDropTarget] = useState(null);

  const selectedFolder = useMemo(
    () => findNodeById(bins, selectedFolderId),
    [bins, selectedFolderId]
  );

  const selectedFolderType = useMemo(
    () => (selectedFolder ? getFolderType(bins, selectedFolder.id) : null),
    [bins, selectedFolder]
  );

  function collectFolderIds(nodes, result = {}) {
    for (const node of nodes || []) {
      result[node.id] = true;
      collectFolderIds(node.folders || [], result);
    }

    return result;
  }

  function applyBins(nextBins, syncedAt) {
    const cleanBins = Array.isArray(nextBins) ? nextBins : [];

    setBins(cleanBins);
    setSyncStatus(
      `Synced ${new Date(syncedAt || Date.now()).toLocaleTimeString()}`
    );

    setExpandedFolderIds((current) => ({
      ...collectFolderIds(cleanBins),
      ...current,
    }));

    setSelectedFolderId((currentId) => {
      if (currentId && findNodeById(cleanBins, currentId)) return currentId;
      return cleanBins[0]?.id || null;
    });
  }

  async function runSync() {
    setIsSyncing(true);
    setSyncStatus("Syncing...");

    try {
      const result = await mediaAPI.syncMediaLibrary();

      if (result?.success) {
        applyBins(result.bins, result.syncedAt);
      } else {
        setSyncStatus("Sync failed");
      }
    } catch (error) {
      console.error(error);
      setSyncStatus(`Sync failed: ${String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  }

  async function runAction(status, actionName, payload) {
    setIsSyncing(true);
    setSyncStatus(status);

    try {
      const action = mediaAPI[actionName];

      if (typeof action !== "function") {
        throw new Error(`Unknown media action: ${actionName}`);
      }

      const result = await action(payload);

      if (result?.success) {
        applyBins(result.bins, result.syncedAt);
      } else {
        setSyncStatus("Action failed");
      }
    } catch (error) {
      console.error(error);
      setSyncStatus(`Action failed: ${String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  }

  async function createTopBin() {
    const name = binName.trim();
    if (!name) return;

    await runAction("Creating bin...", "createTopBin", {
      name,
      type: "normal",
    });

    setBinName("");
  }

  async function createChildFolder(parentId) {
    await runAction("Creating folder...", "createChildFolder", {
      parentId,
      name: "Folder",
    });
  }

  async function renameFolder(folderId, name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return;

    await runAction("Renaming folder...", "renameFolder", {
      folderId,
      name: cleanName,
    });
  }

  async function toggleResolveVisibility(bin) {
    if (!bin) return;

    await runAction("Updating Resolve visibility...", "updateTopBin", {
      binId: bin.id,
      name: bin.name,
      type: bin.type === "power" ? "normal" : "power",
    });
  }

  async function deleteFolder(folderId) {
    await runAction("Deleting folder...", "deleteFolder", {
      folderId,
    });

    setSelectedFolderId((currentId) =>
      currentId === folderId ? null : currentId
    );
  }

  async function importMedia(folderId) {
    await runAction("Importing media...", "importMedia", {
      folderId,
    });
  }

  async function deleteMedia(folderId, mediaId) {
    await runAction("Deleting media...", "deleteMedia", {
      folderId,
      mediaId,
    });
  }

  async function reorderFolders(payload) {
    if (!payload?.draggedId || !payload?.targetId) return;
    if (payload.draggedId === payload.targetId) return;

    await runAction("Moving folder...", "reorderFolders", payload);
  }

  async function reorderMedia(folderId, draggedId, targetId, position = "before") {
    if (!draggedId || !targetId || draggedId === targetId) return;

    await runAction("Reordering media...", "reorderMedia", {
      folderId,
      draggedId,
      targetId,
      position,
    });
  }

  function toggleFolderExpanded(folderId) {
    setExpandedFolderIds((current) => ({
      ...current,
      [folderId]: !current[folderId],
    }));
  }

  function setFolderExpanded(folderId, expanded) {
    setExpandedFolderIds((current) => ({
      ...current,
      [folderId]: expanded,
    }));
  }

  useEffect(() => {
    runSync();

    function handleWindowFocus() {
      runSync();
    }

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const value = {
    bins,
    selectedFolder,
    selectedFolderId,
    selectedFolderType,
    syncStatus,
    isSyncing,

    binName,
    setBinName,

    draggedFolder,
    setDraggedFolder,
    folderDropTarget,
    setFolderDropTarget,
    expandedFolderIds,
    toggleFolderExpanded,
    setFolderExpanded,

    draggedMedia,
    setDraggedMedia,
    mediaDropTarget,
    setMediaDropTarget,

    runSync,
    setSelectedFolderId,
    createTopBin,
    createChildFolder,
    renameFolder,
    toggleResolveVisibility,
    deleteFolder,
    importMedia,
    deleteMedia,
    reorderFolders,
    reorderMedia,
  };

  return (
    <MediaStoreContext.Provider value={value}>
      {children}
    </MediaStoreContext.Provider>
  );
}

export function useMediaStore() {
  const value = useContext(MediaStoreContext);

  if (!value) {
    throw new Error("useMediaStore must be used inside MediaStoreProvider");
  }

  return value;
}