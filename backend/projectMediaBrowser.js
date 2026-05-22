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

async function getSubFolders(folder) {
  if (!folder || typeof folder.GetSubFolderList !== "function") {
    return [];
  }

  return toArray(await folder.GetSubFolderList());
}

async function collectFolders(folder, parentPath = "") {
  const name = await getFolderName(folder);
  const path = parentPath && name ? `${parentPath}/${name}` : name || parentPath;

  const result = [];

  if (path) {
    result.push({
      name,
      path,
    });
  }

  const subFolders = await getSubFolders(folder);

  for (const subFolder of subFolders) {
    result.push(...(await collectFolders(subFolder, path)));
  }

  return result;
}

async function getProjectBins(resolve) {
  if (!resolve) {
    throw new Error("Resolve is not connected.");
  }

  const projectManager = await resolve.GetProjectManager();
  const project = await projectManager.GetCurrentProject();

  if (!project) {
    throw new Error("No Resolve project is open.");
  }

  const mediaPool = await project.GetMediaPool();

  if (!mediaPool) {
    throw new Error("Could not access Media Pool.");
  }

  const rootFolder = await mediaPool.GetRootFolder();

  if (!rootFolder) {
    throw new Error("Could not access Media Pool root folder.");
  }

  return await collectFolders(rootFolder);
}

async function getPowerBins(resolve) {
  if (!resolve) return [];

  try {
    if (typeof resolve.GetMediaStorage !== "function") {
      return [];
    }

    const mediaStorage = await resolve.GetMediaStorage();

    if (!mediaStorage || typeof mediaStorage.GetPowerBins !== "function") {
      return [];
    }

    const powerBins = toArray(await mediaStorage.GetPowerBins());

    const result = [];

    for (const folder of powerBins) {
      result.push(...(await collectFolders(folder)));
    }

    return result;
  } catch {
    return [];
  }
}

function registerProjectMediaBrowserIpc(ipcMain, getResolve) {
  ipcMain.handle("project-media-get-bins", async () => {
    const resolve = getResolve();

    return {
      success: true,
      bins: await getProjectBins(resolve),
      powerBins: await getPowerBins(resolve),
    };
  });
}

module.exports = {
  registerProjectMediaBrowserIpc,
};