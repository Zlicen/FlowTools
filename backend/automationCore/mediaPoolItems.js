function safeGetAllMediaPoolItemProperties(item) {
  if (!item || typeof item.GetClipProperty !== "function") {
    return {};
  }

  try {
    const properties = item.GetClipProperty();

    if (!properties || typeof properties !== "object") {
      return {};
    }

    return properties;
  } catch {
    return {};
  }
}

function safeGetMediaPoolItemProperty(item, key) {
  const properties = safeGetAllMediaPoolItemProperties(item);

  if (Object.prototype.hasOwnProperty.call(properties, key)) {
    return String(properties[key] || "");
  }

  return "";
}

function findPropertyByPossibleNames(item, possibleNames) {
  const properties = safeGetAllMediaPoolItemProperties(item);

  for (const name of possibleNames) {
    if (Object.prototype.hasOwnProperty.call(properties, name)) {
      return String(properties[name] || "");
    }
  }

  const lowerCaseMap = Object.entries(properties).reduce((map, [key, value]) => {
    map[String(key).toLowerCase()] = value;
    return map;
  }, {});

  for (const name of possibleNames) {
    const value = lowerCaseMap[String(name).toLowerCase()];

    if (value) {
      return String(value);
    }
  }

  return "";
}

function getMediaPoolItemName(item) {
  if (!item) return "";

  if (typeof item.GetName === "function") {
    try {
      const name = item.GetName();

      if (name) {
        return String(name);
      }
    } catch {}
  }

  return findPropertyByPossibleNames(item, [
    "Clip Name",
    "Name",
    "File Name",
    "Filename",
  ]);
}

function getMediaPoolItemFilePath(item) {
  return findPropertyByPossibleNames(item, [
    "File Path",
    "Filepath",
    "File Name",
    "Filename",
    "Path",
    "Source File Path",
    "Source Path",
  ]);
}

function getMediaPoolItemTypeText(item) {
  return [
    safeGetMediaPoolItemProperty(item, "Type"),
    safeGetMediaPoolItemProperty(item, "Video Codec"),
    safeGetMediaPoolItemProperty(item, "Audio Codec"),
    safeGetMediaPoolItemProperty(item, "Resolution"),
    safeGetMediaPoolItemProperty(item, "Format"),
  ]
    .join(" ")
    .toLowerCase();
}

function mediaPoolItemMatchesMediaType(item, mediaType) {
  if (!mediaType || mediaType === "any") {
    return true;
  }

  const text = getMediaPoolItemTypeText(item);

  if (mediaType === "video") {
    return (
      text.includes("video") ||
      Boolean(safeGetMediaPoolItemProperty(item, "Video Codec")) ||
      Boolean(safeGetMediaPoolItemProperty(item, "Resolution"))
    );
  }

  if (mediaType === "audio") {
    return (
      text.includes("audio") ||
      Boolean(safeGetMediaPoolItemProperty(item, "Audio Codec"))
    );
  }

  if (mediaType === "image") {
    return (
      text.includes("image") ||
      text.includes("still") ||
      text.includes("jpg") ||
      text.includes("jpeg") ||
      text.includes("png")
    );
  }

  if (mediaType === "transition") {
    return text.includes("transition");
  }

  return true;
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

async function getFolderName(folder) {
  if (!folder) return "";

  if (typeof folder.GetName === "function") {
    try {
      return String(await folder.GetName() || "");
    } catch {}
  }

  return "";
}

async function getFolderClipList(folder) {
  if (!folder || typeof folder.GetClipList !== "function") {
    return [];
  }

  return toArray(await folder.GetClipList());
}

async function getFolderSubFolderList(folder) {
  if (!folder || typeof folder.GetSubFolderList !== "function") {
    return [];
  }

  return toArray(await folder.GetSubFolderList());
}

async function collectMediaPoolItemsFromFolder(folder) {
  const clips = await getFolderClipList(folder);
  const subFolders = await getFolderSubFolderList(folder);

  const nestedClips = [];

  for (const subFolder of subFolders) {
    nestedClips.push(...(await collectMediaPoolItemsFromFolder(subFolder)));
  }

  return [...clips, ...nestedClips];
}

async function findFolderByPath(folder, wantedPath, parentPath = "") {
  const name = await getFolderName(folder);
  const currentPath = parentPath && name ? `${parentPath}/${name}` : name || parentPath;

  if (currentPath === wantedPath) {
    return folder;
  }

  const subFolders = await getFolderSubFolderList(folder);

  for (const subFolder of subFolders) {
    const found = await findFolderByPath(subFolder, wantedPath, currentPath);

    if (found) {
      return found;
    }
  }

  return null;
}

async function getProjectRootFolder(project) {
  const mediaPool = await project.GetMediaPool();

  if (!mediaPool) {
    throw new Error("Could not access the Media Pool.");
  }

  const rootFolder = await mediaPool.GetRootFolder();

  if (!rootFolder) {
    throw new Error("Could not access the Media Pool root folder.");
  }

  return rootFolder;
}

async function getAllMediaPoolItems(project) {
  const rootFolder = await getProjectRootFolder(project);
  return await collectMediaPoolItemsFromFolder(rootFolder);
}

async function getMediaPoolItemsFromBinPath(project, binPath) {
  const rootFolder = await getProjectRootFolder(project);
  const folder = await findFolderByPath(rootFolder, binPath);

  if (!folder) {
    throw new Error(`Could not find bin "${binPath}".`);
  }

  return await collectMediaPoolItemsFromFolder(folder);
}

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function filterMediaPoolItemsByFindMode(items, findBy, name, randomAmount = 1) {
  if (findBy === "name") {
    const cleanName = String(name || "").trim().toLowerCase();

    if (!cleanName) {
      return [];
    }

    return items.filter((item) =>
      getMediaPoolItemName(item).toLowerCase().includes(cleanName)
    );
  }

  if (findBy === "random") {
    return shuffleItems(items).slice(0, Math.max(1, Number(randomAmount || 1)));
  }

  return [];
}

module.exports = {
  safeGetAllMediaPoolItemProperties,
  safeGetMediaPoolItemProperty,
  getMediaPoolItemName,
  getMediaPoolItemFilePath,
  mediaPoolItemMatchesMediaType,
  getAllMediaPoolItems,
  getMediaPoolItemsFromBinPath,
  filterMediaPoolItemsByFindMode,
};