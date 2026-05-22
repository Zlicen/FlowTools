async function setProjectMedia(project, settings) {
  if (!project) {
    throw new Error("Media Pool Items Set needs an active project.");
  }

  if (!settings.sourcePath) {
    throw new Error("Media Pool Items Set needs a source path.");
  }

  const mediaPool = await project.GetMediaPool();

  if (!mediaPool || typeof mediaPool.ImportMedia !== "function") {
    throw new Error("Resolve API does not support ImportMedia.");
  }

  const result = await mediaPool.ImportMedia([settings.sourcePath]);

  if (!result) {
    throw new Error("Failed to import media.");
  }
}

async function deleteProjectMedia() {
  throw new Error("Media Pool Items Delete is not implemented yet.");
}

async function renameProjectMedia() {
  throw new Error("Media Pool Items Rename is not implemented yet.");
}

async function moveProjectMedia() {
  throw new Error("Media Pool Items Move is not implemented yet.");
}

async function duplicateProjectMedia() {
  throw new Error("Media Pool Items Duplicate is not implemented yet.");
}

async function runProjectMediaTargetModule({
  project,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setProjectMedia(project, settings);
    return;
  }

  if (action === "delete") {
    await deleteProjectMedia(project, settings);
    return;
  }

  if (action === "rename") {
    await renameProjectMedia(project, settings);
    return;
  }

  if (action === "move") {
    await moveProjectMedia(project, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateProjectMedia(project, settings);
    return;
  }

  throw new Error(`Media Pool Items action "${action}" is not implemented.`);
}

module.exports = {
  runProjectMediaTargetModule,
};