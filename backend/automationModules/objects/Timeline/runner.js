async function getTimelineName(timeline) {
  if (!timeline) return "";

  if (typeof timeline.GetName === "function") {
    try {
      return String((await timeline.GetName()) || "");
    } catch {}
  }

  return "";
}

async function setTimeline(timeline, settings) {
  if (!timeline) {
    throw new Error("Timeline Set needs an active timeline.");
  }

  const name = String(settings.name || "").trim();

  if (!name) {
    return;
  }

  if (typeof timeline.SetName !== "function") {
    throw new Error("Resolve API does not support timeline SetName.");
  }

  const currentName = await getTimelineName(timeline);

  if (currentName === name) {
    return;
  }

  const ok = await timeline.SetName(name);

  if (!ok) {
    throw new Error("Failed to set timeline name.");
  }
}

async function renameTimeline(timeline, settings) {
  if (!timeline) {
    throw new Error("Timeline Rename needs an active timeline.");
  }

  const newName = String(settings.newName || "").trim();

  if (!newName) {
    throw new Error("Timeline Rename needs a new name.");
  }

  if (typeof timeline.SetName !== "function") {
    throw new Error("Resolve API does not support timeline SetName.");
  }

  const ok = await timeline.SetName(newName);

  if (!ok) {
    throw new Error("Failed to rename timeline.");
  }
}

async function duplicateTimeline() {
  throw new Error("Timeline Duplicate is not implemented yet.");
}

async function deleteTimeline() {
  throw new Error("Timeline Delete is not implemented yet.");
}

async function renderTimeline(project) {
  if (!project || typeof project.AddRenderJob !== "function") {
    throw new Error("Resolve API does not support AddRenderJob.");
  }

  const jobId = await project.AddRenderJob();

  if (!jobId) {
    throw new Error("Failed to add render job for timeline.");
  }
}

async function runTimelineTargetModule({
  project,
  timeline,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setTimeline(timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameTimeline(timeline, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateTimeline(project, timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteTimeline(project, timeline, settings);
    return;
  }

  if (action === "render") {
    await renderTimeline(project, timeline, settings);
    return;
  }

  throw new Error(`Timeline action "${action}" is not implemented.`);
}

module.exports = {
  runTimelineTargetModule,
};