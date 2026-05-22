const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "mediaLibraryConfig.json");

const DEFAULT_CONFIG = {
  bins: [],
};

function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}

function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      writeConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      bins: Array.isArray(parsed.bins) ? parsed.bins : [],
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "object") return Object.values(value).filter(Boolean);
  return [];
}

function createMediaReference(filePath) {
  return {
    id: createId("media"),
    name: path.basename(filePath),
    filePath,
    addedAt: new Date().toISOString(),
  };
}

function normalizeMedia(media) {
  return {
    id: media.id || createId("media"),
    name: media.name || path.basename(media.filePath || "Media"),
    filePath: media.filePath || "",
    addedAt: media.addedAt || new Date().toISOString(),
  };
}

function normalizeChildFolder(folder) {
  return {
    id: folder.id || createId("folder"),
    name: folder.name || "Folder",
    media: Array.isArray(folder.media) ? folder.media.map(normalizeMedia) : [],
    folders: Array.isArray(folder.folders)
      ? folder.folders.map(normalizeChildFolder)
      : [],
  };
}

function normalizeBin(bin) {
  return {
    id: bin.id || createId("bin"),
    name: bin.name || "Folder",
    type: bin.type === "power" ? "power" : "normal",
    media: Array.isArray(bin.media) ? bin.media.map(normalizeMedia) : [],
    folders: Array.isArray(bin.folders)
      ? bin.folders.map(normalizeChildFolder)
      : [],
  };
}

function getConfig() {
  const config = readConfig();

  return {
    ...config,
    bins: (config.bins || []).map(normalizeBin),
  };
}

async function getCurrentProject(getResolve) {
  const resolve = getResolve();

  if (!resolve) {
    throw new Error("Resolve is not connected.");
  }

  const projectManager = await resolve.GetProjectManager();
  const project = await projectManager.GetCurrentProject();

  if (!project) {
    throw new Error("No Resolve project is open.");
  }

  return project;
}

async function getMediaPool(project) {
  const mediaPool = await project.GetMediaPool();

  if (!mediaPool) {
    throw new Error("Could not access Media Pool.");
  }

  return mediaPool;
}

async function getResolveMediaPool(getResolve) {
  const project = await getCurrentProject(getResolve);
  return await getMediaPool(project);
}

async function getRootFolder(mediaPool) {
  const rootFolder = await mediaPool.GetRootFolder();

  if (!rootFolder) {
    throw new Error("Could not access Media Pool root folder.");
  }

  return rootFolder;
}

async function getFolderName(folder) {
  if (!folder || typeof folder.GetName !== "function") return "";

  try {
    return String((await folder.GetName()) || "");
  } catch {
    return "";
  }
}

async function getSubFolders(folder) {
  if (!folder || typeof folder.GetSubFolderList !== "function") return [];
  return toArray(await folder.GetSubFolderList());
}

async function findChildFolderByName(parentFolder, folderName) {
  const subFolders = await getSubFolders(parentFolder);

  for (const folder of subFolders) {
    if ((await getFolderName(folder)) === folderName) {
      return folder;
    }
  }

  return null;
}

async function findResolveFolderByPath(mediaPool, folderPath) {
  const rootFolder = await getRootFolder(mediaPool);
  const parts = String(folderPath || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  let currentFolder = rootFolder;

  for (const part of parts) {
    const nextFolder = await findChildFolderByName(currentFolder, part);

    if (!nextFolder) return null;

    currentFolder = nextFolder;
  }

  return currentFolder;
}

async function ensureResolveFolderPath(mediaPool, folderPath) {
  const rootFolder = await getRootFolder(mediaPool);
  const parts = String(folderPath || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  let currentFolder = rootFolder;

  for (const part of parts) {
    let nextFolder = await findChildFolderByName(currentFolder, part);

    if (!nextFolder) {
      nextFolder = await mediaPool.AddSubFolder(currentFolder, part);
    }

    if (!nextFolder) {
      throw new Error(`Could not create Resolve folder "${part}".`);
    }

    currentFolder = nextFolder;
  }

  return currentFolder;
}

function collectPowerFolderPaths(node, parentPath = "") {
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const paths = [currentPath];

  for (const child of node.folders || []) {
    paths.push(...collectPowerFolderPaths(child, currentPath));
  }

  return paths;
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;

    const found = findNodeById(node.folders || [], id);
    if (found) return found;
  }

  return null;
}

function findNodeInfoById(nodes, id, parentPath = "", inheritedType = null) {
  for (const node of nodes) {
    const type = node.type || inheritedType;
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.id === id) {
      return {
        node,
        type,
        path: currentPath,
      };
    }

    const found = findNodeInfoById(node.folders || [], id, currentPath, type);

    if (found) return found;
  }

  return null;
}

function removeNodeById(nodes, id) {
  return nodes.filter((node) => {
    if (node.id === id) return false;

    node.folders = removeNodeById(node.folders || [], id);
    return true;
  });
}

async function ensurePowerBinsToResolve(getResolve, config) {
  const powerBins = config.bins.filter((bin) => bin.type === "power");

  if (powerBins.length === 0) {
    return {
      synced: true,
      warning: "",
    };
  }

  try {
    const mediaPool = await getResolveMediaPool(getResolve);

    for (const bin of powerBins) {
      const paths = collectPowerFolderPaths(bin);

      for (const folderPath of paths) {
        await ensureResolveFolderPath(mediaPool, folderPath);
      }
    }

    return {
      synced: true,
      warning: "",
    };
  } catch (error) {
    return {
      synced: false,
      warning: String(error),
    };
  }
}

async function markMissingPowerBinsAsHidden(getResolve, config) {
  let mediaPool = null;

  try {
    mediaPool = await getResolveMediaPool(getResolve);
  } catch (error) {
    return {
      config,
      warning: String(error),
    };
  }

  const nextBins = [];

  for (const bin of config.bins || []) {
    if (bin.type !== "power") {
      nextBins.push(bin);
      continue;
    }

    const exists = await findResolveFolderByPath(mediaPool, bin.name);

    nextBins.push({
      ...bin,
      type: exists ? "power" : "normal",
    });
  }

  return {
    config: {
      ...config,
      bins: nextBins,
    },
    warning: "",
  };
}

async function deletePowerFolderFromResolve(getResolve, folderPath) {
  if (!folderPath) return;

  const mediaPool = await getResolveMediaPool(getResolve);
  const folder = await findResolveFolderByPath(mediaPool, folderPath);

  if (!folder) return;

  if (typeof mediaPool.DeleteFolders !== "function") {
    throw new Error("Resolve API does not support deleting Media Pool folders.");
  }

  await mediaPool.DeleteFolders([folder]);
}

async function importFilesIntoResolveFolder(getResolve, folderPath, filePaths) {
  const project = await getCurrentProject(getResolve);
  const mediaPool = await getMediaPool(project);
  const targetFolder = await ensureResolveFolderPath(mediaPool, folderPath);

  if (typeof mediaPool.SetCurrentFolder === "function") {
    await mediaPool.SetCurrentFolder(targetFolder);
  }

  if (typeof mediaPool.ImportMedia !== "function") {
    throw new Error("Resolve API does not support ImportMedia.");
  }

  const imported = await mediaPool.ImportMedia(filePaths);

  return toArray(imported);
}

async function returnState(getResolve, status = "synced", options = {}) {
  let config = getConfig();
  let hideWarning = "";

  if (options.hideMissingResolvePowerBins) {
    const result = await markMissingPowerBinsAsHidden(getResolve, config);
    config = result.config;
    hideWarning = result.warning;
    writeConfig(config);
  }

  const syncResult = options.skipEnsure
    ? { synced: !hideWarning, warning: hideWarning }
    : await ensurePowerBinsToResolve(getResolve, config);

  return {
    success: true,
    status,
    syncedAt: new Date().toISOString(),
    bins: config.bins,
    resolveSync: {
      ...syncResult,
      warning: syncResult.warning || hideWarning,
    },
  };
}

async function syncMediaLibrary(getResolve) {
  return await returnState(getResolve, "synced", {
    hideMissingResolvePowerBins: true,
    skipEnsure: true,
  });
}

async function createTopLevelBin(getResolve, payload) {
  const name = String(payload?.name || "").trim();

  if (!name) {
    throw new Error("Bin name is required.");
  }

  const type = payload?.type === "power" ? "power" : "normal";
  const config = getConfig();

  config.bins.push({
    id: createId("bin"),
    name,
    type,
    media: [],
    folders: [],
  });

  writeConfig(config);

  return await returnState(getResolve, "bin-created");
}

async function createChildFolder(getResolve, payload) {
  const parentId = payload?.parentId;
  const name = String(payload?.name || "Folder").trim() || "Folder";

  const config = getConfig();
  const parent = findNodeById(config.bins, parentId);

  if (!parent) {
    throw new Error("Parent folder not found.");
  }

  parent.folders = parent.folders || [];
  parent.folders.push({
    id: createId("folder"),
    name,
    media: [],
    folders: [],
  });

  writeConfig(config);

  return await returnState(getResolve, "folder-created");
}

async function updateTopLevelBin(getResolve, payload) {
  const binId = payload?.binId;
  const name = String(payload?.name || "").trim();
  const nextType = payload?.type === "power" ? "power" : "normal";

  const config = getConfig();
  const bin = config.bins.find((item) => item.id === binId);

  if (!bin) {
    throw new Error("Top-level bin not found.");
  }

  const previousType = bin.type === "power" ? "power" : "normal";
  const previousPath = bin.name;

  if (name) bin.name = name;
  bin.type = nextType;

  writeConfig(config);

  if (previousType === "power" && nextType === "normal") {
    await deletePowerFolderFromResolve(getResolve, previousPath);

    return await returnState(getResolve, "bin-hidden-from-resolve", {
      hideMissingResolvePowerBins: true,
      skipEnsure: true,
    });
  }

  if (previousType === "normal" && nextType === "power") {
    return await returnState(getResolve, "bin-shown-in-resolve");
  }

  return await returnState(getResolve, "bin-updated", {
    hideMissingResolvePowerBins: true,
    skipEnsure: true,
  });
}

async function moveResolveFolderContents(mediaPool, fromFolder, toFolder) {
  const clips =
    typeof fromFolder.GetClipList === "function"
      ? toArray(await fromFolder.GetClipList())
      : [];

  const subFolders =
    typeof fromFolder.GetSubFolderList === "function"
      ? toArray(await fromFolder.GetSubFolderList())
      : [];

  if (clips.length > 0 && typeof mediaPool.MoveClips === "function") {
    await mediaPool.MoveClips(clips, toFolder);
  }

  if (subFolders.length > 0 && typeof mediaPool.MoveFolders === "function") {
    await mediaPool.MoveFolders(subFolders, toFolder);
  }
}

async function renamePowerFolderInResolve(getResolve, oldPath, newPath) {
  if (!oldPath || !newPath || oldPath === newPath) return;

  const mediaPool = await getResolveMediaPool(getResolve);
  const oldFolder = await findResolveFolderByPath(mediaPool, oldPath);

  if (!oldFolder) return;

  const newFolder = await ensureResolveFolderPath(mediaPool, newPath);

  await moveResolveFolderContents(mediaPool, oldFolder, newFolder);

  if (typeof mediaPool.DeleteFolders === "function") {
    await mediaPool.DeleteFolders([oldFolder]);
  }
}

async function renameFolder(getResolve, payload) {
  const folderId = payload?.folderId;
  const name = String(payload?.name || "").trim();

  if (!name) {
    throw new Error("Folder name is required.");
  }

  const config = getConfig();

  const infoBefore = findNodeInfoById(config.bins, folderId);

  if (!infoBefore) {
    throw new Error("Folder not found.");
  }

  const oldPath = infoBefore.path;
  infoBefore.node.name = name;

  const infoAfter = findNodeInfoById(config.bins, folderId);
  const newPath = infoAfter.path;

  writeConfig(config);

  if (infoBefore.type === "power") {
    await renamePowerFolderInResolve(getResolve, oldPath, newPath);
  }

  return await returnState(getResolve, "folder-renamed", {
    hideMissingResolvePowerBins: true,
    skipEnsure: true,
  });
}

async function deleteFolder(getResolve, payload) {
  const folderId = payload?.folderId;
  const config = getConfig();

  const info = findNodeInfoById(config.bins, folderId);

  if (info?.type === "power") {
    await deletePowerFolderFromResolve(getResolve, info.path);
  }

  config.bins = removeNodeById(config.bins, folderId);

  writeConfig(config);

  return await returnState(getResolve, "folder-deleted", {
    hideMissingResolvePowerBins: true,
    skipEnsure: true,
  });
}

async function importMedia(getResolve, dialog, payload) {
  const folderId = payload?.folderId;
  const config = getConfig();
  const info = findNodeInfoById(config.bins, folderId);

  if (!info) {
    throw new Error("Folder not found.");
  }

  const result = await dialog.showOpenDialog({
    title: "Import Media",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Assets",
        extensions: [
          "mp4",
          "mov",
          "mkv",
          "avi",
          "wmv",
          "m4v",
          "webm",
          "mp3",
          "wav",
          "aiff",
          "aif",
          "flac",
          "aac",
          "m4a",
          "ogg",
          "jpg",
          "jpeg",
          "png",
          "tif",
          "tiff",
          "bmp",
          "gif",
          "exr",
          "dpx",
          "svg",
          "setting",
          "comp",
          "drfx",
          "cube",
        ],
      },
      {
        name: "All files",
        extensions: ["*"],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return await returnState(getResolve, "import-cancelled");
  }

  info.node.media = info.node.media || [];

  for (const filePath of result.filePaths) {
    info.node.media.push(createMediaReference(filePath));
  }

  writeConfig(config);

  if (info.type === "power") {
    await importFilesIntoResolveFolder(getResolve, info.path, result.filePaths);
  }

  return await returnState(getResolve, "media-imported");
}

function removeMediaByIdFromNodes(nodes, mediaId) {
  for (const node of nodes) {
    node.media = (node.media || []).filter((item) => item.id !== mediaId);

    removeMediaByIdFromNodes(node.folders || [], mediaId);
  }
}

function findMediaInNode(node, mediaId) {
  const media = (node.media || []).find((item) => item.id === mediaId);

  if (media) return media;

  for (const child of node.folders || []) {
    const found = findMediaInNode(child, mediaId);

    if (found) return found;
  }

  return null;
}

function getClipProperties(clip) {
  if (!clip || typeof clip.GetClipProperty !== "function") {
    return {};
  }

  try {
    const properties = clip.GetClipProperty();

    if (properties && typeof properties === "object") {
      return properties;
    }
  } catch {}

  return {};
}

function getClipFilePath(clip) {
  const properties = getClipProperties(clip);

  return String(
    properties["File Path"] ||
      properties["Filepath"] ||
      properties["Path"] ||
      properties["Source File Path"] ||
      ""
  );
}

function getClipName(clip) {
  if (clip && typeof clip.GetName === "function") {
    try {
      const name = clip.GetName();

      if (name) return String(name);
    } catch {}
  }

  const properties = getClipProperties(clip);

  return String(
    properties["Clip Name"] ||
      properties["Name"] ||
      properties["File Name"] ||
      properties["Filename"] ||
      ""
  );
}

async function getResolveFolderClips(folder) {
  if (!folder || typeof folder.GetClipList !== "function") {
    return [];
  }

  return toArray(await folder.GetClipList());
}

async function deleteMediaFromResolveFolder(getResolve, folderPath, mediaItem) {
  if (!folderPath || !mediaItem) return;

  const mediaPool = await getResolveMediaPool(getResolve);
  const folder = await findResolveFolderByPath(mediaPool, folderPath);

  if (!folder) return;

  const clips = await getResolveFolderClips(folder);

  const matchingClips = clips.filter((clip) => {
    const clipPath = getClipFilePath(clip);
    const clipName = getClipName(clip);

    return (
      (clipPath && clipPath === mediaItem.filePath) ||
      (clipName && clipName === mediaItem.name)
    );
  });

  if (matchingClips.length === 0) return;

  if (typeof mediaPool.DeleteClips === "function") {
    await mediaPool.DeleteClips(matchingClips);
  }
}

async function deleteMedia(getResolve, payload) {
  const folderId = payload?.folderId;
  const mediaId = payload?.mediaId;

  const config = getConfig();
  const info = findNodeInfoById(config.bins, folderId);

  if (!info) {
    throw new Error("Folder not found.");
  }

  const mediaItem = findMediaInNode([info.node], mediaId);

  if (!mediaItem) {
    throw new Error("Media item not found.");
  }

  if (info.type === "power") {
    await deleteMediaFromResolveFolder(getResolve, info.path, mediaItem);
  }

  removeMediaByIdFromNodes([info.node], mediaId);

  writeConfig(config);

  return await returnState(getResolve, "media-deleted", {
    hideMissingResolvePowerBins: true,
  });
}

function reorderArrayById(items, draggedId, targetId, position = "before") {
  const list = [...items];

  const fromIndex = list.findIndex((item) => item.id === draggedId);
  const targetIndex = list.findIndex((item) => item.id === targetId);

  if (fromIndex === -1 || targetIndex === -1 || fromIndex === targetIndex) {
    return list;
  }

  const [movedItem] = list.splice(fromIndex, 1);
  const updatedTargetIndex = list.findIndex((item) => item.id === targetId);
  const insertIndex =
    position === "after" ? updatedTargetIndex + 1 : updatedTargetIndex;

  list.splice(insertIndex, 0, movedItem);

  return list;
}

function findParentListInfo(nodes, nodeId, parentId = null) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return {
        parentId,
        list: nodes,
        node,
      };
    }

    const found = findParentListInfo(node.folders || [], nodeId, node.id);
    if (found) return found;
  }

  return null;
}

function isDescendantOf(node, possibleParentId) {
  if (!node || !possibleParentId) return false;

  for (const child of node.folders || []) {
    if (child.id === possibleParentId) return true;
    if (isDescendantOf(child, possibleParentId)) return true;
  }

  return false;
}

async function reorderFolders(getResolve, payload) {
  const draggedId = payload?.draggedId;
  const targetId = payload?.targetId;
  const position = ["before", "after", "inside"].includes(payload?.position)
    ? payload.position
    : "before";

  if (!draggedId || !targetId || draggedId === targetId) {
    return await returnState(getResolve, "folders-reordered");
  }

  const config = getConfig();

  const sourceInfo = findParentListInfo(config.bins, draggedId);
  const targetInfo = findParentListInfo(config.bins, targetId);

  if (!sourceInfo || !targetInfo) {
    throw new Error("Folder move source or target not found.");
  }

  if (isDescendantOf(sourceInfo.node, targetId)) {
    throw new Error("Cannot move a folder inside its own child.");
  }

  const sourceIndex = sourceInfo.list.findIndex((item) => item.id === draggedId);
  if (sourceIndex === -1) {
    throw new Error("Source folder not found.");
  }

  const [movedNode] = sourceInfo.list.splice(sourceIndex, 1);

  if (position === "inside") {
    targetInfo.node.folders = targetInfo.node.folders || [];
    targetInfo.node.folders.push(movedNode);
  } else {
    const freshTargetInfo = findParentListInfo(config.bins, targetId);

    if (!freshTargetInfo) {
      throw new Error("Target folder disappeared during move.");
    }

    const targetIndex = freshTargetInfo.list.findIndex(
      (item) => item.id === targetId
    );
    const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

    freshTargetInfo.list.splice(insertIndex, 0, movedNode);
  }

  writeConfig(config);

  return await returnState(getResolve, "folders-reordered");
}

async function reorderMedia(getResolve, payload) {
  const folderId = payload?.folderId;
  const draggedId = payload?.draggedId;
  const targetId = payload?.targetId;
  const position = payload?.position === "after" ? "after" : "before";

  const config = getConfig();
  const folder = findNodeById(config.bins, folderId);

  if (!folder) {
    throw new Error("Folder not found.");
  }

  folder.media = reorderArrayById(
    folder.media || [],
    draggedId,
    targetId,
    position
  );

  writeConfig(config);

  return await returnState(getResolve, "media-reordered");
}

function registerMediaLibraryIpc(ipcMain, getResolve, dialog) {
  ipcMain.handle("media-library-sync", async () => {
    return await syncMediaLibrary(getResolve);
  });

  ipcMain.handle("media-library-create-top-bin", async (event, payload) => {
    return await createTopLevelBin(getResolve, payload);
  });

  ipcMain.handle("media-library-create-child-folder", async (event, payload) => {
    return await createChildFolder(getResolve, payload);
  });

  ipcMain.handle("media-library-update-top-bin", async (event, payload) => {
    return await updateTopLevelBin(getResolve, payload);
  });

  ipcMain.handle("media-library-rename-folder", async (event, payload) => {
    return await renameFolder(getResolve, payload);
  });

  ipcMain.handle("media-library-delete-folder", async (event, payload) => {
    return await deleteFolder(getResolve, payload);
  });

  ipcMain.handle("media-library-import-media", async (event, payload) => {
    return await importMedia(getResolve, dialog, payload);
  });

  ipcMain.handle("media-library-delete-media", async (event, payload) => {
    return await deleteMedia(getResolve, payload);
  });

  ipcMain.handle("media-library-reorder-folders", async (event, payload) => {
    return await reorderFolders(getResolve, payload);
  });

  ipcMain.handle("media-library-reorder-media", async (event, payload) => {
    return await reorderMedia(getResolve, payload);
  });
}

module.exports = {
  registerMediaLibraryIpc,
};